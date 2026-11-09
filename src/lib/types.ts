export type Locale = "ky" | "ru";
export type MemberRole = "owner" | "agent" | "warehouse";

export interface Membership {
  tenantId: string;
  tenantName: string;
  role: MemberRole;
  locale: Locale;
}

export type OrderStatus = "open" | "in_delivery" | "completed" | "cancelled";

export interface OrderSummary {
  id: string;
  clientId: string;
  clientName: string;
  status: OrderStatus;
  scheduledOn: string | null;
  heldDays: number | null;
}

export interface ClientOrderFilter {
  id: string;
  name: string;
}

export interface ClientSummary {
  id: string;
  displayName: string;
  phoneE164: string | null;
  placeLine: string | null;
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

export interface ProductSummary {
  id: string;
  name: string;
  priceSom: number;
  onHand: number;
  reserved: number;
  available: number;
}

export interface ServiceDate {
  productId: string;
  productName: string;
  nextOn: string;
}

export interface CompanyMember {
  id: string;
  role: MemberRole;
  removedAt: string | null;
}
