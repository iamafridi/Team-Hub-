const admin = require('firebase-admin')
const path = require('path')

let initialized = false

if (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.CI) {
  try {
    let serviceAccount

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim()
      serviceAccount = JSON.parse(raw)
      if (typeof serviceAccount === 'string') {
        serviceAccount = JSON.parse(serviceAccount)
      }
    } else {
      const keyPath = path.resolve(__dirname, '../../service-account.json')
      serviceAccount = require(keyPath)
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    initialized = true
  } catch (err) {
    console.warn('Firebase Admin init failed, falling back to dev auth:', err.message)
  }
}

module.exports = admin
module.exports.isInitialized = () => initialized
