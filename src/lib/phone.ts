const E164 = /^\+[1-9]\d{7,14}$/;
const KYRGYZ_E164 = /^\+996\d{9}$/;

export function kyrgyzPhoneDraft(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("996") ? digits.slice(3, 12) : "";
  return `+996${national}`;
}

export function toKyrgyzE164(input: string): string | null {
  const draft = kyrgyzPhoneDraft(input);
  return KYRGYZ_E164.test(draft) ? draft : null;
}

export function toE164(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  let normalized = digits;

  if (!hasPlus && digits.startsWith("0") && digits.length === 10) {
    normalized = `996${digits.slice(1)}`;
  }

  const withPlus = `+${normalized}`;

  if (!E164.test(withPlus)) {
    return null;
  }

  return withPlus;
}

export function phoneDigits(input: string): string {
  return input.replace(/\D/g, "");
}
