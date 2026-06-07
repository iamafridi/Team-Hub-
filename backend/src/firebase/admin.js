const admin = require('firebase-admin')
const path = require('path')

if (!admin.apps.length) {
  let serviceAccount

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  } else {
    const keyPath = path.resolve(__dirname, '../../service-account.json')
    serviceAccount = require(keyPath)
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

module.exports = admin
