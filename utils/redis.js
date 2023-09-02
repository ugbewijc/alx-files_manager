/*
 * Redis Client Class
 */

import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
  /*
   *class constructors
   */
  constructor() {
    this.client = createClient();
    this.isRedisConnected = true;
    this.client.on('connect', () => {
      this.isRedisConnected = true;
    });
    this.client.on('error', (error) => {
      this.isRedisConnected = false;
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  /*
   *
   * Checks if redis client connection to the Redis server is active.
   * @returns {boolean}
   */

  isAlive() {
    return this.isRedisConnected; 
  }

  /*
   * Retrieves the value of a given key.
   * @param {String} key: key value of the item to retrieve.
   * @returns {Object}
   */

  async get(key) {
    return promisify(this.client.get).bind(this.client)(key);
  }

  /*
   * Stores a key and its value along with expiration time.
   * @param {String} key : key of the item to store.
   * @param {String | Number | Boolean} value : value of item to store.
   * @param {Number} duration : expiration time of the item in seconds.
   */
  async set(key, value, duration) {
    const setKey = promisify(this.client.set).bind(this.client);
    await setKey(key, value);
    await this.client.expire(key, duration);
  }

  /*
   * Removes the value of a given key from the server.
   * @param {String} key : key of the item to remove.
   */
  async del(key) {
    await promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
