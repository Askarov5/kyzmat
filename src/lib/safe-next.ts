/** Only allow post-login return to invite join URLs. */
export function safeInviteNext(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let path: string;
  try {
    path = decodeURIComponent(raw).trim();
  } catch {
    return null;
  }

  if (!path.startsWith("/invite")) return null;
  if (path.startsWith("//") || path.includes("://")) return null;
  if (path.includes("\\") || path.includes("\n") || path.includes("\r")) return null;

  return path;
}
