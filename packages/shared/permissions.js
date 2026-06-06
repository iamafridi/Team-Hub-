const PERMISSIONS = {
  // Member Management (Admin only)
  INVITE_MEMBER: ['ADMIN'],
  REMOVE_MEMBER: ['ADMIN'],
  CHANGE_MEMBER_ROLE: ['ADMIN'],
  CHANGE_MEMBER_STATUS: ['ADMIN'],

  // Workspace Management (Admin only)
  UPDATE_WORKSPACE: ['ADMIN'],
  DELETE_WORKSPACE: ['ADMIN'],

  // Goal Management
  CREATE_GOAL: ['ADMIN', 'MODERATOR', 'MEMBER'],
  UPDATE_ANY_GOAL: ['ADMIN', 'MODERATOR'],
  UPDATE_OWN_GOAL: ['ADMIN', 'MODERATOR', 'MEMBER'],
  DELETE_GOAL: ['ADMIN', 'MODERATOR'],

  // Announcement Management
  CREATE_ANNOUNCEMENT: ['ADMIN', 'MODERATOR'],
  PIN_ANNOUNCEMENT: ['ADMIN'],
  DELETE_ANNOUNCEMENT: ['ADMIN', 'MODERATOR'],
  REACT_ANNOUNCEMENT: ['ADMIN', 'MODERATOR', 'MEMBER'],
  COMMENT_ANNOUNCEMENT: ['ADMIN', 'MODERATOR', 'MEMBER'],

  // Action Management
  CREATE_ACTION: ['ADMIN', 'MODERATOR', 'MEMBER'],
  UPDATE_OWN_ACTION: ['ADMIN', 'MODERATOR', 'MEMBER'],
  UPDATE_ANY_ACTION: ['ADMIN', 'MODERATOR'],
  DELETE_ACTION: ['ADMIN', 'MODERATOR'],

  // Data & Audit
  EXPORT_DATA: ['ADMIN'],
  VIEW_AUDIT_LOG: ['ADMIN'],
}

function can(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false
}

module.exports = {
  PERMISSIONS,
  can,
}
