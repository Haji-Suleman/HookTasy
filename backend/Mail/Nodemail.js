import nodemailer from "nodemailer";

const SHOP_NAME = "Zootsy Shop";
const SHOP_URL = "https://zootsyshop.com";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.PROF_GMAIL, // info@zootsyshop.com
    pass: process.env.PROF_PASSWORD,
  },
  // fail fast instead of hanging a serverless function
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

const isUrl = (s) => /^https?:\/\//i.test(String(s || ""));

export const sendOrderEmail = async (order) => {
  const to = order?.address?.email;
  console.log("[mail] sendOrderEmail called, to:", to);

  if (!to) {
    console.log("[mail] no recipient email, skipping");
    return;
  }

  // shows whether the env vars exist (never prints the password itself)
  const hasUser = !!process.env.PROF_GMAIL;
  const hasPass = !!process.env.PROF_PASSWORD;
  console.log("[mail] PROF_GMAIL set:", hasUser, "| PROF_PASSWORD set:", hasPass);
  if (!hasUser || !hasPass) {
    throw new Error("Mail credentials are missing (PROF_GMAIL / PROF_PASSWORD).");
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const reference = String(order._id).slice(-8);

  /* ---------- HTML rows (valid table markup) ---------- */
  const rows = items
    .map((i) => {
      const image = isUrl(i.img)
        ? `<img src="${escapeHtml(i.img)}" alt="${escapeHtml(i.name)}" width="88" height="88"
              style="display:block;width:88px;height:88px;object-fit:cover;border-radius:8px;" />`
        : "";

      const button = isUrl(i.pdfLink)
        ? `<a href="${escapeHtml(i.pdfLink)}"
              style="display:inline-block;margin-top:8px;padding:10px 18px;background:#17695f;color:#ffffff;
                     font-size:14px;font-weight:bold;text-decoration:none;border-radius:8px;">
              Download PDF
           </a>`
        : "";

      const qty = Number(i.quantity) > 1 ? ` &times; ${Number(i.quantity)}` : "";

      return `
        <tr>
          <td style="padding:0 14px 16px 0;vertical-align:top;width:88px;">${image}</td>
          <td style="padding:0 0 16px 0;vertical-align:top;font-size:15px;color:#27233a;">
            <strong>${escapeHtml(i.name)}</strong>${qty}<br />
            ${button}
          </td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#27233a;line-height:1.5;">
      <h2 style="margin:0 0 16px;font-size:22px;">Thank you for your order!</h2>
      <p style="margin:0 0 12px;">Hi there,</p>
      <p style="margin:0 0 20px;">
        Your payment went through and your patterns are ready.
        Use the buttons below to download them. You can come back to this email any time.
      </p>

      <h3 style="margin:0 0 12px;font-size:17px;">Your patterns</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        ${rows}
      </table>

      <p style="margin:8px 0 20px;font-size:14px;color:#6f6a82;">
        Order reference: <strong style="color:#27233a;">${escapeHtml(reference)}</strong>
      </p>

      <p style="margin:0 0 12px;">
        Trouble with a download? Just reply to this email with your order reference
        and we'll sort it out.
      </p>
      <p style="margin:0;">Happy crocheting,<br /><strong>${SHOP_NAME}</strong><br />
        <a href="${SHOP_URL}" style="color:#17695f;">${SHOP_URL.replace("https://", "")}</a>
      </p>
    </div>`;

  /* ---------- Plain-text version (helps deliverability) ---------- */
  const textLines = items.map((i) => {
    const qty = Number(i.quantity) > 1 ? ` x ${Number(i.quantity)}` : "";
    return `- ${i.name}${qty}${isUrl(i.pdfLink) ? `\n  Download: ${i.pdfLink}` : ""}`;
  });

  const text = [
    "Thank you for your order!",
    "",
    "Your payment went through and your patterns are ready:",
    "",
    ...textLines,
    "",
    `Order reference: ${reference}`,
    "",
    "Trouble with a download? Reply to this email with your order reference.",
    "",
    `Happy crocheting,`,
    SHOP_NAME,
    SHOP_URL,
  ].join("\n");

  /* ---------- Send ---------- */
  try {
    const info = await transporter.sendMail({
      from: `"${SHOP_NAME}" <${process.env.PROF_GMAIL}>`,
      to,
      replyTo: process.env.PROF_GMAIL,
      subject: "Your Zootsy Shop patterns are ready to download",
      text,
      html,
    });
    console.log(
      "[mail] sent OK:",
      info.messageId,
      "| accepted:",
      info.accepted,
      "| rejected:",
      info.rejected
    );
  } catch (err) {
    console.log("[mail] FAILED:", err.code, "|", err.responseCode, "|", err.message);
    throw err; // lets verifyOrder's catch log it without breaking the page
  }
};