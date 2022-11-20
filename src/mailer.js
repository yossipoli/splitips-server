import * as dotenv from "dotenv";
dotenv.config();

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
        
    let details = (sendTo, link, userId)=> ({
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
                Click <a href="http://localhost:${process.env.SERVER_PORT}/${link}/${userId}">here</a> for activate your account.
            </div>
        </body>
        </html>`,
    });
    
    export const sendMail =  (sendTo, link, userId) => {
    
    transform.sendMail(details(sendTo, link, userId), (err) => {
        if (err) {
            console.log("Failed to send mail: ", err);
        }
        else {
            console.log("email has sent!");
        }
    });

}
        
        