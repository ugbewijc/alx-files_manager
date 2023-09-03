import { MongoClient } from 'mongodb';

class DBCient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.myClient = MongoClient(`mongodb://${host}:${port}/${database}`);
    this.myClient.connect();
  }

  isAlive() {
    return this.myClient.isConnected();
  }

  async nbUsers() {
    /* returns number of documents in users */
    const myDB = this.myClient.db();
    const collection = myDB.collection('users');
    return collection.countDocuments();
    /* can be replaced by this.myClient.db().collection('users').countDocuments() */
  }

  async nbFiles() {
    return this.myClient.db().collection('files').countDocuments();
  }
}

const dbClient = new DBCient();
export default dbClient;
