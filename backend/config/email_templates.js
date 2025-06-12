export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification - VenueGo</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #2D9CDB; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to VenueGo!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #333333;">Hey there,</p>
              <p style="font-size: 16px; color: #333333;">
                We're thrilled to have you on board! Before you can start discovering and reserving amazing spaces, please confirm your email with the verification code below.
              </p>
              <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; background-color: #2D9CDB; color: #ffffff; font-size: 30px; font-weight: bold; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
                  {verificationCode}
                </span>
              </div>
              <p style="font-size: 16px; color: #333333;">
                Enter this code on the verification page to activate your account. Please note that this code is only valid for the next 15 minutes.
              </p>
              <p style="font-size: 16px; color: #777777;">
                Didn’t request this email? You can safely ignore it.
              </p>
              <p style="font-size: 16px; color: #333333;">
                Cheers,<br />
                The VenueGo Crew
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f7f9fb; padding: 20px; text-align: center; font-size: 14px; color: #999999;">
              © ${new Date().getFullYear()} VenueGo. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


export const WELCOME_MESSAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VenueVerse! 🎉</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2196F3, #0b79d0); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to VenueVerse! 🎊</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {username},</p>
    <p>Thank you for joining <strong>VenueVerse</strong>, your go-to platform for booking and managing venues! 🏢✨</p>
    <p>Here's what you can do to get started:</p>
    <ul>
      <li>Explore available venues and find the perfect space for your events. 🎭</li>
      <li>Book venues seamlessly and manage your reservations. 📅</li>
      <li>Set up your own venue listings and attract customers. 💼</li>
    </ul>
    <p>If you need any assistance, our support team is here to help. 💬</p>
    <p>We’re excited to have you with us!</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful 🔒</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful ✅</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{username}</strong>,</p>
    <p>Your password for <strong>VenueVerse</strong> has been successfully reset. 🔑</p>
    <p>If you did not initiate this password reset, please contact our support team immediately to secure your account. 🚨</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password 🔄</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Request 🔄</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password for your <strong>VenueVerse</strong> account. If you didn't make this request, you can safely ignore this email. 🚫</p>
    <p>To reset your password, please click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">🔐 Reset Password</a>
    </div>
    <p>This reset link will expire in 1 hour. ⏳</p>
    <p>Best regards,<br>The VenueVerse Team</p>
  </div>
</body>
</html>
`;


export const BOOKING_REQUEST_APPLIED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venue Booking Applied</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #FFD700, #FFA500); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🎉 Venue Booking Applied! 🏢</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{username}</strong>,</p>
    <p>Thank you for applying to book the venue <strong>{venueName}</strong>! 🎊</p>
    <p>Here are your booking details:</p>
    <ul>
      <li>📍 Venue: <strong>{venueName}</strong></li>
      <li>📅 Date: <strong>{bookingDate}</strong></li>
      <li>⏰ Time: <strong>{bookingTime}</strong></li>
      <li>👥 Guests: <strong>{guestCount}</strong></li>
    </ul>
    <p>Your booking is now under review. We will notify you once it is approved. ✅</p>
    <p>Best regards,<br>VenueVerse Team</p>
  </div>
</body>
</html>
`

export const BOOKING_REQUEST_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venue Booking Rejected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #FF5733, #C70039); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">❌ Booking Rejected</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{username}</strong>,</p>
    <p>We regret to inform you that your venue booking request for <strong>{venueName}</strong> on <strong>{bookingDate}</strong> has been rejected. 😞</p>
    <p>Reason: <strong>{rejectionReason}</strong></p>
    <p>If you need assistance or would like to book an alternative venue, please feel free to contact us. 📩</p>
    <p>Best regards,<br>VenueVerse Team</p>
  </div>
</body>
</html>
`

export const BOOKING_REQUEST_APPROVED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venue Booking Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">✅ Booking Approved! 🎉</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{username}</strong>,</p>
    <p>Great news! Your booking for <strong>{venueName}</strong> on <strong>{bookingDate}</strong> has been approved! 🎊</p>
    <p>Here are your booking details:</p>
    <ul>
      <li>📍 Venue: <strong>{venueName}</strong></li>
      <li>📅 Date: <strong>{bookingDate}</strong></li>
      <li>⏰ Time: <strong>{bookingTime}</strong></li>
      <li>👥 Guests: <strong>{guestCount}</strong></li>
    </ul>
    <p>We look forward to hosting your event. Enjoy your time at VenueVerse! 🎶🏢</p>
    <p>Best regards,<br>VenueVerse Team</p>
  </div>
</body>
</html>
`
