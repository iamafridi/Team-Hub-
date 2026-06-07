function getVisibilityFilter(req, ownField = 'ownerId') {
  if (process.env.ALLOW_DEV_AUTH === 'true') return {}
  if (req.memberRole === 'ADMIN' || req.memberRole === 'MODERATOR') return {}
  return { [ownField]: req.userId }
}

module.exports = { getVisibilityFilter }
