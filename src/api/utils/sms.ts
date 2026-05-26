import africastalking from 'africastalking';

const at = africastalking({
  apiKey: process.env.AT_API_KEY || 'sandbox',
  username: process.env.AT_USERNAME || 'sandbox',
});

const sms = at.SMS;

/**
 * Sends an OTP SMS to the specified phone number
 * @param phone Phone number in E.164 format
 * @param otp The one-time password to send
 */
export async function sendOTPSMS(phone: string, otp: string) {
  try {
    const options = {
      to: [phone],
      message: `Your FCN verification code is: ${otp}. Valid for 10 minutes.`,
    };

    const response = await sms.send(options);
    console.log('SMS sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // In development/sandbox, we might want to just log it
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP logged to console' };
    }
    throw error;
  }
}
