"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PackRedirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace(href);
    }, 400);
    return () => window.clearTimeout(t);
  }, [href, router]);
  return null;
}
