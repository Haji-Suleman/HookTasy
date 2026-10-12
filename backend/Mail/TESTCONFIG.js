import "dotenv/config";
import nodemailer from "nodemailer";

const t = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: { user: process.env.PROF_GMAIL, pass: process.env.PROF_PASSWORD },
});

try {
    await t.verify();
    console.log("SMTP login OK");
} catch (e) {
    console.log("FAILED:", e.code, e.responseCode, e.message);
}