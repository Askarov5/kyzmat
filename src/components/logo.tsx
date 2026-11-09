interface LogoProps {
  name: string;
}

export function Logo({ name }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.5 7.5h7V17H26.5v6.5A4.5 4.5 0 0 1 22 28H7.5A4.5 4.5 0 0 1 3 23.5v-12A4.5 4.5 0 0 1 7.5 7.5Z"
        />
        <path
          fill="currentColor"
          d="M19.5 4.5h6A2.5 2.5 0 0 1 28 7v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 17 13V7a2.5 2.5 0 0 1 2.5-2.5Z"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight leading-none">{name}</span>
    </span>
  );
}
