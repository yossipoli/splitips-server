import * as dotenv from 'dotenv'
dotenv.config();

import * as Request from './DataRequests.js';
import { encrypt, decrypt , hash , compare } from './crypt.js';
import { sendMail } from './mailer.js';

const YEAR = 1000*60*60*24*365

  //////////////////////////////////////////////////////////////////////
  ///////////////////////////// user funcs /////////////////////////////
  //////////////////////////////////////////////////////////////////////


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
        let user = await Request.getUser("email", req.body.email)
        if (user) res.send({sign: "warning", msg: "כתובת אימייל זו כבר רשומה במערכת"})
        else {
            const respond = await Request.register(req.body.email, await hash(req.body.password))
            if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"})
            user = await Request.getUser("email", req.body.email)
            sendMail(user.email, "activate" , encrypt(user.id))
            res.cookie("user", encrypt(user.id), {maxAge: YEAR})
            next()
        }
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"})
    }
}

export const activation = async (req, res, next) => {
    const user = await Request.getUser("id", decrypt(req.params.id))
    if (!user) res.status(201).send("User ID doesn't exist")
    else{
        Request.set("users", "id", `${user.id}` , "activate", 1)
        next()
    }
}

export const login = async (req, res, next) => {
    try {
        const user = await Request.getUser("email", req.body.email);
        if (!user) res.status(201).send({sign: "warning", msg: "אימייל או סיסמה לא נכונים"});
        else {
            if (! await compare(req.body.password, user.password)){
                res.status(201).send({sign: "warning", msg: "אימייל או סיסמה לא נכונים"});
            }
            else {
                if (+user.activate !== 1) res.send({sign: "info", msg: "יש לאשר חשבון באמצעות הקישור הנשלח למיייל"})
                else{
                    res.cookie("user", encrypt(user.id), {maxAge: YEAR})
                    next();
                }
            }
        }
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"})
    }
}

export const checkCookie = async (req, res, next)=> {
    try {
        if(req.cookies.user){
            const user = await Request.getUser("id", decrypt(req.cookies.user))
            if (+user.activate !== 1) res.send({res: false});
            else {
                req.session.user = {id: encrypt(user.id)}
                next()
            }
        } else res.send({res: false})
    } catch {
        console.log("Filed to check for cookies")
        res.send({res: false})
    }
}

export const forgotPassword = async (req, res, next) => {
    try{
        const user = await Request.getUser("email", req.body.email);
        if (!user) res.status(201).send({sign: "warning", msg: "משתמש לא מוכר"});
        else {
            sendMail( user.email, "reset-password" , encrypt(user.id) , true )
            next();
        }
    } catch{
        console.log({sign: "error", msg: "אירעה שגיאה"})
    }
}

export const changePassword = async (req, user)=> {
    const hashedPassword = await hash(req.body.password)
    Request.set("users", "id", `${user.id}` , "password", `${hashedPassword}`)
}

export const resetPassword = async (req, res, next)=> {
    try{
        const user = await Request.getUser("id", decrypt(req.params.id))
        if (!user) res.status(201).send({sign: "error", msg: "אירעה שגיאה"})
        else{
            changePassword(req, user)
            res.cookie("user", encrypt(user.id), {maxAge: YEAR})
            next()
        }
    } catch {
        res.status(201).send({sign: "error", msg: "אירעה שגיאה"})
    }
}


  //////////////////////////////////////////////////////////////////////
  ///////////////////////////// jobs funcs /////////////////////////////
  //////////////////////////////////////////////////////////////////////

  export const getPayDate = async (req, res, next) => {
    try {
        const data = await Request.getDays(decrypt(req.cookies.user), req.body.first, req.body.last)
        req.jobDays = data
        next()
    } catch {
        res.status(401).send(null) //Did NOT get respond for date dates.
    }
}

export const getSalaryOf = async (req, res, next) => {
    try {
        const data = await Request.getSalaryOf(decrypt(req.cookies.user), req.body.date)
        req.salaries = data
        next()
    } catch {
        res.status(401).send(null) //Did NOT get respond for date dates.
    }
}

export const changeTookTip = async (req, res, next) => {
    try{
        Request.changeTookTip(decrypt(req.cookies.user), req.body.tookTip, req.body.name , req.body.date)? next() : res.send(false)
    }
    catch{
        res.status(401).send(false)
    }
}

