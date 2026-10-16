"use server";

import nodemailer from "nodemailer";

export async function submitContactForm(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    // Validate required fields
    if (!name || !email || !message) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    // Check environment variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      !process.env.CONTACT_EMAIL
    ) {
      console.error("Missing SMTP configuration.");

      return {
        success: false,
        message: "Email service is not configured.",
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: subject || `Contact Form Message from ${name}`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    });

    return {
      success: true,
      message: "Your message has been sent successfully.",
    };
  } catch (error) {
    console.error("Contact form error:", error);

    return {
      success: false,
      message: "Unable to send your message. Please try again later.",
    };
  }
}