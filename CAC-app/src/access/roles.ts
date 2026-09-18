import type { Access, FieldAccess } from 'payload'

/** Admin OR Editor — the two staff roles (context.md §11.1). */
export const isStaff: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'

/** Admin only — user management + irreversible settings (context.md §11.1). */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

/** Boolean-only variants for `access.admin` and field-level access. */
export const isStaffBool = ({ req: { user } }: { req: { user?: { role?: string } | null } }): boolean =>
  user?.role === 'admin' || user?.role === 'editor'

export const isAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/** Public reads see published; staff see everything. */
export const staffOrPublished: Access = ({ req: { user } }) => {
  if (user?.role === 'admin' || user?.role === 'editor') return true
  return { _status: { equals: 'published' } }
}
