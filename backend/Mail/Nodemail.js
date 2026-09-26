import Nodemailer from "nodemailer";

const mail = async (req, res) => {
  try {
    let transporter = Nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mirhajisulemanjamali@gmail.com",
        pass: "hoyd fqeg rpqs ckzo",
      },
    });

    const { items }  = req.body;
    console.log("The items are:", items);

    let itemsNew = ""; // Change from 'const' to 'let'
    const itemslength = items.length;
    for (let i = 0; i < itemslength; i++) {
      if (i === itemslength - 1) {
        itemsNew += items[i].name + " x " +  items[i].quantity;
      } else {
        itemsNew += items[i].name + " x " + items[i].quantity + ", ";
      }
    }

    const mailOptions = {
      from: "mirhajisulemanjamali@gmail.com",
      to: req.body.email,
      subject: `Order Confirmation - Thank You, ${req.body.name}!`,
      html: `
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${req.body.name},</p>
        <p>Thank you for your order! We have received your request and are currently processing it.</p>
        <h3 style="color: #555;">Order Summary:</h3>
        <p><strong>Items Ordered:</strong> ${itemsNew}</p>
    
        <p>Your order will be prepared and delivered as soon as possible. If you have any questions, feel free to reply to this email or contact our support team.</p>
    
        <p>We appreciate your trust in us and look forward to serving you again.</p>
    
        <br>
        <p style="font-weight: bold;">Best regards,</p>
        <p><strong>Food Delivery Team</strong></p>
      `,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Mail error:", error);
    res.json({ success: false, message: "Error sending email" });
  }
};

export default mail;
