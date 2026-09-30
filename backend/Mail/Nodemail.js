import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.PROF_GMAIL,      // info@zootsyshop.com
    pass: process.env.PROF_PASSWORD,
  },
});

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const sendOrderEmail = async (order) => {
  const to = order.address?.email;
  if (!to) return;

  const rows = order.items
    .map((i) => {
      const link = i.pdfLink
        ? `<br><a href="${escapeHtml(i.pdfLink)}">Download your PDF pattern</a>`
        : "";
      return `<li style="margin-bottom:12px;">${escapeHtml(i.name)} × ${i.quantity}${link}</li>`;
    })
    .join("");

  await transporter.sendMail({
    from: `"Zootsy Shop" <${process.env.PROF_GMAIL}>`,
    to,
    subject: "Order Confirmation - Thank you for your purchase!",
    html: `
      <h2>Order Confirmation</h2>
      <p>Hello,</p>
      <p>Thank you for your order! We have received your payment.</p>
      <h3>Your patterns</h3>
      <ul>${rows}</ul>
      <p><strong>Order reference:</strong> ${String(order._id).slice(-8)}</p>

      <p>If you have any questions, just reply to this email.</p>
      <p><strong>Zootsy Shop</strong></p>
    `,
  });
};