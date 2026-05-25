import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import WordStaggerHeadline from "./WordStaggerHeadline";

/**
 * HomepageHero — Direction A's "Visia-scale" headline hero for /.
 *
 * Big two-line declarative serif headline, italic-serif subtitle, dual CTA
 * (one button, one inline text link). Sits below the MagazineMasthead
 * bookplate, above HighlightHero / "From the archive."
 *
 * Pattern reference: Visia (https://visia.framer.ai/) — but with Source
 * Serif 4 instead of Sora, magazine-literary instead of sans-modernist.
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type Props = {
  lineOne: string;
  lineTwo: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export default function HomepageHero({
  lineOne,
  lineTwo,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: Props) {
  return (
    <section className={cn("editorial relative", "py-16 md:py-24 lg:py-28")}>
      <div className="container-wide">
        <div className="max-w-5xl">
          {/* Vitra-pattern word stagger — each word emerges from below the
              baseline with ease [0.16,1,0.3,1] · 70ms apart · clipped per line */}
          <WordStaggerHeadline
            lines={[lineOne, lineTwo]}
            accentLine={1}
          />

          <motion.p
            className="mt-10 max-w-2xl italic"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.05rem, 1.6vw, 1.32rem)",
              lineHeight: "1.55",
              color: "var(--color-ink-soft)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.32 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.5 }}
          >
            <a
              href={ctaPrimary.href}
              className={cn(
                "inline-flex items-center justify-center",
                "px-8 py-4 text-sm font-medium tracking-wide",
                "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]",
                "rounded-none border border-[color:var(--color-ink)]",
                "transition-[transform,background] duration-200 ease-[var(--ease-editorial,cubic-bezier(0.22,1,0.36,1))]",
                "hover:bg-[color:var(--color-gold-hover)] hover:border-[color:var(--color-gold-hover)] hover:-translate-y-px",
              )}
            >
              {ctaPrimary.label} →
            </a>
            {ctaSecondary && (
              <a
                href={ctaSecondary.href}
                className="text-sm font-medium tracking-wide text-[color:var(--color-ink-soft)] underline underline-offset-[6px] decoration-[color:var(--color-rule)] hover:text-[color:var(--color-gold-hover)] hover:decoration-[color:var(--color-gold-hover)] transition-[color,text-decoration-color] duration-200"
              >
                {ctaSecondary.label}
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
