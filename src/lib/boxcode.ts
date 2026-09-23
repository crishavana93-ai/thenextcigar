// ============================================================================
// Cuban box-code decoder
// ============================================================================
// What is stamped on the bottom of a Habanos box, and what it honestly tells
// you. Researched 11 September 2026; sources cited on the page.
//
// The important honesty point, and the reason most decoders on the web are
// wrong: since roughly 2003 Habanos rotates the three-letter FACTORY code on
// a schedule only it holds. The Cuban Cigar Website — the most careful public
// reference there is — says tracking them is "virtually impossible" without
// the generator. Sites that publish a confident "current factory code table"
// are reprinting the 1985–1998 list under a new heading. So: we decode the
// DATE, which is unambiguous, and for the factory code we say what period a
// code is known from, or that we cannot say.
// ============================================================================

export const MONTHS: Record<string, { n: number; en: string }> = {
  ENE: { n: 1, en: "January" }, FEB: { n: 2, en: "February" }, MAR: { n: 3, en: "March" },
  ABR: { n: 4, en: "April" }, MAY: { n: 5, en: "May" }, JUN: { n: 6, en: "June" },
  JUL: { n: 7, en: "July" }, AGO: { n: 8, en: "August" }, SEP: { n: 9, en: "September" },
  SET: { n: 9, en: "September" }, // seen on some boxes
  OCT: { n: 10, en: "October" }, NOV: { n: 11, en: "November" }, DIC: { n: 12, en: "December" },
};

/** Factory codes we can source, with the period each table is known to cover.
 *  Nothing here is claimed for the modern rotating system. */
export interface FactoryHit { code: string; factory: string; period: string; confidence: "documented" | "disputed" }
const FACTORIES: FactoryHit[] = [
  { code: "BM",   factory: "Briones Montoto — the Romeo y Julieta factory, Havana", period: "1985–1998", confidence: "documented" },
  { code: "FPG",  factory: "Francisco Pérez Germán — the Partagás factory, Havana", period: "1985–1998", confidence: "documented" },
  { code: "EL",   factory: "El Laguito, Havana", period: "1985–1998", confidence: "documented" },
  { code: "JM",   factory: "José Martí — the H. Upmann factory, Havana", period: "1985–1998", confidence: "documented" },
  { code: "CFGS", factory: "Cienfuegos 1 (Quintero), Cienfuegos", period: "1985–1998", confidence: "documented" },
  { code: "CB",   factory: "Carlos Baliño, Havana", period: "1985–1998", confidence: "documented" },
  { code: "FR",   factory: "Miguel Fernández Roig, Havana", period: "1985–1998", confidence: "documented" },
  { code: "PL",   factory: "Juan Cano Sainz, Havana", period: "1985–1998", confidence: "documented" },
  { code: "HM",   factory: "Héroes de Moncada, Havana", period: "1985–1998", confidence: "documented" },
  { code: "EDC",  factory: "Briones Montoto (Romeo y Julieta)", period: "1998–1999", confidence: "documented" },
  { code: "EAT",  factory: "Francisco Pérez Germán (Partagás)", period: "1998–1999", confidence: "documented" },
  { code: "EUN",  factory: "El Laguito", period: "1998–1999", confidence: "documented" },
  { code: "EUNC", factory: "El Laguito", period: "1998–1999", confidence: "documented" },
  { code: "ECA",  factory: "José Martí (H. Upmann)", period: "1998–1999, and reported again 2000–2003", confidence: "disputed" },
  { code: "PEL",  factory: "Briones Montoto (Romeo y Julieta)", period: "2000–2003", confidence: "documented" },
  { code: "OSU",  factory: "Francisco Pérez Germán (Partagás)", period: "2000–2003", confidence: "documented" },
  { code: "LE",   factory: "El Laguito", period: "2000–2003", confidence: "disputed" },
  { code: "LOME", factory: "El Laguito", period: "2000–2003", confidence: "disputed" },
  { code: "SUA",  factory: "La Corona / Miguel Ángel", period: "2000–2003", confidence: "disputed" },
];

