export type Locale = "ky" | "ru";
export type MemberRole = "owner" | "agent";

export interface Membership {
  tenantId: string;
  tenantName: string;
  role: MemberRole;
  locale: Locale;
}

export interface ClientSummary {
  id: string;
  displayName: string;
  phoneE164: string | null;
}

export interface LocalityOption {
  id: string;
  nameKy: string;
  nameRu: string;
}

export interface AddressRecord {
  id: string;
  line: string;
  localityKy: string;
  localityRu: string;
}

export interface NoteRecord {
  id: string;
  body: string;
  createdAt: string;
}

export interface NotePhraseOption {
  id: string;
  body: string;
  useCount: number;
}
