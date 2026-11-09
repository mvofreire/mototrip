export type UserRole = 'admin' | 'curator' | 'contributor'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

/** Why a signed-in user was blocked (see migration 016) */
export interface AccountBlock {
  status: 'suspended' | 'banned'
  until: string | null
  reason: string | null
}
