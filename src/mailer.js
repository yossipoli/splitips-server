import * as dotenv from "dotenv";
dotenv.config();

const X = 0
const SERVER = ['server2.tipsplit.click', 'localhost:4100'] //[0]: public, [1]:local
const CLIENT = ['splitips.netlify.app', 'localhost:3000'] //[0]: public, [1]:local
const HOST = [SERVER[X], CLIENT[X]]

import { createTransport } from "nodemailer";

    const transform = createTransport({
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        
    let details = (sendTo, link, userId, forgot)=> ({
        from: process.env.EMAIL_USER,
        to: [sendTo],
        subject: "Welcome to Tip$pliT",
        text: `email from Tip$pliT`,
        html: /*html*/
        `<html>
        <head>
        </head>
        <body>
            <div className="logo">
                <h1>
                    Tip$pliT
                </h1>
            </div>
            <div>
            Welcome to Tip$pliT, <br>
            The easy way for manage the waiters salary and tips.
            </div>
            <div>
                Click <a href="https://${forgot ? HOST[1] : HOST[0]}/${link}/${userId}">here</a> for activate your account.
            </div>
        </body>
        </html>`,
    });
    
export const sendMail =  (sendTo, link, userId, forgot=false) => {
    transform.sendMail(details(sendTo, link, userId, forgot), (err) => {
        if (err) {
            console.log("Failed to send mail: ", err);
        }
        else {
            console.log("Email has sent successfully!");
        }
    });
}
        
        