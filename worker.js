import Queue from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = Queue('thumbnail generation');
const userQueue = Queue('send welcome email');

/*
 * Jobs consumer : Thumbnail
 */
fileQueue.process(10, async (job) => {
  const { fileId, userId } = job.data;
  /*
   * Validate file and user l
   */
  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');
  const filesCollection = dbClient.filesCollection();
  const _id = ObjectId.isValid(fileId) ? new ObjectId(fileId) : fileId;
  const _userId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  const file = await filesCollection.findOne({ _id, userId: _userId });

  /*
   * Check if file exists
   */
  if (!file) throw new Error('File not found');
  if (!fs.existsSync(file.localPath)) throw (new Error('File not found'));

  /*
   * Create thumbnails
   */
  const thumbnail100 = await imageThumbnail(file.localPath, { width: 100 });
  const thumbnail250 = await imageThumbnail(file.localPath, { width: 250 });
  const thumbnail500 = await imageThumbnail(file.localPath, { width: 500 });

  /*
   * Save thumbnails
   */
  fs.writeFileSync(`${file.localPath}_100`, thumbnail100);
  fs.writeFileSync(`${file.localPath}_250`, thumbnail250);
  fs.writeFileSync(`${file.localPath}_500`, thumbnail500);
  return Promise.resolve(`Thumbnails for ${file.name} created successfully.`);
});

fileQueue.on('completed', (job, result) => {
  console.log(`Thumbnail generation job #${job.id} completed: ${result}`);
});

/*
 * Job consumer : Email
 */
userQueue.process(20, async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error('Missing userId');
  const userCollection = dbClient.usersCollection();
  const _id = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  const user = await userCollection.findOne({ _id });
  if (!user) throw new Error('User not found');
  return Promise.resolve(`Welcome ${user.email}`);
});

userQueue.on('completed', (_job, result) => {
  console.log(result);
});
