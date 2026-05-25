import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * EditorialStats — Direction A stats strip.
 *
 * Replaces the old `.finder-hero__stats` grid with a slow-fade editorial band
 * sitting just below the hero. Cream paper, serif numerals, thin gold dividers
 * between cells. Animates on scroll into view (client:visible).
 *
 * The numerals are the visual focal point — kept big, kept serif. Labels are
 * sans, uppercase, gold, small.
 */

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

type StatItem = { value: string; label: string };
type Props = { items: StatItem[]; className?: string };

export default function EditorialStats({ items, className }: Props) {
  return (
    <section
      className={cn(
        "editorial border-b border-[color:var(--color-rule)]",
        "py-10 md:py-14",
        className,
      )}
    >
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-0">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              className={cn(
                "flex flex-col items-start pl-0 md:pl-8",
                "md:border-l md:border-[color:var(--color-rule)]",
                i === 0 && "md:border-l-0 md:pl-0",
              )}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{
                duration: 0.6,
                ease: EASE_EDITORIAL,
                delay: i * 0.08,
              }}
            >
              <span
                className="font-[var(--font-serif)] text-[2.4rem] md:text-[3rem] leading-none font-normal text-[color:var(--color-ink)] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {item.value}
              </span>
              <span className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-gold-hover)]">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
