"use client";

import { motion } from "framer-motion";

type StackedProjectCardsProps = {
  items: any[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onCardClick?: (item: any) => void;
};

export default function StackedProjectCards({
  items,
  activeIndex,
  onSelect,
  onCardClick,
}: StackedProjectCardsProps) {
  if (!items || items.length === 0) return null;

  const maxVisible = Math.min(items.length, 5);

  // Back-most card first so the active card renders on top
  const stack = Array.from({ length: maxVisible }, (_, i) => {
    const depth = maxVisible - 1 - i;
    const idx = (activeIndex + depth) % items.length;
    return { item: items[idx], originalIndex: idx, depth };
  });

  return (
    <div className="relative w-full aspect-[4/3]">
      {stack.map(({ item, originalIndex, depth }) => {
        const isTop = depth === 0;

        // Large offsets so cards behind pop out clearly
        const offsetY = depth * 40;
        const offsetX = depth * 30;
        const scale = 1 - depth * 0.025;
        const opacity = 1 - depth * 0.08;
        const zIndex = maxVisible - depth;

        return (
          <motion.div
            key={`${item.id || originalIndex}-${originalIndex}`}
            animate={{
              y: offsetY,
              x: offsetX,
              scale,
              opacity,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26,
              mass: 0.7,
            }}
            onClick={() => {
              if (!isTop) {
                onSelect(originalIndex);
              } else if (onCardClick) {
                onCardClick(item);
              }
            }}
            className="absolute top-0 left-0 w-[calc(100%-80px)]"
            style={{
              zIndex,
              cursor: !isTop ? "pointer" : onCardClick ? "pointer" : "default",
            }}
          >
            <div
              className={`
                w-full aspect-[4/3] rounded-[18px] md:rounded-[22px] overflow-hidden
                border transition-all duration-300
                ${
                  isTop
                    ? "border-white/15 shadow-[0_12px_50px_rgba(0,0,0,0.5)]"
                    : "border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                }
              `}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center">
                  <span className="text-white/25 text-lg font-medium">
                    {item.title}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
