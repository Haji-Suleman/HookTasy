import sharp from "sharp";

await sharp("src/assets/image.png")
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile("src/assets/image.webp");