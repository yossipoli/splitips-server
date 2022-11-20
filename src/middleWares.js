import * as dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import * as Request from './DataRequests.js';
import { encrypt, decrypt , hash , compare } from './crypt.js';

import nodemailer from 'nodemailer'

const transform = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// export const getAllUsers = async (req, res, next) => {
//     try {
//         const users = await Request.getUsers()
//         req.users = users
//         next()
//     } catch {
//         res.status(401).send("Failed to get all users.")
//     }
// }

export const getUser = async (req, res, next) => {
    try {
        let user = null
        if (req.body.id){
            user = await Request.getUser("id", req.body.id)
        } else if (req.body.email) {
            user = await Request.getUser("email", req.body.email)
        }
        req.user = user
        next()
    } catch {
        res.status(401).send("Failed to get user.")
    }
}

export const register = async (req, res, next) => {
    try {
        const user = await Request.getUser("email", req.body.email)
        if (user) res.send("This Email already assign")
        else {
            await Request.signUp(req.body.email, await hash(req.body.password))
            req.session.cookie
            next()
        }
    } catch {
        res.status(401).send("Failed to register.")
    }
}

export const login = async (req, res, next) => {
    try {
        const user = await Request.getUser("email", req.body.email);
        if (!user) res.status(201).send("email or password is incorrect");
        else {
            if (! await compare(req.body.password, user.password)){
                res.status(201).send("email or password is incorrect");
            }
            else {
                req.session.cookie
                req.encryptUserId = encrypt(user.id)
                next();
            }
        }
    } catch {
        res.status(401).send("Failed to login.")
    }
}

export const checkCookie = async (req, res, next)=> {
    try {
        if (req.cookies.sessionCookie){
            next()
        } else if(req.cookies.user){
            const user = await Request.getUser("id", decrypt(req.cookies.user))
            if (!user) res.send(false);
            else {
                req.session.user = {id: encrypt(user.id)}
                next()
            }
        } else res.send(false)
    } catch {
        console.log("Filed to check for cookies")
    }
}

export const forgotPassword = async (req, res, next) => {
    try{
        const user = await Request.getUser("email", req.body.email);
        if (!user) res.status(201).send("This email is not exist in the system");
        else {
            // const transform = nodemailer.createTransport(emailConfig)

            let details = {
                from: "yossipoli@gmail.com",
                to: `${req.body.email}`,
                subject: "Reset password request?!",
                text: `Click at the link for create a new password-> http://localhost:${3100}/reset-password/${req.encryptUserId}/${req.token}`,
                html: /*html*/`
                <html>
                <head></head>
                <body>
                    Click <a href="http://localhost:${3100}/reset-password/${encrypt(user.id)}">here</a> for create a new password
                </body>
                </html>
                `
            }
            
            transform.sendMail(details, (err)=>{
                if(err) console.log("Failed to send mail: ", err)
                else{
                    console.log("email has sent!")
                }
            })
            next();
        }
    } catch{
        console.log("Failed to get user")
    }
}

export const changePassword = async (req, user)=> {
    const hashedPassword = await hash(req.body.password)
    set("users", "id", `${user.id}` , "password", `${hashedPassword}`)
}

export const resetPassword = async (req, res, next)=> {
    const user = await Request.getUser("id", decrypt(req.params.id))
    if (!user) res.status(201).send("User ID doesn't exist")
    else{
        changePassword(req, user)
        next()
    }
}
