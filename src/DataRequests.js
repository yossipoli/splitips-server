import * as dotenv from'dotenv'
dotenv.config();

import { createConnection } from 'mysql2';

export const con = createConnection({
    host: process.env.HOST,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
});

con.connect((err) =>
    err ? console.log("Problem with DB:\n", err) : console.log("connected to DB")
);

export const getData = (table)=> {
    return new Promise((resolve, reject)=>{
        con.query(`SELECT * FROM ${table};` , (error, data)=>{
            if (error){
                reject(`Failed to get data from DB: \n${error}`)
            } else {
                resolve(data)
            }
        })
    })
}

export const getDataByParameter = (table, parameter, value)=> {
    return new Promise((resolve, reject)=>{
        con.query(`SELECT * FROM ${table} WHERE ${parameter}= ${value};`, (error, data)=>{
            if (error){
                reject(`Failed to get data from DB: \n${error}`)
            } else {
                resolve(data[0] || null)
            }
        })
    })
}

export const updateDataByParameter = (table, parameter, parameterValue, fieldToChange, newValue)=> {
    con.query(`UPDATE ${table} SET ${fieldToChange} = ? WHERE (${parameter} = ?);`,[newValue, parameterValue])
}

export const insertData = (table, values)=> {
    console.log("insert");
    con.query(`INSERT INTO ? VALUES (?);`, [table, values])
}