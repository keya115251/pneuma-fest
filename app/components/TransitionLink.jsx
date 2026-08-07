"use client";

import Link from "next/link";
import { useNavigationLoading } from "./NavigationProvider";

export default function TransitionLink({ href, children, ...rest }) {
  const { startLoading, currentPathname } = useNavigationLoading();

  return (
    <Link
      href={href}
      onClick={() => {
        // Don't show the loader for a link to the page you're already
        // on (nav bar links, re-clicking the current page, etc.) -
        // pathname won't change, so isLoading would never clear.
        if (typeof href === "string" && href === currentPathname) return;
        startLoading();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}