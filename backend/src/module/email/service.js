import nodemailer from "nodemailer"
import { config } from "../../config/env.js"  

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
    }
})

export const sendEmail = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html
    })
}

export const verifyEmailConnection = async () => {
    await transporter.verify();
    console.log("SMTP connection successful");
}