// IndexNow: tell Bing (and the other IndexNow engines) which pages changed.
// Run after a push has deployed:
//   node scripts/indexnow.mjs            -> blog posts changed in the last commit pushed
//   node scripts/indexnow.mjs 3          -> blog posts changed in the last 3 commits
//   node scripts/indexnow.mjs /blog/x/   -> specific paths
// The key file in public/ is public on purpose: it proves we own the site.
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";

const HOST = "thenextcigar.com";
const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file in public/");
const key = keyFile.replace(".txt", "");

const args = process.argv.slice(2);
let paths;
if (args.length && args[0].startsWith("/")) {
  paths = args;
} else {
  const n = Number(args[0] || 1);
  const changed = execSync(`git diff --name-only HEAD~${n} HEAD -- src/content/blog`, { encoding: "utf8" })
    .split("\n").filter((f) => f.endsWith(".mdx"));
  paths = changed.map((f) => `/blog/${f.split("/").pop().replace(/\.mdx$/, "")}/`);
}
if (!paths.length) { console.log("Nothing to submit."); process.exit(0); }

const urlList = paths.map((p) => `https://${HOST}${p}`);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList }),
});
console.log(res.status, res.statusText, "-", urlList.length, "URL(s)");
urlList.forEach((u) => console.log("  " + u));
