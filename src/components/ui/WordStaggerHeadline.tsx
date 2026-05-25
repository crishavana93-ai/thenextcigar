import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * WordStaggerHeadline — Direction A's Vitra-pattern hero headline.
 *
 * Splits text into words, each word fades + lifts independently with
 * staggerChildren: 0.05. Words drift up from y: '100%' to y: 0 with the
 * Vitra ease curve [0.16, 1, 0.3, 1] over 600ms each.
 *
 * Reference: panton.vitra.com (Framer Awards 2025, "Best Animations").
 *
 * Usage:
 *   <WordStaggerHeadline
 *     lines={["Read the leaf.", "Find the price."]}
 *     accentLine={1}  // second line gets the gold color
 *     client:load
 *   />
 *
 * The component clips overflow per-line so words emerge from below the
 * baseline — the classic "type rises into view" magazine pattern.
 */

const VITRA_EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const word = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: VITRA_EASE,
    },
  },
};

type Props = {
  lines: string[];
  /** Index of the line(s) to render in gold (Direction A accent). */
  accentLine?: number;
  className?: string;
  /** Defaults to clamp(2.8rem, 9vw, 7.2rem) — matches HomepageHero scale. */
  fontSize?: string;
};

export default function WordStaggerHeadline({
  lines,
  accentLine,
  className,
  fontSize = "clamp(2.8rem, 9vw, 7.2rem)",
}: Props) {
  return (
    <motion.h1
      className={cn(
        "editorial-h leading-[0.95] tracking-[-0.022em]",
        className,
      )}
      style={{ fontSize }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {lines.map((line, lineIdx) => {
        const isAccent = accentLine === lineIdx;
        const words = line.split(" ");
        return (
          <span
            key={lineIdx}
            className="block overflow-hidden"
            style={{
              color: isAccent ? "var(--color-gold-hover)" : undefined,
            }}
          >
            {words.map((w, i) => (
              <motion.span
                key={`${lineIdx}-${i}`}
                className="inline-block mr-[0.22em]"
                variants={word}
              >
                {w}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.h1>
  );
}
