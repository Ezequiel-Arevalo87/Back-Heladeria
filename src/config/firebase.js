const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccount = require('./firebaseServiceAccount.json');

initializeApp({
  credential: cert(serviceAccount)
});

const admin = {
  messaging: getMessaging
};

module.exports = admin;