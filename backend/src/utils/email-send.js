import { transporter } from "../config/mail-config.js";
import dotenv from "dotenv";
dotenv.config();

async function sendMail({ email = [], subject = "", htmlTemplate = "" }) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email.join(", "),
        subject,
        html: htmlTemplate,
    });

    return info;
}


export default sendMail;