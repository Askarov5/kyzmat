"use client";

import { useEffect } from "react";

const liveSrc =
  "http://localhost:8400/live.js?token=2afe05c4-def3-4469-b615-885f7c26332b";

export function ImpeccableLive() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (document.querySelector("script[data-impeccable-live]")) return;

    const script = document.createElement("script");
    script.src = liveSrc;
    script.defer = true;
    script.dataset.impeccableLive = "";
    document.body.appendChild(script);
  }, []);

  return null;
}
