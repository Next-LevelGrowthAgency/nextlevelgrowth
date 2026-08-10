"use client";

import { useEffect, useRef } from "react";

/**
 * iOS-Safari-safe body scroll lock. Plain `overflow: hidden` on body
 * (the previous approach, still used by GrowthCoachPanel.tsx) is
 * well-documented to still let the background rubber-band/scroll on iOS
 * Safari, because Safari doesn't treat `overflow: hidden` on `<body>` as
 * a hard stop the way desktop browsers do. The reliable technique is to
 * also pin the body in place with `position: fixed` at its current
 * scroll offset — since a `position: fixed` element has nothing to
 * scroll — then restore both the inline styles and the real scroll
 * position on unlock, so the page doesn't jump to the top when the lock
 * releases.
 */
export function useScrollLock(locked: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    scrollYRef.current = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollYRef.current}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked]);
}
