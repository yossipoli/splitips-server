import * as dotenv from'dotenv'
dotenv.config();

import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';

const crypter = new Cryptr(process.env.CRYPTR_SECRET)
const saltRounds = +process.env.SALT_ROUNDS

export const encrypt = (from)=> {
    return crypter.encrypt(from)
}

export const decrypt = (from)=> {
    return crypter.decrypt(from)
}

export const hash = (from)=> {
    return new Promise((resolve, reject)=>{
        bcrypt.hash(from, saltRounds, (error, hashed)=>{
            if (error){
                console.log("Hash failed: ", error)
                reject(error)
            } else {
                resolve(hashed)
            }
        })
    })
}

export const compare = (passwordBeforeHash, hashedPasswordInDB)=> {
    return new Promise((resolve, reject)=>{
        bcrypt.compare(passwordBeforeHash, hashedPasswordInDB, (error, result)=>{
            if (error){
                console.log("Compare Error: ", error)
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

    
