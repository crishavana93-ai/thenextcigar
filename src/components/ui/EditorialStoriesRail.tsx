import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * EditorialStoriesRail — Direction A's Apple-Cards-Carousel analog.
 *
 * Same UX pattern as Aceternity's apple-cards-carousel — horizontal scroll-snap
 * row of large image cards with category eyebrow + serif title — but rebuilt
 * clean for Direction A: cream paper, rounded-sm corners, no gradient overlays,
 * no modal expansion (cards link straight to /blog/[slug] instead — quieter +
 * one click = read, not two), Source Serif 4 titles, gold category eyebrow.
 *
 * Why a custom build instead of the 21st.dev import:
 *  - Aceternity's version pulls next/image (Next.js-only, not Astro)
 *  - Aceternity defaults: rounded-3xl, dark gradient bg, bouncy spring on hover
 *    — every one of those would damage Direction A
 *  - This is ~120 lines vs 296 lines, no dependencies beyond framer-motion
 *
 * Usage:
 *   <EditorialStoriesRail
 *     eyebrow="This Week"
 *     title="Stories from the magazine"
 *     items={[
 *       { href, image, category, title, alt },
 *       ...
 *     ]}
 *     client:visible
 *   />
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type Story = {
  href: string;
  image: string;
  category: string;
  title: string;
  alt: string;
};

type Props = {
  eyebrow: string;
  title: string;
  items: Story[];
  className?: string;
};

export default function EditorialStoriesRail({ eyebrow, title, items, className }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScrollability() {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  useEffect(() => {
    checkScrollability();
  }, []);

  function scrollByAmount(delta: number) {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section
      className={cn(
        "editorial border-t border-[color:var(--color-rule)]",
        "py-16 md:py-20",
        className,
      )}
    >
      {/* Masthead */}
      <header className="container-wide flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="editorial-eyebrow mb-3">{eyebrow}</p>
          <h2 className="editorial-h leading-[1.05] tracking-[-0.012em]" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            {title}
          </h2>
        </div>
        {/* Arrow controls — quiet, only show when scrollable */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-360)}
            disabled={!canScrollLeft}
            className="w-10 h-10 flex items-center justify-center border transition-opacity disabled:opacity-30 hover:bg-[color:var(--color-paper-soft)]"
            style={{ borderColor: "var(--color-rule)", color: "var(--color-ink)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(360)}
            disabled={!canScrollRight}
            className="w-10 h-10 flex items-center justify-center border transition-opacity disabled:opacity-30 hover:bg-[color:var(--color-paper-soft)]"
            style={{ borderColor: "var(--color-rule)", color: "var(--color-ink)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </header>

      {/* Scroll rail */}
      <div
        ref={railRef}
        onScroll={checkScrollability}
        className="flex overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-5 md:gap-6 pl-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))] pr-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))]">
          {items.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="group flex-shrink-0 w-[78vw] sm:w-[44vw] md:w-[28rem] snap-start"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{
                duration: 0.6,
                ease: EASE_EDITORIAL,
                delay: i * 0.08,
              }}
            >
              {/* Card image — clip-path Floema reveal on hover handled by group */}
              <div
                className="relative overflow-hidden aspect-[4/5]"
                style={{ background: "var(--color-paper-soft)" }}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  style={{ filter: "saturate(0.85) contrast(1.04)" }}
                />
              </div>

              {/* Card text below image — no gradient overlay, no scrim */}
              <div className="mt-4">
                <p className="editorial-eyebrow mb-2">{item.category}</p>
                <h3
                  className="editorial-h leading-[1.18] line-clamp-3"
                  style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.32rem)" }}
                >
                  {item.title}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
