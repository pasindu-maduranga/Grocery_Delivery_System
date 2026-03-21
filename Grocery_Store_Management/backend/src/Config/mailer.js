const nodemailer = require('nodemailer')

const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

const sendSupplierApprovalEmail = async ({ to, businessName, username, password, roleName }) => {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Grocery Store Management" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Your Supplier Application Has Been Approved',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="width:60px;height:60px;background:#16a34a;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="color:#fff;font-size:30px;line-height:1;">✓</span>
          </div>
          <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 6px;">Application Approved!</h1>
          <p style="color:#6b7280;font-size:14px;margin:0;">Welcome to the Grocery Store Supplier Network</p>
        </div>

        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Dear <strong>${businessName}</strong>,<br/><br/>
          We are pleased to inform you that your supplier application has been <strong style="color:#16a34a;">approved</strong>.
          You can now log in to the supplier portal using the credentials below.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:0 0 14px;">Your Login Credentials</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:38%;">Username</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${username}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Password</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${password}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Role</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:700;">${roleName}</td></tr>
          </table>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-bottom:24px;">
          <p style="color:#92400e;font-size:13px;margin:0;">⚠️ Please change your password after first login for security.</p>
        </div>

        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;border-top:1px solid #e5e7eb;padding-top:20px;">
          Grocery Store Management System • Automated email — do not reply.
        </p>
      </div>
    </div>`,
  })
}

const sendSupplierRejectionEmail = async ({ to, businessName, reason }) => {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Grocery Store Management" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Update on Your Supplier Application',
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
        <h1 style="color:#111827;font-size:22px;font-weight:700;">Application Status Update</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Dear <strong>${businessName}</strong>,<br/><br/>
          After careful review, we are unable to approve your supplier application at this time.
        </p>
        ${reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0;">
          <p style="color:#991b1b;font-size:14px;margin:0;"><strong>Reason: </strong>${reason}</p></div>` : ''}
        <p style="color:#6b7280;font-size:14px;">You may reapply after addressing the above concerns.</p>
      </div>
    </div>`,
  })
}

module.exports = { sendSupplierApprovalEmail, sendSupplierRejectionEmail }
