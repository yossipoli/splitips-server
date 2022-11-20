import * as dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session'

import * as MW from "./middleWares.js";

const PORT = process.env.SERVER_PORT;

const YEAR = 1000*60*60*24*365

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    name: "sessionCookie",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true, maxAge: YEAR}
  }))

// app.get('/users', MW.getAllUsers, (req, res)=> {
//     res.send(req.users)
// })

app.post('/user', MW.getUser, (req, res)=> {
    res.send(req.user)
})

app.post('/register', MW.register,  (req, res)=> {
    res.cookie("user", req.encryptUserId, {maxAge: YEAR})
    res.send('Register successful')
})

app.get('/activate/:id', MW.activation, (req,res)=> {
    res.send("Active!")
})

app.post('/login', MW.login , (req, res)=>{
    res.cookie("user", req.encryptUserId, {maxAge: YEAR})
    res.send(`${req.body.email} is login now!`)
})

app.get('/check-cookie', MW.checkCookie , (req, res)=>{
    res.send(true)
})

app.get("/logout", (req, res) => {
    res.clearCookie("sessionCookie");
    res.clearCookie("user");
    res.send(`logout has successful!`);
});

app.post('/forgot-password/', MW.forgotPassword, (req, res)=>{
    res.send("reset-password request sent to your mail")
})

//need to send link for the web page with new password input
app.post('/reset-password/:id', MW.resetPassword, (req, res)=>{
    res.send("You changed your old password for a new one")
})

app.listen(PORT, () => console.log(`Server is UP!🚀`));
