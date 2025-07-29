import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (email: string, name: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code - HD Auth',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
     
          <h1 style="color: #3B82F6; font-weight: 700; font-size: 28px; margin-bottom: 5px; letter-spacing: 2px;">
            HD Auth
          </h1>
          <h2 style="color: #1F2937; margin: 0; font-weight: 600;">Your OTP Code</h2>
        </div>

        <div style="background-color: #F9FAFB; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h3 style="color: #1F2937; margin-bottom: 10px;">Hello ${name},</h3>
          <p style="color: #6B7280; margin-bottom: 20px;">Your verification code is:</p>
          <div style="background-color: #3B82F6; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #6B7280; margin-top: 20px; font-size: 14px;">
            This code will expire in ${process.env.OTP_EXPIRE_MINUTES || '5'} minutes.
          </p>
        </div>

        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>© 2025 HD Auth. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
