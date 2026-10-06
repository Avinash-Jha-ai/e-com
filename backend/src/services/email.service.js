import { transporter } from "../configs/email.js";

export const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        ">

          <h2 style="text-align: center;">
            Verify Your Email
          </h2>

          <p>
            Thank you for creating an account with us.
          </p>

          <p>
            Your verification OTP is:
          </p>

          <div style="
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 25px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this OTP, you can safely ignore this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #777;">
            This is an automated email. Please do not reply.
          </p>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 OTP email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send OTP email");
  }
};