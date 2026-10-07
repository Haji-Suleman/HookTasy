import "dotenv/config";
import { sendOrderEmail } from "./Nodemail.js";

await sendOrderEmail({
    _id: "1234567890abcdef",
    address: { email: "zootsyshops@gmail.com" },
    items: [
        { name: "Test pattern", quantity: 1, pdfLink: "https://example.com/test.pdf", img: "" },
    ],
});