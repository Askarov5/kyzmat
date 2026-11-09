import type { ReactNode } from "react";

interface SectionHeadingProps {
  icon: ReactNode;
  children: ReactNode;
}

export function SectionHeading({ icon, children }: SectionHeadingProps) {
  return (
    <h2 className="flex min-h-10 items-center gap-2 border-b border-line pb-2 text-base font-semibold">
      <span className="text-mute">{icon}</span>
      {children}
    </h2>
  );
}
