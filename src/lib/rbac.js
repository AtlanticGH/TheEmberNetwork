/**
 * Role-based access helpers. Authoritative enforcement is Supabase RLS.
 * Profile roles in DB: student | mentor | staff | admin | super_admin
 */

export const ROLES = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
}

export function isStaffRole(role) {
  return [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN
}

export function isMemberRole(role) {
  return [ROLES.STUDENT, ROLES.MENTOR].includes(role) || !role
}

/** Permission matrix (UI + client-side checks only). */
export function can(role, action) {
  const r = role || ROLES.STUDENT
  const staff = isStaffRole(r)
  const superAdmin = isSuperAdmin(r)

  switch (action) {
    case 'access_admin':
      return staff
    case 'manage_settings':
    case 'manage_admins':
      return superAdmin
    case 'view_activity_logs':
      return staff
    case 'approve_applications':
    case 'manage_members':
    case 'edit_cms':
    case 'view_analytics':
      return staff
    case 'member_dashboard':
      return true
    default:
      return false
  }
}
