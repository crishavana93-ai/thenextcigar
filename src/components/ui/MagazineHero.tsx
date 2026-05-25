import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MagazineHero — Direction A canvas component (v2).
 *
 * Quiet Luxury Editorial vibe: cream paper, big serif headline, surgical
 * gold eyebrow, restrained Framer Motion entrance (no spring, no bounce).
 *
 * v2 changes (post-reference-audit):
 *  - 70vh hero rule (vs the old full-py-32 block) — leaves a peek of the
 *    next section, the single highest-impact scroll cue.
 *  - Optional full-bleed background photo with Ken-Burns 12s slow scale,
 *    desaturation filter (max ~70% saturation), and SVG grain overlay.
 *  - Larger display type — clamp(3rem, 7vw, 5.5rem) — Arpeggio-influenced.
 *  - Single-CTA-per-viewport rule respected: primary CTA is a button, the
 *    secondary is a quiet text link (not another button).
 *
 * Usage:
 *   <MagazineHero
 *     eyebrow="Volume III · May 2026 · The Finder"
 *     title="Cuban cigar prices, all of Europe, one page."
 *     subtitle="The first European price comparison built for Habanos…"
 *     ctaPrimary={{ label: "Browse the catalogue", href: "#finder-catalogue" }}
 *     ctaSecondary={{ label: "Pick a country", href: "#browse-by-country" }}
 *     image={{
 *       src: "https://images.pexels.com/photos/33105616/...",
 *       alt: "Cuban torcedor rolling cigars by hand",
 *       focal: "50% 60%",
 *     }}
 *     client:load
 *   />
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type CtaProps = { label: string; href: string };
type HeroImage = {
  src: string;
  alt: string;
  /** CSS object-position. Default "50% 50%". */
  focal?: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaPrimary?: CtaProps;
  ctaSecondary?: CtaProps;
  image?: HeroImage;
  className?: string;
};

export default function MagazineHero({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  image,
  className,
}: Props) {
  const hasImage = Boolean(image?.src);

  return (
    <section
      className={cn(
        "editorial relative overflow-hidden border-b border-[color:var(--color-rule)]",
        // 70vh rule — leaves a deliberate peek of the next section
        "min-h-[70vh] max-h-[820px] flex items-center",
        "py-16 md:py-20 lg:py-24",
        className,
      )}
    >
      {/* Full-bleed background photo + Ken-Burns slow zoom + grain overlay */}
      {hasImage && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-0"
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: 12, ease: "linear" }}
          >
            <img
              src={image!.src}
              alt={image!.alt}
              className="w-full h-full object-cover"
              style={{
                objectPosition: image!.focal || "50% 50%",
                filter: "saturate(0.7) contrast(1.05) brightness(0.92)",
              }}
              loading="eager"
              fetchPriority="high"
            />
          </motion.div>
          {/* Paper-tone overlay for legibility — cream over photo, fades to clear */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(90deg, rgba(250,250,246,0.92) 0%, rgba(250,250,246,0.78) 35%, rgba(250,250,246,0.35) 70%, rgba(250,250,246,0.15) 100%)",
            }}
          />
          {/* SVG grain — 4% opacity, magazine-paper feel */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply"
            style={{
              opacity: 0.05,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
            }}
          />
        </>
      )}

      <div className="container-wide relative z-10">
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
            className="editorial-h leading-[1.02] tracking-[-0.016em]"
            style={{
              fontSize: "clamp(2.6rem, 6.8vw, 5.4rem)",
            }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.12 }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              className="mt-6 md:mt-8 max-w-2xl text-[1.05rem] md:text-[1.18rem] leading-[1.65] text-[color:var(--color-ink-soft)] font-normal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.32 }}
            >
              {subtitle}
            </motion.p>
          )}

          {(ctaPrimary || ctaSecondary) && (
            <motion.div
              className="mt-10 md:mt-12 flex flex-wrap items-center gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.48 }}
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
              {/* Secondary is an inline text link (not a button) — single-CTA-per-viewport rule */}
              {ctaSecondary && (
                <a
                  href={ctaSecondary.href}
                  className={cn(
                    "text-sm font-medium tracking-wide",
                    "text-[color:var(--color-ink-soft)] underline-offset-[6px] underline decoration-[color:var(--color-rule)]",
                    "transition-[color,text-decoration-color] duration-200",
                    "hover:text-[color:var(--color-gold-hover)] hover:decoration-[color:var(--color-gold-hover)]",
                  )}
                >
                  {ctaSecondary.label}
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll-cue chevron — softly bouncing, helps the 70vh peek do its job */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 text-[color:var(--color-ink-muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 1.2 }}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
