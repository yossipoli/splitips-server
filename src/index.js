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

const PORT = process.env.PORT;

const YEAR = 1000*60*60*24*365

const app = express();

const corsOptions = {
    credentials: true,
	origin: ['http://localhost:3000', 'http://splitips.netlify.app', 'http://tipsplit.click', 'https://www.tipsplit.click'],
	optionsSuccessStatus: 200
};

// app.use(cors());
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
    res.send({sign: "success", msg: "נרשמת למערכת בהצלחה, יש לאשר חשבון באמצעות קישור הנשלח לכתובת המייל שלך"})
})

app.get('/activate/:id', MW.activation, (req,res)=> {
    res.send(/*html*/`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Tip$plit</title>
        </head>
        <body>
            <header>
                <img src="/logo" alt="Tip Split" />
            </header>
            <h3>הפעלת החשבון בוצעה בהצלחה</h3>
            <h3>
                <a href="http://splitips.netlify.app/">לחץ כאן למעבר לאתר</a>
            </h3>
        </body>
        </html>
    `)
})

app.post('/login', MW.login , (req, res)=>{
    res.send({sign: "success", msg: "התחברת למערכת בהצלחה"})
})

app.get('/check-cookie', MW.checkCookie , (req, res)=>{
    res.send({res: true})
})

app.get("/logout", (req, res) => {
    res.clearCookie("sessionCookie");
    res.clearCookie("user");
    res.send();
});

app.post('/forgot-password/', MW.forgotPassword, (req, res)=>{
    res.send({sign: "info", msg: "נשלחה לכותבת המייל שלך בקשה לאיפוס סיסמה"})
})

app.post('/reset-password/:id', MW.resetPassword, (req, res)=>{
    res.send({sign: "success", msg: "הסיסמה שלך שונתה בהצלחה"})
})


//////////////////////////////////////////////////////////////////////
///////////////////////////// jobs routs /////////////////////////////
//////////////////////////////////////////////////////////////////////

app.post('/days', MW.getPayDate, (req, res)=> {
    res.send(req.jobDays)
})

app.post('/salary-date', MW.getSalaryOf, (req, res)=> {
    res.send(req.salaries)
})

app.post('/save-salary', MW.saveSalaryOfDate, (req, res)=> {
    res.send({sign: "info", msg: "המידע נשמר"})
})

app.post('/change-took-tip', MW.changeTookTip, (req, res)=> {
    res.send(true)
})

app.post('/paycheck', MW.getPaycheck, (req, res)=> {
    res.send(req.paycheck)
})

app.post('/add', MW.addJobDay, (req, res)=> {
    res.send({sign: "info", msg: "המידע נשמר"})
})

app.post('/remove', MW.removeDate, (req, res)=> {
    res.send({sign: "info", msg: "המידע עבור יום עבודה זה הוסר"})
})

app.post('/remove-salary', MW.removeSalary, (req, res)=> {
    res.send({sign: "info", msg: "המידע עבור יום עבודה זה הוסר"})
})

//////////////////////////////////////////////////////////////////////
/////////////////////////////// others ///////////////////////////////
//////////////////////////////////////////////////////////////////////

app.get('/logo', (req, res) => {
    readFile(__dirname +'/imgs/logoTitle.png', { 'content-type': 'image/png' } , (e, img) => {
        if (e) {
            res.send('TipSplit');
        } else {
            res.send(img);
        }
    })
});

app.get("/", (req, res) => {
    res.send("WELCOME to Tip$pliT!");
});

app.listen(PORT, () => console.log(`Server is UP!🚀`));
