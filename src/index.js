import * as dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { register , checkCookie, login ,forgotPassword , resetPassword, changePassword, getUsers } from "./middleWares.js";

const PORT = process.env.SERVER_PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/register', register, (req, res)=>{
    res.send("Registered")
})

app.get('/users', getUsers, (req, res)=> {
    res.send("YAY!")
})

// app.post('/register', register, (req, res)=>{
//     res.send("Registered")
// })

// app.post('/login', login , (req, res)=>{
//     res.cookie("user", req.encryptUserId, {maxAge: 1000*60*60*24*365}) //one year expire
//     res.send(`${req.body.email} is login now!`)
// })

// app.post('/forgot-password/', forgotPassword, (req, res)=>{
//     res.send("reset-password request sent to your mail")
// })

// app.post('/reset-password/:id', resetPassword, (req, res)=>{
//     res.send("You changed your old password for a new one")
// })

// app.get('/orders', checkCookie , (req, res)=>{
//     res.send("You can see the orders")
// })

// app.get("/logout", checkCookie, (req, res) => {
//     res.clearCookie("connect.sid");
//     res.clearCookie("user");
//     res.send(`logout has successful!`);
// });

app.get("/", (req, res)=> {
    res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server is UP!🚀`));
