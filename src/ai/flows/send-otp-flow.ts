'use server';
/**
 * Sends a 6-digit OTP to the user's email using Brevo (Sendinblue)
 * ✅ Secure version — no exposed API keys in code
 */

import { z } from 'genkit';
import Brevo from '@getbrevo/brevo';

// 🧩 Input schema
const SendOtpInputSchema = z.string().email();
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

// 🧩 Output schema
const SendOtpOutputSchema = z.object({
  otp: z.string(),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(email: SendOtpInput): Promise<SendOtpOutput> {
  // ✅ Validate email
  SendOtpInputSchema.parse(email);

  // ✅ Load API key from environment variable
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('❌ Missing BREVO_API_KEY in environment variables.');
  }

  // ✅ Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Initialize Brevo client
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  // ✅ Prepare the email template
  const sendSmtpEmail: Brevo.SendSmtpEmail = {
    sender: { name: 'NSSC', email: 'no-reply@nssc.com' },
    to: [{ email }],
    subject: 'Your OTP for NSSC Registration',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; text-align: center; background: #fff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #007bff;">NSSC Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 2px; color: #333;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    // ✅ Send the OTP email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ OTP sent successfully to ${email}`, response);
    return { otp };
  } catch (error: any) {
    console.error('❌ Brevo API Error:', error);
    const message =
      error?.response?.body?.message ||
      error?.message ||
      'Failed to send OTP email.';
    throw new Error(`❌ Failed to send OTP: ${message}`);
  }
}
