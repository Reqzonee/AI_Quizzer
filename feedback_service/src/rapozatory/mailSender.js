const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('SMTP configuration is missing in environment variables.');
        }

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587, // Default to 587 if MAIL_PORT is not set
            secure: process.env.MAIL_SECURE === 'true', // true for SSL, false for STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: `PlayPowerLab || AI - Quizzer <${process.env.EMAIL_USER}>`, // Use the email from environment variable
            to: email,
            subject: title,
            html: body,
        });

        console.log('Mail sent successfully:', info);
        return info;
    } catch (error) {
        console.error('Error sending mail:', error.message);
        throw error; // Rethrow error to handle it in the calling function
    }
};

module.exports = mailSender;
