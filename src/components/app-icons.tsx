interface IconProps {
  className?: string;
}

const base = "size-4 shrink-0";

export function PhoneIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M6.2 3.8c.4-.4 1-.5 1.5-.3l1.6.6c.5.2.8.7.7 1.2l-.3 1.5a1.2 1.2 0 0 1-.7.9l-.9.4a8.2 8.2 0 0 0 3.7 3.7l.4-.9a1.2 1.2 0 0 1 .9-.7l1.5-.3c.5-.1 1 .2 1.2.7l.6 1.6c.2.5.1 1.1-.3 1.5l-.8.8c-.5.5-1.2.7-1.9.5A12.4 12.4 0 0 1 4.9 6.5c-.2-.7 0-1.4.5-1.9l.8-.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 3.4a6.6 6.6 0 0 0-5.7 9.9L3.5 16.5l3.3-.8A6.6 6.6 0 1 0 10 3.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 8.2c.2-.4.4-.4.6-.4h.4c.2 0 .3 0 .4.3l.5 1.2c.1.2 0 .3-.1.5l-.3.4c-.1.1-.1.3 0 .4.4.6 1 1.1 1.6 1.4.2.1.3.1.4 0l.5-.4c.1-.1.3-.1.4 0l1.1.6c.2.1.3.2.3.4v.4c0 .2 0 .4-.4.6-.3.2-.7.3-1.1.2A5 5 0 0 1 7.4 9c0-.4.1-.7.2-.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PinIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 17.2s5.2-4.1 5.2-8.1A5.2 5.2 0 0 0 10 3.9 5.2 5.2 0 0 0 4.8 9.1c0 4 5.2 8.1 5.2 8.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function NoteIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M5.5 3.5h6.2L14.5 6.3V16a1.2 1.2 0 0 1-1.2 1.2H5.5A1.2 1.2 0 0 1 4.3 16V4.7A1.2 1.2 0 0 1 5.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 3.6V6.8h3.1M7 9.5h6M7 12.5h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 8.2h13M7 3.2v2.6M13 3.2v2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OrderIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M4 5.2h1.4l1.1 7.2h7.8l1.3-5.2H6.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="15.2" r="1" fill="currentColor" />
      <circle cx="13.4" cy="15.2" r="1" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="m12.8 12.8 3.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M3.5 5.5h13M5.5 10h9M7.5 14.5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BackIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M11.8 4.8 6.6 10l5.2 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5.5 7.8 10 12.2l4.5-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 15.4c1.4-2.2 3.3-3.3 5.5-3.3s4.1 1.1 5.5 3.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoogleIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
      <path
        fill="#4285F4"
        d="M18.2 10.2c0-.6-.1-1.2-.2-1.7H10v3.3h4.6c-.2 1.1-.8 2-1.7 2.6v2.2h2.8c1.6-1.5 2.5-3.7 2.5-6.4Z"
      />
      <path
        fill="#34A853"
        d="M10 18.5c2.3 0 4.3-.8 5.7-2.1l-2.8-2.2c-.8.5-1.8.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H2.3v2.2C3.7 16.7 6.6 18.5 10 18.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 11.5c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5.9H2.3C1.7 7.1 1.4 8.5 1.4 9.8c0 1.3.3 2.7.9 3.9l2.9-2.2Z"
      />
      <path
        fill="#EA4335"
        d="M10 4.9c1.3 0 2.4.4 3.3 1.3l2.5-2.5C14.3 2.3 12.3 1.5 10 1.5 6.6 1.5 3.7 3.3 2.3 6.1l2.9 2.2C5.9 6.4 7.8 4.9 10 4.9Z"
      />
    </svg>
  );
}

export function AppleIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
      <path
        fill="currentColor"
        d="M13.7 3.4c-.7.8-1.8 1.4-2.9 1.3-.1-1.1.4-2.2 1-2.9.7-.8 1.9-1.4 2.9-1.4.1 1.1-.3 2.2-1 3Zm2.7 8c0 2.4 2.1 3.2 2.1 3.2-.1.4-.7 1.5-1.5 2.3-.8.8-1.6 1.6-2.8 1.6-1.1 0-1.5-.7-2.9-.7s-1.8.7-2.9.7c-1.2 0-2.1-.9-2.9-1.7C3.6 14.8 2.7 12 3.8 9.7c.6-1.2 1.7-2 2.9-2 1.1 0 2 .8 2.9.8s2.1-.9 3.5-.8c.6 0 2.2.2 3.2 1.7-.1.1-1.9 1.1-1.9 3.6Z"
      />
    </svg>
  );
}
