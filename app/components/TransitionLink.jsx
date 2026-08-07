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
        // pathname won't change, so isLoading would never clear via the
        // pathname effect below. Compare pathnames only (ignoring hash/query)
        // so hash links like "/#about" clicked while already on "/" are
        // caught too, not just exact string matches.
        if (typeof href === "string" && href.split(/[?#]/)[0] === currentPathname) return;
        startLoading();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}