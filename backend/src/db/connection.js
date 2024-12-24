/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config();
const mongo_db_password = process.env.MONGO_DB_PASSWORD;

let url = `mongodb+srv://nilay:${mongo_db_password}@cluster0.6zfqt.mongodb.net/`;

console.log('Connection URL:', url);
console.log('AAA');
console.log(`password: ${mongo_db_password}`);

const connectToMongo = async () => {
  try {
    await mongoose.connect(url);

    const db = mongoose.connection;

    db.once('open', () => {
      console.log('Database connected to MongoDB');
    });

    db.on('error', (err) => {
      console.error('Database connection error: ', err);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

const dropAllCollections = async () => {
  try {
    const db = await mongoose.connection.asPromise();

    if (!db.readyState) {
      console.error('Database is not connected. Unable to drop collections.');
      return;
    }
    const collections = await db.db.listCollections().toArray(); 
    for (const collection of collections) {
      await db.db.dropCollection(collection.name); 
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log('All collections dropped.');
  } catch (error) {
    console.error('Error dropping collections:', error);
    throw error; 
  }
};

module.exports = { connectToMongo, dropAllCollections };
