// src/services/appwriteClient.js
const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new sdk.Databases(client);
const functions = new sdk.Functions(client);
const storage = new sdk.Storage(client);
const account = new sdk.Account(client);

module.exports = { client, databases, functions, storage, account, sdk };