export const getPaycheck = async (req, res, next) => {
    try {
        const data = await Request.getEmployeePaycheck(decrypt(req.cookies.user), req.body.name, req.body.startDate, req.body.endDate)
        req.paycheck = data
        next()
    } catch {
        res.status(401).send(null) //Did NOT get respond for paycheck.
    }
}

export const removeDate = async (req, res, next) => {
    try{
        const respond = await Request.removeDate(decrypt(req.cookies.user), req.body.date)
        if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"}) //Request failed to remove date
        next()
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"}) //Failed to remove date
    }
}

export const removeSalary = async (req, res, next) => {
    try{
        const respond = await Request.removeSalaryOn(decrypt(req.cookies.user), req.body.date)
        if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"}) //Request failed to remove date
        next()
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"}) //Failed to remove date
    }
}

export const addJobDay = async (req, res, next) => {
    try{
        for (const job of req.body.employees){
            if (!inputCheck(job)) res.send({sign: "warning", msg:"נתונים אינם תקינים"}) //Inputs not right
            const {date, name, start, end, hours, minimum, perHour, salary, tip, expense, tookTip} = job
            const respond = await Request.addJob([decrypt(req.cookies.user), date, name, start, end, hours, minimum, perHour, salary, tip, expense, tookTip])
            if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"}) //Request failed to insert a new Job
        }
        next()
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"}) //Failed to insert a new Job
    }
}

export const saveSalaryOfDate = async (req, res, next) => {
    try{
        const {date, minimum, percent, cash, credit} = req.body.salaries
        const respond = await Request.saveDateSalary([decrypt(req.cookies.user), date, +minimum, +percent, +cash, +credit])
        if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"}) //Request failed to insert a new salary
        next()
    } catch {
        res.status(401).send({sign: "error", msg: "אירעה שגיאה"}) //Failed to insert a new salary
    }
}

// export const addJob = async (req, res, next) => {
//     try{
//         if (!inputCheck(req.body)) res.send({sign: "warning", msg:"נתונים אינם תקינים"}) //Inputs not right
//         const {date, name, start, end, hours, minimum, salary, tip, expense, tookTip} = req.body
//         const respond = await Request.addJob([decrypt(req.cookies.user), date, name, start, end, hours, minimum, salary, tip, expense, tookTip])
//         if (!respond) res.send({sign: "error", msg: "אירעה שגיאה"}) //Request failed to insert a new Job
//         next()
//     } catch {
//         res.status(401).send({sign: "error", msg: "אירעה שגיאה"}) //Failed to insert a new Job
//     }
// }


const inputCheck = (values) => {
    const {date, start, end, hours, minimum, perHour, salary, tip, expense, tookTip} = values
    // date = date.split('/').reverse().join('-')

    const dateRegex = /\d{4}-\d{2}-\d{2}/

    const timeRegex = /\d{2}:\d{2}/

    if (!date.match(dateRegex)) {
        console.log("wrong date pattern");
        return false
    }

    if (!start.match(timeRegex) || !end.match(timeRegex)) {
        console.log("wrong time pattern");
        return false
    }

    if ( tookTip !== 0 && tookTip !== 1){
        console.log("tipTook isn't a boolean number (0/1)");
        return false
    }

    if (typeof hours !== 'number' || typeof minimum !== 'number' || typeof salary !== 'number' || typeof tip !== 'number' || typeof expense !== 'number' || typeof perHour !== 'number'){
        console.log("wrong type");
        return false
    }

    const [year, month, day] = date.split("-")

    if (+month<1 || +month>12){
        console.log("wrong date input");
        return false
    }

    if (+day<1 || +day>31){
        console.log("wrong date input");
        return false
    }

    if (+year<2000 || +year>2100) {
        console.log("wrong date input");
        return false
    }

    const [startHours, startMinutes] = start
    const [endHours, endMinutes] = end

    if (+startHours < 0 || +startHours > 23 || +startMinutes < 0 || +startMinutes > 59  || +endHours  < 0 || +endHours > 23 || +endMinutes  < 0 || +endMinutes > 59){
        console.log("wrong start and end input");
        return false
    }

    return true
}