/** Pre-2000 ciphers: a keyword whose letters stand for the digits 1…0. */
const CIPHERS: { name: string; word: string; period: string }[] = [
  { name: "NIVELACUSO", word: "NIVELACUSO", period: "1985–1998" },
  { name: "NETAGIDOCU", word: "NETAGIDOCU", period: "early 1999 (keyword as Cigar Weekly records it)" },
  { name: "CODIGUNETA", word: "CODIGUNETA", period: "early 1999 (keyword as the Cuban Cigar Website records it)" },
];

export interface Decoded {
  input: string;
  date?: { month: string; monthEn: string; year: number; iso: string; ageYears: number };
  factory?: FactoryHit;
  cipher?: { name: string; digits: string; reading: string; period: string };
  tripaCorta: boolean;
  unknownTokens: string[];
  notes: string[];
}

export function decodeBoxCode(raw: string, now = new Date()): Decoded {
  const input = raw.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const out: Decoded = { input, tripaCorta: false, unknownTokens: [], notes: [] };
  if (!input) return out;

  // Month+year may be written together (MAY24) or apart (MAY 24).
  let work = input.replace(/\b([A-Z]{3})\s+(\d{2,4})\b/g, "$1$2");
  const tokens = work.split(" ").filter(Boolean);

  for (const t of tokens) {
    if (t === "TC") { out.tripaCorta = true; continue; }

    const m = t.match(/^([A-Z]{3})(\d{2}|\d{4})$/);
    if (m && MONTHS[m[1]]) {
      const mon = MONTHS[m[1]];
      let year = Number(m[2]);
      if (m[2].length === 2) year = year <= (now.getFullYear() % 100) ? 2000 + year : 1900 + year;
      const iso = `${year}-${String(mon.n).padStart(2, "0")}`;
      const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - mon.n);
      out.date = { month: m[1], monthEn: mon.en, year, iso, ageYears: Math.round((months / 12) * 10) / 10 };
      continue;
    }

    const f = FACTORIES.find((x) => x.code === t);
    if (f) { out.factory = f; continue; }

    // Pre-2000 four-letter cipher word?
    if (/^[A-Z]{4}$/.test(t) && !out.date) {
      for (const c of CIPHERS) {
        const digits = [...t].map((ch) => { const i = c.word.indexOf(ch); return i < 0 ? null : String((i + 1) % 10); });
        if (digits.every((d) => d !== null)) {
          const s = digits.join("");
          const mm = Number(s.slice(0, 2)), yy = Number(s.slice(2));
          const reading = mm >= 1 && mm <= 12 ? `${Object.values(MONTHS).find((x) => x.n === mm)?.en ?? mm} ${yy < 50 ? 2000 + yy : 1900 + yy}` : `digits ${s} — not a month and year`;
          out.cipher = { name: c.name, digits: s, reading, period: c.period };
          break;
        }
      }
      if (out.cipher) continue;
    }

    out.unknownTokens.push(t);
  }

  if (out.date && out.date.year >= 2003 && !out.factory && out.unknownTokens.length > 0) {
    out.notes.push(`We can't tell you which factory ${out.unknownTokens.join(", ")} is. Habanos rotates the three-letter factory code on a schedule it doesn't publish, and has done since about 2003. Any site that decodes a modern factory code is guessing — usually from the 1985–1998 table.`);
  }
  if (out.date && out.date.year < 2000) {
    out.notes.push("Before 2000 the date was written as a cipher, not in plain months — check the cipher reading below rather than the month code.");
  }
  if (out.tripaCorta) out.notes.push("TC — tripa corta: short filler, not a fully hand-made long-filler Habano.");
  return out;
}

export const EXAMPLES = ["MAY 24", "OSU ABR01", "PEL DIC 05", "TOS AGO19 TC", "NNSU", "ECA UDCC"];
