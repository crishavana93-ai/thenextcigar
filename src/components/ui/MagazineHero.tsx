import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MagazineHero — Direction A canvas component.
 *
 * Quiet Luxury Editorial vibe: cream paper, big serif headline, surgical
 * gold eyebrow, restrained Framer Motion entrance (no spring, no bounce).
 *
 * Lives in src/components/ui/ so it slots into the shadcn folder convention,
 * but it's a TNC-specific component — not a shadcn primitive.
 *
 * Usage in any .astro page:
 *   import MagazineHero from "@/components/ui/MagazineHero";
 *   <MagazineHero
 *     eyebrow="Issue 02 · May 2026 · The Finder"
 *     title="Cuban cigar prices, all of Europe, one page."
 *     subtitle="The first European price comparison built for Habanos. 50 retailers, 17 countries, refreshed every six hours."
 *     ctaPrimary={{ label: "Browse the catalogue", href: "#finder-catalogue" }}
 *     ctaSecondary={{ label: "How it works", href: "#how" }}
 *     client:load
 *   />
 *
 * Motion choreography (Direction A):
 *  - eyebrow: 600ms ease-out, no Y translate, just opacity
 *  - headline: 700ms ease-out, 24px Y translate, 120ms after eyebrow
 *  - subtitle: 600ms ease-out, 16px Y translate, 280ms after eyebrow
 *  - CTAs: 500ms ease-out, 12px Y translate, 440ms after eyebrow
 *
 * Total entrance choreography wraps at ~1s. No scroll triggers — this is
 * above-the-fold so it animates on mount.
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type CtaProps = { label: string; href: string };

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaPrimary?: CtaProps;
  ctaSecondary?: CtaProps;
  className?: string;
};

export default function MagazineHero({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "editorial relative overflow-hidden border-b border-[color:var(--color-rule)]",
        "py-20 md:py-28 lg:py-32",
        className,
      )}
    >
      <div className="container-wide">
        <div className="max-w-4xl">
          {eyebrow && (
            <motion.p
              className="editorial-eyebrow mb-6 md:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            className="editorial-h text-[2.4rem] md:text-[3.6rem] lg:text-[4.4rem] leading-[1.05] tracking-[-0.012em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.12 }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              className="mt-6 md:mt-8 max-w-2xl text-[1.05rem] md:text-[1.18rem] leading-[1.65] text-[color:var(--color-ink-soft)] font-normal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.28 }}
            >
              {subtitle}
            </motion.p>
          )}

          {(ctaPrimary || ctaSecondary) && (
            <motion.div
              className="mt-10 md:mt-12 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.44 }}
            >
              {ctaPrimary && (
                <a
                  href={ctaPrimary.href}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-7 py-3.5 text-sm font-medium tracking-wide",
                    "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]",
                    "rounded-none border border-[color:var(--color-ink)]",
                    "transition-[transform,background] duration-200 ease-[var(--ease-editorial,cubic-bezier(0.22,1,0.36,1))]",
                    "hover:bg-[color:var(--color-gold-hover)] hover:border-[color:var(--color-gold-hover)] hover:-translate-y-px",
                  )}
                >
                  {ctaPrimary.label} →
                </a>
              )}
              {ctaSecondary && (
                <a
                  href={ctaSecondary.href}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "px-7 py-3.5 text-sm font-medium tracking-wide",
                    "text-[color:var(--color-ink)] underline-offset-[6px]",
                    "transition-[color] duration-200",
                    "hover:text-[color:var(--color-gold-hover)] hover:underline",
                  )}
                >
                  {ctaSecondary.label}
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative hairline — subtle right-edge gold rule, only on desktop */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[color:var(--color-gold-soft)] to-transparent"
      />
    </section>
  );
}
