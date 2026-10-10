// scripts/optimize-images.mjs
//
// Converts every .png / .jpg / .jpeg inside src/assets (all sub-folders) to .webp,
// rewrites the imports in your code, and deletes the originals that were converted.
//
//   node scripts/optimize-images.mjs            -> DRY RUN (changes nothing, shows the plan)
//   node scripts/optimize-images.mjs --apply    -> does it for real
//
// Run it from the project root (the folder that contains package.json and src/).
// Needs:  npm i -D sharp
// COMMIT YOUR WORK TO GIT FIRST, so you can undo everything with one command.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const ASSETS = path.join(SRC, "assets");

const CONVERT_EXT = new Set([".png", ".jpg", ".jpeg"]);
const CODE_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".html"]);

/* Maximum width per image (first matching rule wins). Images are never enlarged.
   Change these numbers if something looks too soft or is still too heavy. */
const RULES = [
    { test: /logo/i, width: 400 },
    { test: /icon/i, width: 200 },
    { test: /hero|banner/i, width: 1600 },
    { test: /[\\/]Navbar[\\/]/i, width: 700 },
    { test: /[\\/]Footer[\\/]/i, width: 300 },
];
const DEFAULT_WIDTH = 1400;

const widthFor = (file) => RULES.find((r) => r.test.test(file))?.width ?? DEFAULT_WIDTH;
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* matches a file name only when it is a whole path segment inside quotes or url() */
const refRe = (name, flags = "g") =>
    new RegExp("(?<=[\\\\/'\"`(])" + esc(name) + "(?=['\"`)?#\\s])", flags);

async function walk(dir, filter) {
    const out = [];
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...(await walk(p, filter)));
        else if (filter(p)) out.push(p);
    }
    return out;
}

const exists = async (p) => !!(await fs.stat(p).catch(() => null));

async function main() {
    if (!(await exists(ASSETS))) {
        console.error("src/assets was not found. Run this from the project root.");
        process.exit(1);
    }

    const images = await walk(ASSETS, (p) => CONVERT_EXT.has(path.extname(p).toLowerCase()));
    console.log(`${images.length} images found in src/assets. Mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

    /* ---------- pass 1: convert in memory ---------- */
    const planned = new Set();
    const converted = [];
    const skipped = []; // [relative path, reason, basename]

    for (const file of images) {
        const rel = path.relative(ROOT, file);
        const name = path.basename(file);
        const out = file.replace(/\.[^.]+$/, ".webp");

        if (planned.has(out.toLowerCase())) {
            skipped.push([rel, "another image would produce the same .webp name", name]);
            continue;
        }
        planned.add(out.toLowerCase());

        const before = (await fs.stat(file)).size;
        const quality = path.extname(file).toLowerCase() === ".png" ? 82 : 76;

        try {
            if (await exists(out)) {
                // a .webp with this name already exists (for example from an earlier run): reuse it
                const after = (await fs.stat(out)).size;
                if (after >= before) {
                    skipped.push([rel, "existing .webp is not smaller, original kept", name]);
                    continue;
                }
                converted.push({ file, out, name, newName: path.basename(out), before, after, buf: null });
                continue;
            }

            const buf = await sharp(file)
                .rotate()
                .resize({ width: widthFor(file), withoutEnlargement: true })
                .webp({ quality, effort: 5 })
                .toBuffer();

            if (buf.length >= before) {
                skipped.push([rel, "webp would not be smaller, original kept", name]);
                continue;
            }
            converted.push({ file, out, name, newName: path.basename(out), before, after: buf.length, buf });
        } catch (err) {
            skipped.push([rel, `failed: ${err.message}`, name]);
        }
    }

    /* If two files share a name and one of them was skipped, leave that name alone,
       so no import can end up pointing at the wrong file. */
    const blocked = new Set(skipped.map((s) => s[2]));
    const ok = converted.filter((c) => !blocked.has(c.name));
    const orphans = converted.filter((c) => blocked.has(c.name));
    for (const c of orphans) {
        skipped.push([path.relative(ROOT, c.file), "same file name as a skipped image, left alone", c.name]);
    }

    /* ---------- pass 2: rewrite imports (in memory first) ---------- */
    const codeFiles = await walk(SRC, (p) => CODE_EXT.has(path.extname(p).toLowerCase()));
    const indexHtml = path.join(ROOT, "index.html");
    if (await exists(indexHtml)) codeFiles.push(indexHtml);

    const contents = new Map();
    for (const f of codeFiles) contents.set(f, await fs.readFile(f, "utf8"));

    const changedFiles = new Set();
    for (const c of ok) {
        const re = refRe(c.name);
        for (const [f, text] of contents) {
            if (!text.includes(c.name)) continue;
            const next = text.replace(re, c.newName);
            if (next !== text) {
                contents.set(f, next);
                changedFiles.add(f);
            }
        }
    }

    /* ---------- decide what is safe to delete ---------- */
    const toDelete = [];
    const kept = [];
    for (const c of ok) {
        const re = refRe(c.name, "");
        const stillUsed = [...contents.values()].some((t) => t.includes(c.name) && re.test(t));
        if (stillUsed) kept.push(c);
        else toDelete.push(c);
    }

    /* ---------- apply ---------- */
    if (APPLY) {
        for (const c of ok) if (c.buf) await fs.writeFile(c.out, c.buf);
        for (const f of changedFiles) await fs.writeFile(f, contents.get(f));
        for (const c of toDelete) await fs.unlink(c.file);
    }

    /* ---------- report ---------- */
    console.log(APPLY ? "Converted:" : "Would convert:");
    for (const c of ok) {
        console.log(`  ${path.relative(ROOT, c.file)}   ${kb(c.before)} -> ${kb(c.after)}`);
    }

    const totalBefore = ok.reduce((s, c) => s + c.before, 0);
    const totalAfter = ok.reduce((s, c) => s + c.after, 0);
    console.log(
        `\n${ok.length} images, ${kb(totalBefore)} -> ${kb(totalAfter)}` +
        (totalBefore ? `  (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)` : "")
    );
    console.log(`${changedFiles.size} code files ${APPLY ? "updated" : "would be updated"}:`);
    for (const f of changedFiles) console.log(`  ${path.relative(ROOT, f)}`);
    console.log(`${toDelete.length} original images ${APPLY ? "deleted" : "would be deleted"}.`);

    if (kept.length) {
        console.log("\nOriginals KEPT because some code still refers to the old name (probably a dynamic path):");
        for (const c of kept) console.log(`  ${path.relative(ROOT, c.file)}`);
    }
    if (skipped.length) {
        console.log("\nSkipped:");
        for (const [rel, reason] of skipped) console.log(`  ${rel}  (${reason})`);
    }

    if (!APPLY) console.log("\nThis was a dry run. Run again with --apply to do it for real.");
    else console.log("\nDone. Now run: npm run build");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
