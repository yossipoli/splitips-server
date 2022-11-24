import * as dotenv from 'dotenv'
dotenv.config();

import path from 'path';
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session'
import * as MW from "./middleWares.js";
import { readFile } from 'fs';

const __dirname = path.resolve();

const PORT = process.env.SERVER_PORT;

const YEAR = 1000*60*60*24*365

const app = express();

const corsOptions = {
    credentials: true,
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    name: "sessionCookie",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { /*secure: true,*/ maxAge: YEAR}
  }))

  //////////////////////////////////////////////////////////////////////
  ///////////////////////////// user routs /////////////////////////////
  //////////////////////////////////////////////////////////////////////
  
  // app.get('/users', MW.getAllUsers, (req, res)=> {
  //     res.send(req.users)
  // })

app.post('/user', MW.getUser, (req, res)=> {
    res.send(req.user)
})

app.post('/register', MW.register,  (req, res)=> {
    res.send({res: "success"})
})

app.get('/activate/:id', MW.activation, (req,res)=> {
    res.send("Activated!")
})

app.post('/login', MW.login , (req, res)=>{
    res.send({res: "success"})
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
    res.send({res: "success"})
})

app.post('/reset-password/:id', MW.resetPassword, (req, res)=>{
    res.send({res: "success"})
})


//////////////////////////////////////////////////////////////////////
///////////////////////////// jobs routs /////////////////////////////
//////////////////////////////////////////////////////////////////////

app.post('/days', MW.getPayDate, (req, res)=> {
    res.send(req.jobDays)
})

app.post('/paycheck', MW.getPaycheck, (req, res)=> {
    res.send(req.paycheck)
})

app.post('/add', MW.addJob, (req, res)=> {
    res.send("Job is added")
})

//////////////////////////////////////////////////////////////////////
/////////////////////////////// others ///////////////////////////////
//////////////////////////////////////////////////////////////////////

app.get('./logoTitle.png', (req, res) => {
    readFile(__dirname +'/imgs/logoTitle.png', { 'content-type': 'image/png' } , (e, img) => {
        if (e) {
            res.send('TipSplit');
        } else {
            res.send(img);
        }
    })
});

app.listen(PORT, () => console.log(`Server is UP!🚀`));
