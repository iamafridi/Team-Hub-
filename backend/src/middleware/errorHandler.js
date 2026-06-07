const Sentry = require('@sentry/node')

function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err)
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: message,
      stack: err.stack,
    })
  }

  return res.status(statusCode).json({
    error: message,
  })
}

module.exports = errorHandler
