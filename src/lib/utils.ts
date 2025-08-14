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

interface SvgPreProcessorProps {
  svgCode: string;
  id: string | number;
}

export const preProcessor = ({ svgCode, id }: SvgPreProcessorProps): string => {
  if (!id) return svgCode; // Safety: If id is missing, return untouched

  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const styleMatch = styleRegex.exec(svgCode);
  const uniquePrefix = `svg-${id}-`;

  if (styleMatch?.[1]) {
    const styles = styleMatch[1];

    // Prefix styles
    const prefixedStyles = styles.replace(
      /\.([a-zA-Z0-9_-]+)/g,
      `.${uniquePrefix}$1`
    );

    // Replace style tag content
    svgCode = svgCode.replace(styleMatch[0], `<style>${prefixedStyles}</style>`);

    // Prefix class attributes
    svgCode = svgCode.replace(/class="([^"]+)"/g, (_, classNames: string) => {
      return `class="${classNames
        .split(/\s+/)
        .map((cls) => `${uniquePrefix}${cls}`)
        .join(" ")}"`;
    });
  }

  return svgCode;
};
