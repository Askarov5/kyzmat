interface IconProps {
  className?: string;
}

const base = "size-4 shrink-0";

export function PhoneIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8.5 3.5h7A2.5 2.5 0 0 1 18 6v12a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 18V6A2.5 2.5 0 0 1 8.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M11 17.5h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className = base }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.75a8.25 8.25 0 0 0-7.05 12.55L4 20.25l4.1-1.05A8.25 8.25 0 1 0 12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.9c.15-.35.35-.4.55-.4h.35c.15 0 .3 0 .35.3l.45 1.15c.05.2 0 .3-.1.45l-.25.35c-.1.1-.1.25 0 .4.35.55.9 1.05 1.45 1.35.15.1.3.1.4 0l.45-.35c.1-.1.25-.1.4 0l1 .55c.2.1.25.2.25.4v.35c0 .2 0 .35-.35.55-.3.15-.65.25-1 .15A4.6 4.6 0 0 1 9 9.7c0-.35.05-.65.2-.8Z"
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M16.365 12.24c-.026-2.566 2.095-3.8 2.19-3.857-1.195-1.747-3.055-1.987-3.715-2.014-1.582-.16-3.088.932-3.89.932-.818 0-2.07-.91-3.405-.886-1.752.026-3.368 1.018-4.266 2.586-1.82 3.155-.465 7.826 1.308 10.39.867 1.254 1.9 2.662 3.258 2.612 1.307-.053 1.8-.845 3.38-.845 1.566 0 2.023.845 3.405.818 1.407-.026 2.298-1.278 3.156-2.54 1.002-1.46 1.414-2.874 1.438-2.946-.031-.014-2.76-1.06-2.79-4.25ZM14.6 5.49c.72-.874 1.206-2.09 1.074-3.3-1.038.042-2.295.692-3.04 1.566-.666.774-1.25 2.01-1.094 3.196 1.156.09 2.34-.588 3.06-1.462Z"
      />
    </svg>
  );
}
