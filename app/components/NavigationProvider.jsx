"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import PulseLoader from "./PulseLoader";

const NavigationContext = createContext({ startLoading: () => {} });

export function useNavigationLoading() {
  return useContext(NavigationContext);
}

// Safety cap: if pathname doesn't change (same-page link, hash link,
// double click, etc.) the loader would otherwise never clear and would
// block every subsequent click since it's a full-screen fixed overlay.
// This is a last-resort backstop, not the normal way navigation clears the
// loader (that's the pathname effect below, which fires as soon as the
// route actually changes). It must stay well above real navigation time —
// slower devices/networks can legitimately take several seconds - or it'll
// hide the overlay while a real navigation is still in flight, making the
// page look stuck on the old content until the new one suddenly pops in.
const MAX_LOADING_MS = 15000;

export function NavigationProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startLoading = () => {
    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, MAX_LOADING_MS);
  };

  return (
    <NavigationContext.Provider value={{ startLoading, currentPathname: pathname }}>
      {isLoading && <PulseLoader />}
      {children}
    </NavigationContext.Provider>
  );
}