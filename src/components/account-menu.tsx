"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { switchLocale, signOut } from "@/app/actions/session";
import { ChevronIcon, UserIcon } from "@/components/app-icons";
import { Button } from "@/components/ui";
import type { Messages } from "@/i18n/types";
import type { Locale } from "@/lib/types";

interface AccountMenuProps {
  locale: Locale;
  messages: Messages;
  companyName?: string;
  companyHref?: string;
  showSignOut?: boolean;
}

export function AccountMenu({
  locale,
  messages,
  companyName,
  companyHref,
  showSignOut = false,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [logoutArmed, setLogoutArmed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const companyLabel = companyName?.trim() || "";
  const hasCompany = companyLabel.length > 0;
  const label = hasCompany ? companyLabel : messages.accountMenu;

  useEffect(() => {
    if (!open) {
      setLogoutArmed(false);
      return;
    }

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={
          hasCompany
            ? "inline-flex min-h-12 max-w-[11rem] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-mute touch-manipulation [@media(hover:hover)]:hover:bg-row"
            : "inline-flex size-12 items-center justify-center rounded-lg text-mute touch-manipulation [@media(hover:hover)]:hover:bg-row"
        }
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <UserIcon className="size-5 shrink-0 text-stamp" />
        {hasCompany ? (
          <>
            <span className="min-w-0 truncate" translate="no">
              {companyLabel}
            </span>
            <ChevronIcon
              className={`size-4 shrink-0 transition-transform duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={messages.accountMenu}
          className="absolute right-0 top-full z-30 mt-1 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-white shadow-md"
        >
          {companyHref ? (
            <Link
              href={companyHref}
              role="menuitem"
              className="flex min-h-12 items-center border-b border-line px-3 text-sm font-semibold text-stamp touch-manipulation [@media(hover:hover)]:hover:bg-row"
              onClick={() => setOpen(false)}
            >
              {messages.companySettings}
            </Link>
          ) : null}

          <div className="border-b border-line px-3 py-2" role="none">
            <div className="lang-set w-full" role="group" aria-label={messages.language}>
              <form action={switchLocale.bind(null, "ky")} className="min-w-0 flex-1">
                <button
                  type="submit"
                  role="menuitemradio"
                  aria-checked={locale === "ky"}
                  aria-pressed={locale === "ky"}
                  className="w-full justify-center"
                >
                  {messages.kyrgyz}
                </button>
              </form>
              <form action={switchLocale.bind(null, "ru")} className="min-w-0 flex-1">
                <button
                  type="submit"
                  role="menuitemradio"
                  aria-checked={locale === "ru"}
                  aria-pressed={locale === "ru"}
                  className="w-full justify-center"
                >
                  {messages.russian}
                </button>
              </form>
            </div>
          </div>

          {showSignOut ? (
            logoutArmed ? (
              <div className="flex flex-col gap-2 p-3" role="none">
                <p className="text-sm">{messages.logoutConfirm}</p>
                <form action={signOut}>
                  <Button tone="danger" className="w-full">
                    {messages.logoutYes}
                  </Button>
                </form>
                <button
                  type="button"
                  role="menuitem"
                  className="min-h-12 font-semibold text-mute"
                  onClick={() => setLogoutArmed(false)}
                >
                  {messages.back}
                </button>
              </div>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-12 w-full items-center px-3 text-left text-sm font-semibold text-danger touch-manipulation [@media(hover:hover)]:hover:bg-row"
                onClick={() => setLogoutArmed(true)}
              >
                {messages.logout}
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
