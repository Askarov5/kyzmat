import type { Messages } from "@/i18n/types";

interface StockFiguresProps {
  onHand: number;
  reserved: number;
  available: number;
  messages: Messages;
  format: (value: number) => string;
  size?: "row" | "card";
}

function BoxIcon({ className = "size-4 shrink-0" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3.5 6.5 10 10l6.5-3.5M10 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function HoldIcon({ className = "size-4 shrink-0" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M6 8.5V7a4 4 0 1 1 8 0v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="4.5" y="8.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FreeIcon({ className = "size-4 shrink-0" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.25 10.25 9.1 12.1 12.9 8.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const figures = [
  { key: "onHand", Icon: BoxIcon },
  { key: "reserved", Icon: HoldIcon },
  { key: "available", Icon: FreeIcon },
] as const;

export function StockFigures({
  onHand,
  reserved,
  available,
  messages,
  format,
  size = "row",
}: StockFiguresProps) {
  const values = { onHand, reserved, available };

  if (size === "card") {
    return (
      <section
        className="flex flex-col gap-3 rounded-lg border border-line bg-field px-3 py-3"
        aria-label={`${messages.onHand}, ${messages.reserved}, ${messages.available}`}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-mute">
              <FreeIcon className="size-4 text-stamp" />
              {messages.available}
            </p>
            <p className="mt-0.5 text-sm text-mute">{messages.stockPromise}</p>
          </div>
          <p
            className={`shrink-0 tabular-nums text-3xl font-semibold tracking-tight ${
              available === 0 ? "text-danger" : "text-ink"
            }`}
          >
            {format(available)}
          </p>
        </div>
        {available === 0 ? (
          <p className="text-sm font-semibold text-danger">{messages.noneFree}</p>
        ) : null}
        <ul className="overflow-hidden rounded-lg border border-line bg-white">
          <li className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-mute">
              <BoxIcon />
              {messages.onHand}
            </span>
            <span className="tabular-nums text-sm font-semibold">{format(onHand)}</span>
          </li>
          <li className="flex min-h-12 items-center justify-between gap-3 px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-mute">
              <HoldIcon />
              {messages.reserved}
            </span>
            <span className="tabular-nums text-sm font-semibold">{format(reserved)}</span>
          </li>
        </ul>
        <p className="text-xs text-mute">{messages.stockEquation}</p>
      </section>
    );
  }

  return (
    <ul
      className="flex min-w-0 items-center gap-2.5"
      aria-label={`${messages.onHand}, ${messages.reserved}, ${messages.available}`}
    >
      {figures.map(({ key, Icon }) => (
        <li
          key={key}
          className="flex min-w-0 items-center gap-1 text-mute"
          title={`${messages[key]} ${format(values[key])}`}
        >
          <Icon />
          <span className={`tabular-nums text-sm font-semibold ${key === "available" ? "text-ink" : ""}`}>
            <span className="sr-only">{messages[key]} </span>
            {format(values[key])}
          </span>
        </li>
      ))}
    </ul>
  );
}
