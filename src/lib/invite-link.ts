export function invitePath(tenantId: string, password: string): string {
  return `/invite/${encodeURIComponent(tenantId)}?pwd=${encodeURIComponent(password)}`;
}

export function inviteUrl(origin: string, tenantId: string, password: string): string {
  return `${origin}${invitePath(tenantId, password)}`;
}
