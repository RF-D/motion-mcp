// Brando team member registry. Maps human-friendly aliases to email/role
// so Brando tools can be called with names like "Stener" instead of Motion user IDs.

export interface BrandoTeamMember {
  alias: string;
  email: string;
  role: string;
  isPrimary?: boolean;
}

export const BRANDO_TEAM: BrandoTeamMember[] = [
  {
    alias: 'stener',
    email: 'stener@brando.no',
    role: 'Primary developer',
    isPrimary: true,
  },
  {
    alias: 'theo',
    email: 'theo@brando.no',
    role: 'Dev assistant',
  },
  {
    alias: 'vegard',
    email: 'vegard@brando.no',
    role: 'Developer (assign only when explicitly requested)',
  },
];

export function findTeamMemberByAlias(alias: string): BrandoTeamMember | undefined {
  const normalized = alias.trim().toLowerCase();
  return BRANDO_TEAM.find((m) => m.alias === normalized || m.email.toLowerCase() === normalized);
}
