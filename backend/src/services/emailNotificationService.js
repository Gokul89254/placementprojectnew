const nodemailer = require('nodemailer');

let transporter;
let configurationWarningShown = false;

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    if (!configurationWarningShown) {
      console.warn('Email notifications are disabled. Configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD to enable them.');
      configurationWarningShown = true;
    }
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text, event }) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return false;

  try {
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error(`Email notification failed for ${event} to ${to}:`, error.message);
    return false;
  }
}

async function sendApplicationSubmitted({ student_name, student_email, recruiter_email, job_title, company_name }) {
  const subject = `[Placemate] Application received: ${job_title}`;
  const studentEmail = sendEmail({
    to: student_email,
    subject,
    event: 'application submission',
    text: `Hello ${student_name},\n\nYour application for ${job_title} at ${company_name} has been received.\n\nYou will receive another email when your application status changes.\n\nPlacemate Placement Cell`
  });
  const recruiterEmail = sendEmail({
    to: recruiter_email,
    subject: `[Placemate] New application for ${job_title}`,
    event: 'new applicant',
    text: `Hello,\n\n${student_name} has applied for ${job_title} at ${company_name}.\n\nSign in to Placemate to review the application.\n\nPlacemate Placement Cell`
  });
  await Promise.all([studentEmail, recruiterEmail]);
}

async function sendJobPendingReview({ admin_emails, job_id, job_title, company_name, location, deadline }) {
  if (!admin_emails.length) {
    console.warn(`No admin accounts are available to review job ${job_id}.`);
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  await Promise.all(admin_emails.map(to => sendEmail({
    to,
    subject: '[Placemate] New job posting requires review',
    event: 'job pending review',
    text: `A recruiter submitted a new job posting for approval.\n\nJob: ${job_title}\nCompany: ${company_name}\nLocation: ${location}\nApplication deadline: ${deadline}\n\nReview and approve or reject this posting in the admin dashboard:\n${frontendUrl}/admin/jobs\n\nPlacemate Placement Cell`
  })));
}

async function sendCompanyPendingReview({ admin_emails, company_id, company_name, recruiter_name, recruiter_email, location }) {
  if (!admin_emails.length) {
    console.warn(`No admin accounts are available to review company ${company_id}.`);
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  await Promise.all(admin_emails.map(to => sendEmail({
    to,
    subject: '[Placemate] New company requires review',
    event: 'company pending review',
    text: `A recruiter submitted a new company profile for approval.\n\nCompany: ${company_name}\nRecruiter: ${recruiter_name} (${recruiter_email})\nLocation: ${location || 'Not specified'}\n\nReview and approve or reject this company in the admin dashboard:\n${frontendUrl}/admin/companies\n\nPlacemate Placement Cell`
  })));
}

async function sendApplicationStatus({ student_name, student_email, status, job_title, company_name }) {
  const statusMessages = {
    applied: 'Your application is being reviewed. We will email you when there is an update.',
    shortlisted: 'Congratulations! You have been shortlisted. The placement team will share interview details with you.',
    rejected: 'Thank you for your interest. You were not selected to proceed for this opportunity.',
    selected: 'Congratulations! You have been selected for this opportunity. The placement team will share any offer details with you.'
  };
  await sendEmail({
    to: student_email,
    subject: `[Placemate] Application update: ${job_title}`,
    event: `application status ${status}`,
    text: `Hello ${student_name},\n\nYour application for ${job_title} at ${company_name} has been updated to: ${status}.\n\n${statusMessages[status] || ''}\n\nPlacemate Placement Cell`
  });
}

async function sendInterviewNotification({ student_name, student_email, round_name, scheduled_at, mode, location, meeting_link, notes, job_title, company_name }, action) {
  const messages = {
    scheduled: 'An interview has been scheduled for your application.',
    updated: 'Your interview schedule has been updated.',
    cancelled: 'Your interview has been cancelled.',
    completed: 'Your interview has been marked as completed.'
  };
  const details = action === 'cancelled'
    ? ''
    : `\nRound: ${round_name}\nDate and time: ${scheduled_at}\nMode: ${mode === 'online' ? 'Online' : 'In person'}${location ? `\nLocation: ${location}` : ''}${meeting_link ? `\nMeeting link: ${meeting_link}` : ''}${notes ? `\nNotes: ${notes}` : ''}`;

  await sendEmail({
    to: student_email,
    subject: `[Placemate] Interview ${action}: ${job_title}`,
    event: `interview ${action}`,
    text: `Hello ${student_name},\n\n${messages[action]} This is for your ${job_title} application at ${company_name}.${details}\n\nPlacemate Placement Cell`
  });
}

async function sendPlacementResult({ student_name, student_email, result_status, package_amount, offer_date, notes, job_title, company_name }) {
  const resultMessages = {
    offered: 'You have received an offer.',
    accepted: 'Your placement offer has been recorded as accepted. Congratulations!',
    declined: 'Your placement offer has been recorded as declined.'
  };
  const details = [
    package_amount !== null && package_amount !== undefined ? `Package: ${package_amount}` : null,
    offer_date ? `Offer date: ${offer_date}` : null,
    notes ? `Notes: ${notes}` : null
  ].filter(Boolean);

  await sendEmail({
    to: student_email,
    subject: `[Placemate] Placement update: ${job_title}`,
    event: `placement result ${result_status}`,
    text: `Hello ${student_name},\n\n${resultMessages[result_status]} This is for ${job_title} at ${company_name}.\n\n${details.join('\n')}\n\nPlacemate Placement Cell`
  });
}

module.exports = {
  sendJobPendingReview,
  sendCompanyPendingReview,
  sendApplicationSubmitted,
  sendApplicationStatus,
  sendInterviewNotification,
  sendPlacementResult
};
