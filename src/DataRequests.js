import * as dotenv from "dotenv";
dotenv.config();

import { createConnection } from "mysql2";

export const con = createConnection({
    host: process.env.HOST,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
});

con.connect((err) =>
    err
        ? console.log("Problem with DB:\n", err)
        : console.log("connected to DB")
);

//users:

// export const getUsers = () => {
//     return new Promise((resolve, reject) => {
//         con.query(`SELECT * FROM users`, (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(data);
//             }
//         });
//     });
// };

export const getUser = (where, value) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users where (${where} = ?);`, [value], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data[0]);
            }
        });
    });
};

export const signUp = (email, password) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO users VALUES (default, ?, ?, 0)`, [email, password], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

export const set = (table, parameter, parameterValue, fieldToChange, newValue)=> {
    con.query(`UPDATE ${table} SET ${fieldToChange} = ? WHERE (${parameter} = ?);`,[newValue, parameterValue])
}

//jobs:

// export const getData = (table)=> {
//     return new Promise((resolve, reject)=>{
//         con.query(`SELECT * FROM ${table};` , (error, data)=>{
//             if (error){
//                 console.log(`Failed to get data from DB: \n${error}`);
//                 reject(null)
//             } else {
//                 resolve(data)
//             }
//         })
//     })
// }

// export const getDataByParameter = (table, parameter, value)=> {
//     return new Promise((resolve, reject)=>{
//         con.query(`SELECT * FROM ${table} WHERE ${parameter}= ${value};`, (error, data)=>{
//             if (error){
//                 console.log(`Failed to get data from DB: \n${error}`);
//                 reject(null)
//             } else {
//                 console.log("YES");
//                 resolve(data[0] || null)
//             }
//         })
//     })
// }

// export const insertData = (table, values)=> {
//     con.query(`INSERT INTO ? VALUES (?);`, [table, values])
// }
