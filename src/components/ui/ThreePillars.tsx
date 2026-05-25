import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NumberTicker } from "./number-ticker";

/**
 * ThreePillars — Direction A's structural identity block.
 *
 * Visia-pattern: numbered editorial sections (01. THE FINDER / 02. THE LOUNGE
 * / 03. THE MAGAZINE) that explain what TNC actually is in three beats.
 *
 * Big serif number, all-caps spaced eyebrow, italic-serif sentence-title,
 * sans description below. Scroll-revealed with staggered choreography.
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type Pillar = {
  number: string;
  label: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

type Stat = {
  value: number;
  label: string;
};

type Props = {
  eyebrow: string;
  intro: string;
  stats?: Stat[];
  pillars: Pillar[];
};

export default function ThreePillars({ eyebrow, intro, stats, pillars }: Props) {
  return (
    <section className="editorial border-t border-[color:var(--color-rule)] py-20 md:py-28">
      <div className="container-wide">
        <motion.p
          className="editorial-eyebrow mb-5"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          className="editorial-h max-w-3xl mb-16 md:mb-20 leading-[1.08] tracking-[-0.012em]"
          style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.08 }}
        >
          {intro}
        </motion.h2>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-x-0 border-y border-[color:var(--color-rule)] py-8 mb-16 md:mb-20">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={cn(
                  "flex flex-col items-start pl-0 md:pl-8",
                  "md:border-l md:border-[color:var(--color-rule)]",
                  i === 0 && "md:border-l-0 md:pl-0",
                )}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: i * 0.08 }}
              >
                <span
                  className="font-normal leading-none text-[color:var(--color-ink)] tracking-[-0.01em]"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2rem, 3vw, 2.6rem)",
                  }}
                >
                  <NumberTicker value={stat.value} delay={i * 0.1} />
                </span>
                <span className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-gold-hover)]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 lg:gap-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{
                duration: 0.7,
                ease: EASE_EDITORIAL,
                delay: 0.15 + i * 0.12,
              }}
            >
              <p
                className="font-normal leading-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.4rem, 3.6vw, 3.2rem)",
                  color: "var(--color-gold-hover)",
                  marginBottom: "1.25rem",
                }}
              >
                {pillar.number}.
              </p>
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {pillar.label}
              </p>
              <h3
                className="editorial-h mb-4 leading-[1.15]"
                style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.7rem)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-[0.96rem] leading-[1.65] flex-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {pillar.body}
              </p>
              {pillar.cta && (
                <a
                  href={pillar.cta.href}
                  className={cn(
                    "mt-6 inline-flex items-center text-sm font-medium tracking-wide",
                    "underline underline-offset-[6px]",
                  )}
                  style={{
                    color: "var(--color-gold-hover)",
                    textDecorationColor: "var(--color-rule)",
                  }}
                >
                  {pillar.cta.label} →
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
