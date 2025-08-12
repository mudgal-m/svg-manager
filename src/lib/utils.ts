import { clsx, type ClassValue } from "clsx";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CtrlVCallback = (event: KeyboardEvent) => void;

export function useCtrlV(callback: CtrlVCallback): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        callback(e);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [callback]);
}
export const isValidSvg = (text: string) =>
  /<svg[^>]*>[\s\S]*<\/svg>/i.test(text);
