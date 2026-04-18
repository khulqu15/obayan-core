import nodemailer from "nodemailer";
import { secret } from "encore.dev/config";

const smtpHost = secret("SmtpHost");
const smtpPort = secret("SmtpPort");
const smtpUser = secret("SmtpUser");
const smtpPass = secret("SmtpPass");
const smtpFrom = secret("SmtpFrom");

export const mailer = nodemailer.createTransport({
    host: smtpHost(),
    port: Number(smtpPort()),
    secure: Number(smtpPort()) === 465,
    auth: {
        user: smtpUser(),
        pass: smtpPass(),
    },
});

export async function sendMail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) {
    await mailer.sendMail({
        from: smtpFrom(),
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
    });
}