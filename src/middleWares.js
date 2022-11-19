import * as dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { getData, getDataByParameter, insertData, updateDataByParameter } from './DataRequests.js';
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

export const getUsers = async (req, res, next) => {
    try{

        const users = await getData("users")
        console.log(users);
        next()
    } catch {
        console.log("Failed to get users")
    }
}

export const register = async (req, res, next ) => {
    try{
        const user = await getDataByParameter("users", "email", `${req.body.email}`);
        if (user) res.status(201).send("This email already registered");
        else {
            const hashedPassword = await hash(req.body.password);
            insertData("users",`default, "${req.body.email}", "${hashedPassword}"`);
            next();
        }
    } catch{
        console.log("Failed to get user")
    }
}

export const forgotPassword = async (req, res, next) => {
    try{
        const user = await getDataByParameter("users", "email", `${req.body.email}`);
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
    updateDataByParameter("users", "id", `${user.id}` , "password", `${hashedPassword}`)
}

export const resetPassword = async (req, res, next)=> {
    const user = await getDataByParameter("users", "id", `${decrypt(req.params.id)}`)
    if (!user) res.status(201).send("User ID doesn't exist")
    else{
        changePassword(req, user)
        next()
    }
}

export const login = async (req, res, next) => {
    const user = await getDataByParameter("users", "email", `${req.body.email}`);
    if (!user) res.status(201).send("email or password is incorrect");
    else {
        if (! await compare(req.body.password, user.password)){
            res.status(201).send("email or password is incorrect");
        }
        else {
            req.session.user = {
                id: user.id,
                email: user.email
            }
            req.encryptUserId = encrypt(user.id)
            next();
        }
    }
}

export const checkCookie = async (req, res, next)=> {
    if (req.session.user){
        next()
    } else if(req.cookies.user){
        const user = await getDataByParameter("users" , "id" , `${decrypt(req.cookies.user)}`)
        if (!user) res.status(201).send("This page allowed only for login users");
        else next()
    } else res.status(401).send("Only login users can do that!")
}


