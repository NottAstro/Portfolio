"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

type CascadingSliderProps = {
  items: any[];
  renderItem: (item: any, isCenter: boolean) => React.ReactNode;
  containerClassName?: string;
  itemClassName?: string;
};

const STEP_X = 45;
const STEP_Y = 2;
const SCALE_STEP = 0.08;
const MAX_VISIBLE_OFFSET = 5;

export default function CascadingSlider({ items, renderItem, containerClassName, itemClassName }: CascadingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef);

  // Duplicate items if there are too few, to allow for seamless infinite wrap-around
  // without visible cross-screen flying.
  const displayItems = items.length > 0 && items.length < 8 ? [...items, ...items, ...items] : items;
  const total = displayItems.length;

  const nextItem = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevItem = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance, paused while the slider is off-screen
  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(nextItem, 1500);
    return () => clearInterval(timer);
  }, [nextItem, inView]);

  if (!items || items.length === 0) return null;

  // Calculates the relative distance from the current index, handling wrap-around
  const getOffset = (index: number) => {
    if (total <= 1) return 0;

    let offset = index - currentIndex;

    // Handle wrap-around for endless scrolling
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor((total - 1) / 2)) offset += total;

    return offset;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-[100vw] left-1/2 -translate-x-1/2 flex items-center justify-center py-0 overflow-hidden ${containerClassName || 'h-[250px]'}`}
    >
      {displayItems.map((item, index) => {
        const offset = getOffset(index);
        const distance = Math.abs(offset);

        const isFront = offset === 0;
        const isVisibleLeft = offset < 0 && distance <= MAX_VISIBLE_OFFSET;
        const isVisibleRight = offset > 0 && distance <= MAX_VISIBLE_OFFSET;

        // Front card sits centered; visible neighbours cascade outwards;
        // anything further continues the same trajectory while fully hidden.
        const target = isFront
          ? { x: "0%", y: "0%", scale: 1, opacity: 1, zIndex: 10 }
          : isVisibleLeft || isVisibleRight
            ? {
                x: `${offset * STEP_X}%`,
                y: `${distance * STEP_Y}%`,
                scale: 1 - distance * SCALE_STEP,
                opacity: 1 - distance * 0.15,
                zIndex: 10 - distance,
              }
            : { x: `${offset * STEP_X}%`, y: "0%", scale: 0.6, opacity: 0, zIndex: 0 };

        return (
          <motion.div
            key={item.id ? `${item.id}-${index}` : index}
            animate={{ ...target, rotate: 0 }}
            transition={{
              duration: 1.5,
              ease: "linear",
            }}
            className={`absolute top-0 bottom-0 left-0 right-0 m-auto flex items-center justify-center ${itemClassName || 'w-[90%] max-w-[280px] h-[180px]'}`}
            onClick={() => {
              if (isVisibleRight) nextItem();
              if (isVisibleLeft) prevItem();
            }}
            style={{
              cursor: isFront ? "default" : "pointer",
            }}
          >
            <div className="w-full relative h-full">
              {renderItem(item, isFront)}
              {/* Invisible overlay over non-centered items so clicks trigger slider nav instead of card links */}
              {!isFront && (
                <div className="absolute inset-0 z-50 rounded-[26px]" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
