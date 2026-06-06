const nodemailer = require('nodemailer')

let transporter

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

async function sendInviteEmail(to, workspaceName, inviteLink, inviterName) {
  if (!transporter) {
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `You're invited to join ${workspaceName} on Team Hub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Team Hub</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
            <h2>You're invited!</h2>
            <p>Hi there,</p>
            <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on Team Hub.</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #6366F1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
              Accept Invitation
            </a>
            <p style="color: #999; font-size: 12px;">This invitation expires in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Team Hub — Collaborative workspace for teams</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    // Email sending failed silently
  }
}

async function sendMentionEmail(to, mentionedByName, workspaceName, commentPreview, link) {
  if (!transporter) return

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `${mentionedByName} mentioned you in ${workspaceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Team Hub</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
            <h2>You were mentioned</h2>
            <p><strong>${mentionedByName}</strong> mentioned you in ${workspaceName}:</p>
            <blockquote style="border-left: 4px solid #6366F1; padding-left: 20px; margin: 20px 0; color: #666;">
              ${commentPreview}
            </blockquote>
            <a href="${link}" style="display: inline-block; background-color: #6366F1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
              View Comment
            </a>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Team Hub — Collaborative workspace for teams</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Error sending mention email:', error)
  }
}

module.exports = {
  sendInviteEmail,
  sendMentionEmail,
}
