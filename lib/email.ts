import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// lib/email.ts - Update the interface at the top (around line 10)

export interface RideNotificationData {
  rideId: string;
  userName: string;
  userEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  requestedDate: string;
  requestedTime: string;
  distanceKm?: string;
  tripType?: string;  // ✅ ADD THIS LINE
  status?: string;
  rejectionReason?: string;
  approvedBy?: string;
}

// 1. Email to Admin when user requests a ride
export async function sendRideRequestNotification(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail, 
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
    status 
  } = data;

  // Determine status text and color
  const isLongDistance = status === 'awaiting_pm';
  const statusText = isLongDistance 
    ? '⚠️ Awaiting Project Manager Approval (>25km)' 
    : '⏳ Awaiting Admin Approval';
  const statusColor = isLongDistance ? '#ff9800' : '#2196F3';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .alert-badge {
          background-color: #ff6b6b;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .status-box {
          background-color: ${statusColor}15;
          padding: 15px 20px;
          border-left: 4px solid ${statusColor};
          margin: 20px 0;
          border-radius: 4px;
        }
        .status-box strong {
          color: ${statusColor};
          font-size: 15px;
        }
        .section-title {
          color: #667eea;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .detail-row:hover {
          background-color: #e9ecef;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .distance-highlight {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .distance-highlight .number {
          font-size: 32px;
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .distance-highlight .label {
          font-size: 14px;
          opacity: 0.9;
          color: white;
        }
        .button-container {
          text-align: center;
          margin: 30px 0 20px 0;
        }
        .button { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 5px 0;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚗 New Ride Request</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="alert-badge">
              🔔 Action Required
            </div>
          </div>
          
          <p class="intro-text">
            A new ride has been requested in the Vehicle Management System and requires your attention for approval.
          </p>
          
          <div class="status-box">
            <strong>📋 Status:</strong> ${statusText}
          </div>

          ${distanceKm ? `
          <div class="distance-highlight">
            <span class="number">${distanceKm} km</span>
            <span class="label">Total Distance</span>
          </div>
          ` : ''}
          
          <h3 class="section-title">📝 Request Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Requested By:</span>
            <span class="value">${userName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>User Email:</span>
            <span class="value"><a href="mailto:${userEmail}" style="color: #667eea; text-decoration: none;">${userEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Location Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup Location:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff Location:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <h3 class="section-title">🕐 Schedule</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <div class="button-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin" class="button">
              📊 View Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 New Ride Request - ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    return { success: false, error };
  }
}

// 2. Confirmation email to User when ride is requested
export async function sendRideConfirmationToUser(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
    status 
  } = data;

  const isLongDistance = status === 'awaiting_pm';
  const statusMessage = isLongDistance 
    ? 'Your request requires Project Manager approval due to the distance (>25km). You will receive an email notification once your request is reviewed.' 
    : 'Your request will be reviewed by the Admin team. You will receive an email notification once your request is processed.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .success-badge {
          background-color: #4caf50;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          color: #212529;
          margin-bottom: 15px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .info-box {
          background-color: #e3f2fd;
          padding: 18px 20px;
          border-left: 4px solid #2196f3;
          margin: 20px 0;
          border-radius: 6px;
        }
        .info-box strong {
          color: #1976d2;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .info-box p {
          margin: 0;
          color: #424242;
          line-height: 1.6;
        }
        .section-title {
          color: #56ab2f;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #56ab2f;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .detail-row:hover {
          background-color: #e9ecef;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .distance-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .distance-highlight .number {
          font-size: 32px;
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .distance-highlight .label {
          font-size: 14px;
          opacity: 0.9;
          color: white;
        }
        .note {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #856404;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 5px 0;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Ride Request Confirmed</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">
              ✓ Request Submitted
            </div>
          </div>
          
          <p class="greeting">Hi <strong>${userName}</strong>,</p>
          <p class="intro-text">
            Your ride request has been successfully submitted to our system!
          </p>
          
          <div class="info-box">
            <strong>ℹ️ What happens next?</strong>
            <p>${statusMessage}</p>
          </div>

          ${distanceKm ? `
          <div class="distance-highlight">
            <span class="number">${distanceKm} km</span>
            <span class="label">Estimated Distance</span>
          </div>
          ` : ''}
          
          <h3 class="section-title">📋 Your Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <div class="note">
            <strong>📌 Important:</strong> Please keep this email for your records. You can track the status of your ride request in your dashboard.
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            If you have any questions or need to make changes to your request, please contact our support team.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated confirmation email. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">If you did not make this request, please contact support immediately.</p>
          <p style="color: #adb5bd;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `✅ Ride Request Confirmation - ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ User confirmation email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending user confirmation email:', error);
    return { success: false, error };
  }
}

// 3. NEW: Email to User when ride is APPROVED
export async function sendRideApprovedNotification(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm 
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .success-badge {
          background-color: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .success-box {
          background-color: #d1fae5;
          padding: 18px 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 6px;
        }
        .success-box strong {
          color: #059669;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .success-box p {
          margin: 0;
          color: #065f46;
          line-height: 1.6;
        }
        .section-title {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #10b981;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Ride Request Approved!</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">
              ✓ Approved
            </div>
          </div>
          
          <p class="intro-text" style="font-size: 18px;">
            Hi <strong>${userName}</strong>,
          </p>
          <p class="intro-text">
            Great news! Your ride request has been <strong>approved</strong> by the admin team.
          </p>
          
          <div class="success-box">
            <strong>🎉 What's Next?</strong>
            <p>A driver will be assigned to your ride shortly. You will receive another notification once a driver has been assigned with their details.</p>
          </div>
          
          <h3 class="section-title">📋 Approved Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          ${distanceKm ? `
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value">${distanceKm} km</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            Please be ready at your pickup location at the scheduled time. If you need to make any changes, please contact support.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `✅ Ride Approved - ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Ride approval email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending ride approval email:', error);
    return { success: false, error };
  }
}

// 4. NEW: Email to User when ride is REJECTED
export async function sendRideRejectedNotification(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
    rejectionReason,
    approvedBy 
  } = data;

  const rejectedBy = approvedBy || 'Admin'; 

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .rejected-badge {
          background-color: #ef4444;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .warning-box {
          background-color: #fee2e2;
          padding: 18px 20px;
          border-left: 4px solid #ef4444;
          margin: 20px 0;
          border-radius: 6px;
        }
        .warning-box strong {
          color: #dc2626;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .warning-box p {
          margin: 0;
          color: #7f1d1d;
          line-height: 1.6;
        }
        .info-box {
          background-color: #dbeafe;
          padding: 18px 20px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
          border-radius: 6px;
        }
        .info-box strong {
          color: #1d4ed8;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .info-box p {
          margin: 0;
          color: #1e3a8a;
          line-height: 1.6;
        }
        .section-title {
          color: #ef4444;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #ef4444;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ Ride Request Not Approved</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="rejected-badge">
              ✕ Not Approved
            </div>
          </div>
          
          <p class="intro-text" style="font-size: 18px;">
            Hi <strong>${userName}</strong>,
          </p>
          <p class="intro-text">
            We regret to inform you that your ride request has not been approved by the <strong>${rejectedBy}</strong>.
          </p>
          
          ${rejectionReason ? `
          <div class="warning-box">
            <strong>📝 Reason for Rejection:</strong>
            <p>${rejectionReason}</p>
          </div>
          ` : ''}
          
          <div class="info-box">
            <strong>💡 What can you do?</strong>
            <p>You can submit a new ride request with updated details, or contact our support team for assistance.</p>
          </div>
          
          <h3 class="section-title">📋 Rejected Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          ${distanceKm ? `
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value">${distanceKm} km</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            If you believe this is a mistake or need further clarification, please don't hesitate to contact our support team.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `❌ Ride Request Not Approved - ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Ride rejection email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending ride rejection email:', error);
    return { success: false, error };
  }
}



// lib/email.ts - Replace the sendRideToPMNotification function

export async function sendRideToPMNotification(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail, 
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
  } = data;

  console.log('📧 sendRideToPMNotification called with:', {
    rideId,
    pmEmail: process.env.PM_EMAIL,
    distanceKm
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .alert-badge {
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .warning-box {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          padding: 18px 20px;
          border-left: 4px solid #8b5cf6;
          margin: 20px 0;
          border-radius: 6px;
        }
        .warning-box strong {
          color: #7c3aed;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .warning-box p {
          margin: 0;
          color: #5b21b6;
          line-height: 1.6;
        }
        .distance-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }
        .distance-highlight .number {
          font-size: 42px;
          font-weight: bold;
          display: block;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .distance-highlight .label {
          font-size: 14px;
          opacity: 0.9;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .distance-highlight .badge {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          margin-top: 12px;
          display: inline-block;
          font-weight: bold;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .section-title {
          color: #7c3aed;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #a855f7;
          background: linear-gradient(90deg, #a855f7 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #faf5ff;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
          border-left: 3px solid #a855f7;
          transition: all 0.3s ease;
        }
        .detail-row:hover {
          background-color: #f3e8ff;
          transform: translateX(5px);
        }
        .label { 
          font-weight: 600;
          color: #6b21a8;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #1f2937;
          font-size: 14px;
          flex: 1;
        }
        .button-container {
          text-align: center;
          margin: 30px 0 20px 0;
        }
        .button { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .footer { 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
        .icon {
          margin-right: 8px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
        .pm-badge {
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚗 Long Distance Ride Request</h2>
          <p>Vehicle Management System <span class="pm-badge">PM Approval</span></p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="alert-badge">
              ⚠️ PM Action Required
            </div>
          </div>
          
          <p class="intro-text">
            A new <strong>long-distance ride request</strong> (&gt;25km) has been submitted and requires your approval as Project Manager.
          </p>
          
          <div class="distance-highlight">
            <span class="number">${distanceKm} km</span>
            <span class="label">Total Distance</span>
            <div class="badge">⚡ LONG DISTANCE TRIP</div>
          </div>

          <div class="warning-box">
            <strong>⚠️ Important Notice:</strong>
            <p>This ride exceeds the 25km threshold and requires Project Manager approval before proceeding to admin assignment and driver allocation.</p>
          </div>
          
          <h3 class="section-title">📝 Request Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Requested By:</span>
            <span class="value">${userName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>User Email:</span>
            <span class="value"><a href="mailto:${userEmail}" style="color: #7c3aed; text-decoration: none;">${userEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Route Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup Location:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff Location:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong style="color: #7c3aed;">${distanceKm} km</strong></span>
          </div>
          
          <h3 class="section-title">🕐 Schedule</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <div class="button-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/project_manager" class="button">
              📊 Review in Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification for Project Manager review.</p>
          <p style="color: #9ca3af; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.PM_EMAIL,
    subject: `⚠️ Long Distance Ride Request - ${rideId} (${distanceKm} km)`,
    html: htmlContent,
  };

  console.log('📤 Sending email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PM notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending PM notification email:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      code: (error as any).code,
      response: (error as any).response
    });
    return { success: false, error };
  }
}



// lib/email.ts - Replace the sendRidePMApprovedNotification function

export async function sendRidePMApprovedNotification(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm 
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .success-badge {
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .success-box {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          padding: 18px 20px;
          border-left: 4px solid #8b5cf6;
          margin: 20px 0;
          border-radius: 6px;
        }
        .success-box strong {
          color: #7c3aed;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .success-box p {
          margin: 0;
          color: #5b21b6;
          line-height: 1.6;
        }
        .info-box {
          background-color: #dbeafe;
          padding: 18px 20px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
          border-radius: 6px;
        }
        .info-box strong {
          color: #1d4ed8;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .info-box p {
          margin: 0;
          color: #1e3a8a;
          line-height: 1.6;
        }
        .section-title {
          color: #7c3aed;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #a855f7;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
        
        /* Progress Steps */
        .progress-container {
          margin: 25px 0;
          padding: 25px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        .progress-steps {
          display: table;
          width: 100%;
          table-layout: fixed;
          margin: 0;
          padding: 0;
        }
        .step {
          display: table-cell;
          text-align: center;
          position: relative;
          vertical-align: top;
          padding: 0 5px;
        }
        .step-icon-wrapper {
          position: relative;
          z-index: 2;
        }
        .step-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin: 0 auto 12px;
          font-weight: bold;
        }
        .step-done {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }
        .step-current {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
          animation: pulse 2s infinite;
        }
        .step-pending {
          background-color: #e5e7eb;
          color: #9ca3af;
          border: 2px dashed #d1d5db;
        }
        .step-label {
          font-size: 12px;
          color: #374151;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-top: 8px;
        }
        .step-label-done {
          color: #059669;
        }
        .step-label-current {
          color: #d97706;
        }
        .step-label-pending {
          color: #9ca3af;
        }
        
        /* Connector line between steps */
        .step::before {
          content: '';
          position: absolute;
          top: 25px;
          left: -50%;
          width: 100%;
          height: 3px;
          background-color: #e5e7eb;
          z-index: 1;
        }
        .step:first-child::before {
          display: none;
        }
        .step-done::before,
        .step-current::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ PM Approval Received!</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">
              ✓ PM Approved
            </div>
          </div>
          
          <p class="intro-text" style="font-size: 18px;">
            Hi <strong>${userName}</strong>,
          </p>
          <p class="intro-text">
            Good news! Your long-distance ride request has been <strong>approved by the Project Manager</strong>.
          </p>
          
          <div class="success-box">
            <strong>✅ Project Manager Approval Complete</strong>
            <p>Your ride request has passed the first approval stage. It is now awaiting final admin approval for driver assignment.</p>
          </div>
          
          <div class="info-box">
            <strong>📋 What's Next?</strong>
            <p>Your ride is now awaiting admin approval. Once approved by the admin team, a driver will be assigned to your ride and you'll receive another notification.</p>
          </div>
          
          <h3 class="section-title">📋 Your Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          ${distanceKm ? `
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value">${distanceKm} km</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            You will be notified once the admin team reviews and approves your request.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `✅ PM Approved Your Ride - ${rideId} - Awaiting Admin Review`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PM approval email sent to user: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending PM approval email:', error);
    return { success: false, error };
  }
}



// lib/email.ts - Add these NEW functions at the end

// 7. NEW: Email to Admin when PM approves a ride
export async function sendPMApprovalToAdmin(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail, 
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .alert-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .success-box {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 18px 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 6px;
        }
        .success-box strong {
          color: #059669;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .success-box p {
          margin: 0;
          color: #065f46;
          line-height: 1.6;
        }
        .section-title {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #10b981;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .button-container {
          text-align: center;
          margin: 30px 0 20px 0;
        }
        .button { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ PM Approved Long Distance Ride</h2>
          <p>Vehicle Management System - Admin Action Required</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="alert-badge">
              🔔 Action Required
            </div>
          </div>
          
          <p class="intro-text">
            The Project Manager has <strong>approved</strong> a long-distance ride request. This ride now requires your final approval and driver assignment.
          </p>
          
          <div class="success-box">
            <strong>✅ PM Approval Status</strong>
            <p>The Project Manager has reviewed and approved this ${distanceKm} km ride. The ride is now in your queue for final approval and driver assignment.</p>
          </div>
          
          <h3 class="section-title">📝 Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Customer:</span>
            <span class="value">${userName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>Customer Email:</span>
            <span class="value"><a href="mailto:${userEmail}" style="color: #10b981; text-decoration: none;">${userEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Route Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup Location:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff Location:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong style="color: #10b981;">${distanceKm} km</strong></span>
          </div>
          
          <h3 class="section-title">🕐 Schedule</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Requested Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Requested Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <div class="button-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin" class="button">
              📊 Review & Assign Driver
            </a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `✅ PM Approved - Ride ${rideId} Awaiting Your Review`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PM approval notification sent to admin: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending PM approval notification to admin:', error);
    return { success: false, error };
  }
}

// 8. NEW: Email to Admin when PM rejects a ride
export async function sendPMRejectionToAdmin(data: RideNotificationData) {
  const { 
    rideId, 
    userName, 
    userEmail, 
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm,
    rejectionReason
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .info-badge {
          background-color: #6b7280;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .warning-box {
          background-color: #fee2e2;
          padding: 18px 20px;
          border-left: 4px solid #ef4444;
          margin: 20px 0;
          border-radius: 6px;
        }
        .warning-box strong {
          color: #dc2626;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .warning-box p {
          margin: 0;
          color: #7f1d1d;
          line-height: 1.6;
        }
        .section-title {
          color: #6b7280;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #9ca3af;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ PM Rejected Long Distance Ride</h2>
          <p>Vehicle Management System - FYI</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="info-badge">
              ℹ️ For Your Information
            </div>
          </div>
          
          <p class="intro-text">
            The Project Manager has <strong>rejected</strong> a long-distance ride request. This is for your information - no action required.
          </p>
          
          ${rejectionReason ? `
          <div class="warning-box">
            <strong>📝 PM Rejection Reason:</strong>
            <p>${rejectionReason}</p>
          </div>
          ` : ''}
          
          <h3 class="section-title">📝 Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Customer:</span>
            <span class="value">${userName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>Customer Email:</span>
            <span class="value"><a href="mailto:${userEmail}" style="color: #6b7280; text-decoration: none;">${userEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Route Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup Location:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff Location:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong>${distanceKm} km</strong></span>
          </div>
          
          <h3 class="section-title">🕐 Schedule</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Requested Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Requested Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            The customer has been notified of the rejection. This notification is for your records only.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `❌ PM Rejected - Ride ${rideId} (FYI)`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ PM rejection notification sent to admin: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending PM rejection notification to admin:', error);
    return { success: false, error };
  }
}

// lib/email.ts - Add these TWO NEW functions at the end

// Update the interface first to include driver/vehicle info
export interface DriverAssignmentData extends RideNotificationData {
  driverName: string;
  driverEmail: string;
  driverPhone?: string;
  vehicleName: string;
  vehicleType: string;
  vehicleNumber: string;
}

// 9. NEW: Email to User when driver and vehicle are assigned
export async function sendDriverAssignmentToUser(data: DriverAssignmentData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    driverName,
    driverEmail,
    driverPhone,
    vehicleName,
    vehicleType,
    vehicleNumber,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm 
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .success-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .success-box {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 18px 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 6px;
        }
        .success-box strong {
          color: #059669;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .success-box p {
          margin: 0;
          color: #065f46;
          line-height: 1.6;
        }
        .driver-card {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #8b5cf6;
        }
        .driver-card h3 {
          margin: 0 0 15px 0;
          color: #6b21a8;
          font-size: 18px;
        }
        .driver-detail {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .driver-detail .icon {
          width: 24px;
          height: 24px;
          background-color: #8b5cf6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .section-title {
          color: #667eea;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚗 Driver Assigned to Your Ride!</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">
              ✓ Driver Assigned
            </div>
          </div>
          
          <p class="intro-text" style="font-size: 18px;">
            Hi <strong>${userName}</strong>,
          </p>
          <p class="intro-text">
            Great news! A driver and vehicle have been assigned to your ride. Your journey is all set!
          </p>
          
          <div class="success-box">
            <strong>🎉 Ready to Go!</strong>
            <p>Your driver will contact you shortly before the scheduled pickup time. Please be ready at your pickup location.</p>
          </div>

          <div class="driver-card">
            <h3>👤 Your Driver Information</h3>
            
            <div class="driver-detail">
              <div class="icon">👨</div>
              <div>
                <strong>Driver Name:</strong> ${driverName}
              </div>
            </div>
            
            <div class="driver-detail">
              <div class="icon">📧</div>
              <div>
                <strong>Email:</strong> <a href="mailto:${driverEmail}" style="color: #6b21a8;">${driverEmail}</a>
              </div>
            </div>
            
            ${driverPhone ? `
            <div class="driver-detail">
              <div class="icon">📞</div>
              <div>
                <strong>Phone:</strong> ${driverPhone}
              </div>
            </div>
            ` : ''}
            
            <div class="driver-detail">
              <div class="icon">🚗</div>
              <div>
                <strong>Vehicle:</strong> ${vehicleName} (${vehicleType})
              </div>
            </div>
            
            <div class="driver-detail">
              <div class="icon">🔢</div>
              <div>
                <strong>Vehicle Number:</strong> ${vehicleNumber}
              </div>
            </div>
          </div>
          
          <h3 class="section-title">📋 Your Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          ${distanceKm ? `
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value">${distanceKm} km</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            Please be at your pickup location on time. If you have any questions, feel free to contact your driver directly.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>Have a safe journey!</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: userEmail,
    subject: `🚗 Driver Assigned - ${driverName} will be your driver - Ride ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Driver assignment email sent to user: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending driver assignment email to user:', error);
    return { success: false, error };
  }
}

// 10. NEW: Email to PM when admin assigns driver (only for PM-approved rides)
export async function sendDriverAssignmentToPM(data: DriverAssignmentData) {
  const { 
    rideId, 
    userName, 
    userEmail,
    driverName,
    driverEmail,
    vehicleName,
    vehicleType,
    vehicleNumber,
    pickupLocation, 
    dropoffLocation, 
    requestedDate, 
    requestedTime,
    distanceKm 
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .info-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .success-box {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 18px 20px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
          border-radius: 6px;
        }
        .success-box strong {
          color: #1d4ed8;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .success-box p {
          margin: 0;
          color: #1e3a8a;
          line-height: 1.6;
        }
        .section-title {
          color: #667eea;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Driver Assigned - Ride Confirmed</h2>
          <p>Vehicle Management System - PM Update</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="info-badge">
              ℹ️ FYI - Driver Assigned
            </div>
          </div>
          
          <p class="intro-text">
            The admin has assigned a driver and vehicle to the long-distance ride you approved. The ride is now ready to commence.
          </p>
          
          <div class="success-box">
            <strong>✅ Assignment Complete</strong>
            <p>Driver <strong>${driverName}</strong> has been assigned to drive <strong>${vehicleName}</strong> for this ${distanceKm} km ride.</p>
          </div>
          
          <h3 class="section-title">👤 Driver & Vehicle Assignment</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👨</span>Driver Name:</span>
            <span class="value"><strong>${driverName}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>Driver Email:</span>
            <span class="value">${driverEmail}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🚗</span>Vehicle:</span>
            <span class="value">${vehicleName} (${vehicleType})</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔢</span>Vehicle Number:</span>
            <span class="value">${vehicleNumber}</span>
          </div>
          
          <h3 class="section-title">📝 Ride Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Passenger:</span>
            <span class="value">${userName} (${userEmail})</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong>${distanceKm} km</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Scheduled Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Scheduled Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            This is an informational notification. No action is required from your end.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.PM_EMAIL,
    subject: `✅ Driver Assigned to Ride ${rideId} (PM-Approved)`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Driver assignment notification sent to PM: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending driver assignment notification to PM:', error);
    return { success: false, error };
  }
}


export async function sendPMApprovalToUser(data: {
  userName: string;
  userEmail: string;
  rideId: string;
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: string;
  tripType: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: `✅ Your Ride Request Approved by Project Manager - ID: ${data.rideId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">✅ Ride Request Approved!</h2>
          
          <p>Dear <strong>${data.userName}</strong>,</p>
          
          <p>Great news! Your ride request has been <strong>approved by the Project Manager</strong>.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">Ride Details:</h3>
            <p><strong>Ride ID:</strong> ${data.rideId}</p>
            <p><strong>Trip Type:</strong> <span style="color: #7c3aed;">${data.tripType}</span></p>
            <p><strong>Distance:</strong> ${data.distanceKm} km</p>
            <p><strong>From:</strong> ${data.pickupLocation}</p>
            <p><strong>To:</strong> ${data.dropoffLocation}</p>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #2563eb;">📋 Next Steps:</h4>
            <p>Your ride is now being processed by the Admin team. A driver and vehicle will be assigned to you shortly.</p>
            <p>You will receive another email once a driver has been assigned.</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using our service!<br>
            <strong>Route Management System</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Send PM approval to user error:', error);
    return { success: false, error };
  }
}



// 11. NEW: Email to DRIVER when they are assigned to a ride
export async function sendAssignmentNotificationToDriver(data: {
  driverName: string;
  driverEmail: string;
  rideId: string;
  userName: string;
  userEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: string;
  tripType: string;
  vehicleName: string;
  vehicleType: string;
  vehicleNumber: string;
  requestedDate: string;
  requestedTime: string;
}) {
  const { 
    driverName,
    driverEmail,
    rideId,
    userName,
    userEmail,
    pickupLocation,
    dropoffLocation,
    distanceKm,
    tripType,
    vehicleName,
    vehicleType,
    vehicleNumber,
    requestedDate,
    requestedTime
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .success-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .content { 
          padding: 30px;
        }
        .greeting {
          font-size: 20px;
          color: #212529;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .highlight-box {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          padding: 20px;
          border-left: 4px solid #8b5cf6;
          margin: 20px 0;
          border-radius: 8px;
        }
        .highlight-box strong {
          color: #7c3aed;
          display: block;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .highlight-box p {
          margin: 5px 0;
          color: #5b21b6;
          line-height: 1.6;
        }
        .section-title {
          color: #667eea;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #667eea;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .detail-row:hover {
          background-color: #e9ecef;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .vehicle-card {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #3b82f6;
        }
        .vehicle-card h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 18px;
        }
        .action-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 18px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .action-box strong {
          color: #856404;
          display: block;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .action-box p {
          margin: 0;
          color: #856404;
          line-height: 1.6;
        }
        .button-container {
          text-align: center;
          margin: 30px 0 20px 0;
        }
        .button { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 5px 0;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚗 New Ride Assignment!</h2>
          <p>Vehicle Management System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">
              ✓ You've Been Assigned
            </div>
          </div>
          
          <p class="greeting">Hi <strong>${driverName}</strong>,</p>
          <p class="intro-text">
            You have been assigned to a new ride by the admin. Please review the details below and prepare for the trip.
          </p>
          
          <div class="highlight-box">
            <strong>📋 Assignment Summary</strong>
            <p><strong>Ride ID:</strong> ${rideId}</p>
            <p><strong>Trip Type:</strong> ${tripType}</p>
            <p><strong>Distance:</strong> ${distanceKm} km</p>
          </div>

          <div class="vehicle-card">
            <h3>🚙 Your Assigned Vehicle</h3>
            <div class="detail-row" style="background-color: white; margin-bottom: 8px;">
              <span class="label"><span class="icon">🚗</span>Vehicle Name:</span>
              <span class="value"><strong>${vehicleName}</strong></span>
            </div>
            <div class="detail-row" style="background-color: white; margin-bottom: 8px;">
              <span class="label"><span class="icon">🔧</span>Type:</span>
              <span class="value">${vehicleType}</span>
            </div>
            <div class="detail-row" style="background-color: white;">
              <span class="label"><span class="icon">🔢</span>Registration:</span>
              <span class="value">${vehicleNumber}</span>
            </div>
          </div>
          
          <h3 class="section-title">👤 Customer Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Customer Name:</span>
            <span class="value">${userName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>Customer Email:</span>
            <span class="value"><a href="mailto:${userEmail}" style="color: #667eea; text-decoration: none;">${userEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Trip Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup Location:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff Location:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong>${distanceKm} km</strong></span>
          </div>
          
          <h3 class="section-title">🕐 Schedule</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📅</span>Requested Date:</span>
            <span class="value">${requestedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">⏰</span>Requested Time:</span>
            <span class="value">${requestedTime}</span>
          </div>
          
          <div class="action-box">
            <strong>⚠️ Next Steps:</strong>
            <p>1. Review the trip details above<br>
            2. Ensure the vehicle is ready and fueled<br>
            3. Login to your driver dashboard<br>
            4. Click "Start Ride" and enter the starting odometer reading when ready</p>
          </div>
          
          <div class="button-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/driver" class="button">
              📊 Go to Driver Dashboard
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7; text-align: center;">
            If you have any questions or concerns about this assignment, please contact the admin immediately.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: driverEmail,
    subject: `🚗 New Ride Assignment - ${vehicleName} - Ride ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Driver assignment notification sent to ${driverName} (${driverEmail}):`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending driver assignment notification to ${driverEmail}:`, error);
    return { success: false, error };
  }
}

// 12. NEW: Email to ADMIN when driver starts a ride
export async function sendRideStartNotificationToAdmin(data: {
  rideId: string;
  driverName: string;
  driverEmail: string;
  vehicleName: string;
  vehicleType: string;
  vehicleNumber: string;
  startMileage: number;
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: string;
  tripType: string;
  userName: string;
  userEmail: string;
  startedAt: string;
}) {
  const { 
    rideId,
    driverName,
    driverEmail,
    vehicleName,
    vehicleType,
    vehicleNumber,
    startMileage,
    pickupLocation,
    dropoffLocation,
    distanceKm,
    tripType,
    userName,
    userEmail,
    startedAt
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h2 { 
          margin: 0; 
          font-size: 26px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .status-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .content { 
          padding: 30px;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        .info-box {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 8px;
        }
        .info-box strong {
          color: #059669;
          display: block;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .info-box p {
          margin: 5px 0;
          color: #065f46;
          line-height: 1.6;
        }
        .section-title {
          color: #10b981;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #10b981;
        }
        .detail-row { 
          margin: 12px 0;
          padding: 14px;
          background-color: #f8f9fa;
          border-radius: 6px;
          display: flex;
          align-items: flex-start;
        }
        .label { 
          font-weight: 600;
          color: #495057;
          min-width: 160px;
          display: inline-block;
          font-size: 14px;
        }
        .value { 
          color: #212529;
          font-size: 14px;
          flex: 1;
        }
        .mileage-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
        }
        .mileage-highlight .number {
          font-size: 36px;
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .mileage-highlight .label {
          font-size: 14px;
          opacity: 0.9;
        }
        .footer { 
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
          border-top: 1px solid #e9ecef;
        }
        .icon {
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🚀 Ride Started!</h2>
          <p>Vehicle Management System - Admin Notification</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="status-badge">
              ✓ Ride In Progress
            </div>
          </div>
          
          <p class="intro-text">
            <strong>${driverName}</strong> has started the ride. The vehicle is now in transit.
          </p>
          
          <div class="info-box">
            <strong>📋 Ride Started</strong>
            <p><strong>Driver:</strong> ${driverName} (${driverEmail})</p>
            <p><strong>Vehicle:</strong> ${vehicleName} (${vehicleType})</p>
            <p><strong>Started At:</strong> ${startedAt}</p>
          </div>

          <div class="mileage-highlight">
            <span class="number">${startMileage} km</span>
            <span class="label">Starting Odometer Reading</span>
          </div>
          
          <h3 class="section-title">🚗 Vehicle Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🚙</span>Vehicle:</span>
            <span class="value"><strong>${vehicleName}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔧</span>Type:</span>
            <span class="value">${vehicleType}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔢</span>Registration:</span>
            <span class="value">${vehicleNumber}</span>
          </div>
          
          <h3 class="section-title">👨‍✈️ Driver Information</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Driver Name:</span>
            <span class="value">${driverName}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📧</span>Driver Email:</span>
            <span class="value"><a href="mailto:${driverEmail}" style="color: #10b981; text-decoration: none;">${driverEmail}</a></span>
          </div>
          
          <h3 class="section-title">📍 Trip Details</h3>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🆔</span>Ride ID:</span>
            <span class="value"><strong>${rideId}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔄</span>Trip Type:</span>
            <span class="value">${tripType}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">👤</span>Customer:</span>
            <span class="value">${userName} (${userEmail})</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🟢</span>Pickup:</span>
            <span class="value">${pickupLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">🔴</span>Dropoff:</span>
            <span class="value">${dropoffLocation}</span>
          </div>
          
          <div class="detail-row">
            <span class="label"><span class="icon">📏</span>Distance:</span>
            <span class="value"><strong>${distanceKm} km</strong></span>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; line-height: 1.7;">
            This ride is now in progress. You will receive another notification when the ride is completed.
          </p>
        </div>
        <div class="footer">
          <p><strong>Vehicle Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p style="color: #adb5bd; margin-top: 10px;">© ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚀 Ride Started - ${driverName} - ${vehicleName} - Ride ${rideId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Ride start notification sent to admin:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending ride start notification to admin:', error);
    return { success: false, error };
  }
}