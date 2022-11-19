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

export const getUsers = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users`, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users where email = ?`, [email], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data[0] || null);
                }
            }
        );
    });
};

export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users where id = ?`, [id], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data[0] || null);
            }
        });
    });
};

export const signUp = (email, password) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO users VALUES(default, ?, ?)`, [email, password], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

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

// export const getUserId = (email) => {
//     return new Promise((resolve, reject)=> {
//         con.query(`SELECT * FROM users WHERE email = ?`, [email], (error, userId)=> {
//             if (error) {
//                 console.log(`Can NOT search user ID by email \n ${error}`)
//                 reject(-1)
//             } else {
//                 resolve(userId)
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

// export const updateDataByParameter = (table, parameter, parameterValue, fieldToChange, newValue)=> {
//     con.query(`UPDATE ${table} SET ${fieldToChange} = ? WHERE (${parameter} = ?);`,[newValue, parameterValue])
// }

// export const insertData = (table, values)=> {
//     console.log("insert");
//     con.query(`INSERT INTO ? VALUES (?);`, [table, values])
// }
