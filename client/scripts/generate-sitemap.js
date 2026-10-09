import { writeFileSync } from "fs";

const SITE = "https://zootsyshop.com";
const API = "https://zootsy-backend.vercel.app/api/food/list"; // check this path, see note below

const staticPages = ["/", "/about", "/reviews"];

const today = new Date().toISOString().split("T")[0];

async function main() {
    let products = [];
    try {
        const res = await fetch(API);
        const json = await res.json();
        products = Array.isArray(json.data) ? json.data : [];
    } catch (err) {
        console.warn("Could not fetch products, writing static pages only:", err.message);
    }

    const urls = [
        ...staticPages.map((p) => ({ loc: `${SITE}${p}`, priority: p === "/" ? "1.0" : "0.7" })),
        ...products.map((p) => ({ loc: `${SITE}/product/${p._id || p.id}`, priority: "0.8" })),
    ];

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
            .map(
                (u) =>
                    `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`
            )
            .join("\n") +
        `\n</urlset>\n`;

    writeFileSync("public/sitemap.xml", xml);
    console.log(`sitemap.xml written with ${urls.length} URLs`);
}

main();