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
        if (user) res.send({res: "wrong"}) //This email is already in the system
        else {
            const respond = await Request.register(req.body.email, await hash(req.body.password))
            if (!respond) res.send({res: "fail"}) //failed to insert new data
            user = await Request.getUser("email", req.body.email)
            sendMail(user.email, "activate" , encrypt(user.id))
            res.cookie("user", encrypt(user.id), {maxAge: YEAR})
            next()
        }
    } catch {
        res.status(401).send({res: "fail"})
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
        if (!user) res.status(201).send({res: "wrong"}); //This email is not exist in the system
        else {
            if (! await compare(req.body.password, user.password)){
                res.status(201).send({res: "wrong"}); //Incorrect password
            }
            else {
                res.cookie("user", encrypt(user.id), {maxAge: YEAR})
                next();
            }
        }
    } catch {
        res.status(401).send({res: "fail"})
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
        if (!user) res.status(201).send({res: "wrong"}); //This email is not exist in the system
        else {
            sendMail( user.email, "reset-password" , encrypt(user.id) , true )
            next();
        }
    } catch{
        console.log({res: "fail"})
    }
}

export const changePassword = async (req, user)=> {
    const hashedPassword = await hash(req.body.password)
    Request.set("users", "id", `${user.id}` , "password", `${hashedPassword}`)
}

export const resetPassword = async (req, res, next)=> {
    console.log(req.params.id);
    const user = await Request.getUser("id", decrypt(req.params.id))
    if (!user) res.status(201).send({res: "wrong"}) //"User ID doesn't exist"
    else{
        changePassword(req, user)
        next()
    }
}


  //////////////////////////////////////////////////////////////////////
  ///////////////////////////// jobs funcs /////////////////////////////
  //////////////////////////////////////////////////////////////////////

  export const getPayDate = async (req, res, next) => {
    try {
        const data = await Request.getDays(decrypt(req.cookies.user), req.body.startDate, req.body.endDate)
        req.jobDays = data
        next()
    } catch {
        res.status(401).send("Did NOT get respond for date dates.")
    }
}

export const getPaycheck = async (req, res, next) => {
    try {
        const data = await Request.getEmployeePaycheck(decrypt(req.cookies.user), req.body.name, req.body.startDate, req.body.endDate)
        req.paycheck = data
        next()
    } catch {
        res.status(401).send("Did NOT get respond for paycheck.")
    }
}

export const addJob = async (req, res, next) => {
    try{
        if (!inputCheck(req.body)) res.send("Inputs not right")
        const {date, name, start, end, hours, minimum, salary, tip, expense, tookTip} = req.body
        const respond = await Request.addJob([decrypt(req.cookies.user), date, name, start, end, hours, minimum, salary, tip, expense, tookTip])
        if (!respond) res.send("Request failed to insert a new Job.")
        next()
    } catch {
        res.status(401).send("Failed to insert a new Job.")
    }
}

const inputCheck = (values) => {
    const {date, start, end, hours, minimum, salary, tip, expense, tookTip} = values

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

    if (typeof tookTip !== 'number'){
        console.log("tipTook isn't a boolean number (0/1)");
        return false
    }

    if (typeof hours !== 'number' || typeof minimum !== 'number' || typeof salary !== 'number' || typeof tip !== 'number' || typeof expense !== 'number'){
        console.log("wrong type");
        return false
    }

    const [year, month, day] = date.split("-")

    if (+month<1 || +month>10){
        console.log("wrong date input");
        return false
    }

    if (+day<1 || +day>31){
        console.log("wrong date input");
        return false
    }

    if (+year<2000 || +year>2200) {
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
