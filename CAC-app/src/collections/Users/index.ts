import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff, isStaffBool } from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Only admins manage users (context.md §11.1). Everyone authenticated can read
    // basic user data so "last edited by" works.
    admin: isStaffBool,
    create: isAdmin,
    delete: isAdmin,
    read: isStaff,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrateur', value: 'admin' },
        { label: 'Éditeur', value: 'editor' },
      ],
      access: {
        // An editor cannot promote themselves.
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
