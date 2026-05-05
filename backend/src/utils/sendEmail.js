const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use user's real credentials if available, otherwise fallback to Ethereal
  let transporter;
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail', // e.g. 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Ethereal fake SMTP configuration for testing
    console.log('No EMAIL_USER or EMAIL_PASS found in .env, using Ethereal Test Account...');
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Team Task Manager'} <${process.env.FROM_EMAIL || 'noreply@teamtask.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  if (!process.env.EMAIL_USER) {
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
