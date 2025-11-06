/**
 * Integration-style unit test for sendEmail()
 * ✅ Uses ESM-safe Jest imports
 * ✅ Mocks nodemailer (no actual email)
 * ✅ Closes cleanly
 */

import { jest, describe, test, expect, beforeEach, afterAll } from "@jest/globals";

// --- Mock nodemailer ---
const sendMailMock = jest.fn().mockResolvedValue({ response: "250 OK" });
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));

jest.unstable_mockModule("nodemailer", () => ({
  default: { createTransport: createTransportMock }
}));

// Import function AFTER mocking
const { sendEmail } = await import("../api/utils/sendEmail.js");

describe("📧 sendEmail Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_USER = "test@example.com";
    process.env.EMAIL_PASS = "app-pass";
  });

  test("✅ sends email with correct parameters", async () => {
    await sendEmail("receiver@example.com", "Hello", "Test body");

    // Verify transporter created
    expect(createTransportMock).toHaveBeenCalledWith({
      service: "gmail",
      auth: { user: "test@example.com", pass: "app-pass" }
    });

    // Verify sendMail called with correct mail options
    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"WrikiCafe+" <test@example.com>`,
      to: "receiver@example.com",
      subject: "Hello",
      text: "Test body"
    });
  });

  test("🚫 logs error if sending fails", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP failed"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await sendEmail("user@fail.com", "Err", "fail");

    expect(consoleSpy).toHaveBeenCalledWith("❌ Error sending email:", "SMTP failed");

    consoleSpy.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
