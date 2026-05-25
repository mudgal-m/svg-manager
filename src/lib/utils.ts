import { useEffect } from "react";

export const isValidSvg = (text: string) => {
  if (!/<svg[\s>][\s\S]*<\/svg>/i.test(text)) return false;

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");
  return !doc.querySelector("parsererror") && doc.documentElement.tagName.toLowerCase() === "svg";
};

type CtrlVCallback = (event: KeyboardEvent) => void;

export function useCtrlV(callback: CtrlVCallback) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        callback(event);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback]);
}

export function preProcessor({ svgCode, id }: { svgCode: string; id: string }) {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const styleMatch = styleRegex.exec(svgCode);
  const uniquePrefix = `svg-${id}-`;

  if (!styleMatch?.[1]) return svgCode;

  const prefixedStyles = styleMatch[1].replace(/\.([a-zA-Z0-9_-]+)/g, `.${uniquePrefix}$1`);
  const withStyles = svgCode.replace(styleMatch[0], `<style>${prefixedStyles}</style>`);

  return withStyles.replace(/class="([^"]+)"/g, (_, classNames: string) => {
    const classes = classNames
      .split(/\s+/)
      .filter(Boolean)
      .map((className) => `${uniquePrefix}${className}`)
      .join(" ");

    return `class="${classes}"`;
  });
}

export function iconNameFromFile(filename: string) {
  return filename.replace(/\.svg$/i, "").replace(/[-_]+/g, " ").trim();
}

export function randomIconName() {
  return `icon-${Math.random().toString(36).slice(2, 8)}`;
}
