const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address (e.g., 'example@gmail.com')
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
});

// Function to send an email with the verification code
exports.sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: to, // Receiver's email address
            subject: subject, // Subject line
            text: text, // Plain text body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Email sending failed');
    }
};
