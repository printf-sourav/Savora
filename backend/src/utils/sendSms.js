import axios from "axios";

/**
 * Send an SMS OTP via TextBelt.
 *
 * @param {object} options
 * @param {string} options.phone  – 10-digit mobile number (no country code)
 * @param {string} options.otp   – 6-digit OTP string
 */
const sendSms = async ({ phone, otp }) => {
  const apiKey = process.env.TEXTBELT_API_KEY || "textbelt";

  // Sanitise: strip country code prefix if present
  const mobile = String(phone).replace(/\D/g, "");

  if (mobile.length !== 10) {
    throw new Error(`Invalid phone number: ${phone}`);
  }

  let response;
  try {
    response = await axios.post(
      "https://textbelt.com/text",
      {
        phone: mobile,
        message: `Your Savora verification OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        key: apiKey,
      }
    );
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(
        `TextBelt API Error: ${JSON.stringify(error.response.data)}`
      );
    }
    throw new Error(`SMS Provider Error: ${error.message}`);
  }

  if (!response.data?.success) {
    throw new Error(
      `TextBelt error: ${JSON.stringify(response.data?.error || response.data)}`
    );
  }

  return response.data;
};

export default sendSms;
