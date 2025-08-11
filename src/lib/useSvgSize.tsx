// context/SvgSizeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type SvgSize = "small" | "medium" | "large";

const sizeMap: Record<SvgSize, string> = {
  small: "size-10",
  medium: "size-16",
  large: "size-24",
};

interface SvgSizeContextValue {
  size: SvgSize;
  sizeClass: string;
  changeSize: (size: SvgSize) => void;
}

const SvgSizeContext = createContext<SvgSizeContextValue | undefined>(
  undefined
);

export const SvgSizeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [size, setSize] = useState<SvgSize>("medium");

  useEffect(() => {
    const stored = localStorage.getItem("svg-size") as SvgSize | null;
    if (stored && sizeMap[stored]) {
      setSize(stored);
    }
  }, []);

  const changeSize = (newSize: SvgSize) => {
    setSize(newSize);
    localStorage.setItem("svg-size", newSize);
  };

  return (
    <SvgSizeContext.Provider
      value={{ size, sizeClass: sizeMap[size], changeSize }}>
      {children}
    </SvgSizeContext.Provider>
  );
};

export function useSvgSize() {
  const ctx = useContext(SvgSizeContext);
  if (!ctx) throw new Error("useSvgSize must be used inside SvgSizeProvider");
  return ctx;
}
