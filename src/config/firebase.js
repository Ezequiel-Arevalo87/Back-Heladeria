const {initializeApp, getApps, cert} = require('firebase-admin/app');
const {getMessaging} = require('firebase-admin/messaging');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./firebaseServiceAccount.json');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = {
  messaging: () => getMessaging(),
};