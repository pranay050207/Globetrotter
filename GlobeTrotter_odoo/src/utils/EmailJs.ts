import emailjs from "emailjs-com";

/**
 * Sends an OTP email using EmailJS.
 * 
 * @param userEmail - Recipient's email address
 * @param otpCode - One-time password to send
 * @param expiryTime - Expiry time of OTP
 * @returns Promise from EmailJS
 */
export const sendOtpEmail = async (
  userEmail: string,
  otpCode: string,
  expiryTime: string
): Promise<void> => {
  try {
    const result = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,  // Service ID
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Template ID
      {
        to_email: userEmail,  // Must match variable name in EmailJS template
        passcode: otpCode,
        time: expiryTime,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY   // Public Key
    );

    console.log("Email sent successfully:", result.status, result.text);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
