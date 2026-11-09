"use client";

import Link from "next/link";
import type { ComponentProps, LiHTMLAttributes, ReactNode } from "react";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
} from "@/components/tailgrids/alert";
import { Button as TailButton, buttonStyles } from "@/components/tailgrids/button";
import { Card } from "@/components/tailgrids/card";
import { inputStyles } from "@/components/tailgrids/input";
import { cn } from "@/utils/cn";

interface ButtonProps extends Omit<ComponentProps<typeof TailButton>, "variant"> {
  tone?: "primary" | "danger";
}

export function Button({ tone = "primary", className, type = "submit", disabled, ...props }: ButtonProps) {
  return (
    <TailButton
      type={type}
      variant={tone === "danger" ? "danger" : "primary"}
      size="lg"
      disabled={disabled}
      className={cn("min-h-12 shadow-xs", className)}
      {...props}
    />
  );
}

interface ButtonLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ href, className, children }: ButtonLinkProps) {
  const classes = cn(buttonStyles({ variant: "primary", size: "lg" }), "min-h-12 shadow-xs", className);
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

interface FieldProps extends ComponentProps<"input"> {}

export function Field({ className, ...props }: FieldProps) {
  return (
    <input
      className={cn(inputStyles({ state: "default" }), "min-h-12 text-base text-title-50", className)}
      {...props}
    />
  );
}

interface SlipProps {
  children: ReactNode;
}

export function Slip({ children }: SlipProps) {
  return (
    <Card className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-sm md:min-w-0">{children}</Card>
  );
}

interface ListRowProps extends LiHTMLAttributes<HTMLLIElement> {
  ruled?: boolean;
}

export function ListRow({ ruled = false, className, ...props }: ListRowProps) {
  return (
    <li
      className={cn(
        "min-h-12 px-3 [content-visibility:auto] [contain-intrinsic-size:auto_3rem] [@media(hover:hover)]:[&_a:hover]:bg-row",
        ruled && "border-b border-line last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <Alert status="error">
      <AlertIndicator />
      <AlertContent>
        <AlertDescription className="text-alert-danger-title">{children}</AlertDescription>
      </AlertContent>
    </Alert>
  );
}
