import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MagazineHero — first proof-of-stack React island.
 *
 * Demonstrates the full UI/UX Pro Max stack wired into TNC:
 *  - React 19 islands via @astrojs/react
 *  - Framer Motion for the entrance choreography
 *  - shadcn `cn()` utility for class merging
 *  - Tailwind 4 design tokens from src/styles/global.css
 *
 * Usage in any .astro page:
 *   import MagazineHero from "@/components/ui/MagazineHero";
 *   <MagazineHero
 *     eyebrow="Issue 01 · May 2026"
 *     title="The European Cuban-cigar market in transition"
 *     subtitle="50 retailers. 17 countries. One catalogue. The Finder, the Lounge, and what's next."
 *     client:visible
 *   />
 */

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export default function MagazineHero({
  eyebrow = "The Next Cigar",
  title,
  subtitle,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[color:var(--color-bg)] py-16 md:py-24",
        className,
      )}
    >
      <div className="container-wide">
        {eyebrow && (
          <motion.p
            className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-gold-hover)] font-semibold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          className="mt-3 font-[var(--font-serif,'Editorial_New','Times_New_Roman',serif)] text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[color:var(--color-text-strong,var(--color-text))]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="mt-6 max-w-2xl text-base md:text-lg text-[color:var(--color-text-soft)] leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
