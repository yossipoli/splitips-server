import * as dotenv from "dotenv";
dotenv.config();

import { createConnection } from "mysql2";

export const con = createConnection({
    host: process.env.HOST,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
    dateStrings: true
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

export const register = (email, password) => {
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

// export const insertData = (values)=> {
//     con.query(`INSERT INTO jobs VALUES (?);`, [values])
// }
    
export const changeTookTip = (userId, newValue, name, date)=> {
    try{
        con.query(`UPDATE jobs SET took_tip = ? WHERE (user_id = ? and name = ? and date= ?);`,[newValue, userId, name, date])
        return true
    } catch {
        return false
    }
}

export const getData = (userId)=> {
    return new Promise((resolve, reject)=>{
        con.query(`SELECT * FROM jobs WHERE (user_id = ?);`, [userId] , (error, data)=>{
            if (error){
                console.log(`Failed to get data from DB: \n${error}`);
                reject(error)
            } else {
                resolve(data)
            }
        })
    })
}

export const getDays = (userId, startDate, endDate = startDate)=> {
    return new Promise((resolve, reject)=>{
        con.query(`call show_days(?, ?, ?);`, [userId, startDate, endDate] , (error, data)=>{
            if (error){
                console.log(`Failed to get date data from DB: \n${error}`);
                reject(error)
            } else {
                resolve(data[0] || null)
            }
        })
    })

}

export const getEmployeePaycheck = (userId, employeeName, startDate, endDate = startDate)=> {
    console.log(userId, employeeName, startDate, endDate);
    return new Promise((resolve, reject)=>{
            con.query(`call splitips.show_employee_in_period(?, ?, ?, ?);`, [userId, startDate, endDate, employeeName] , (error, data)=>{
            if (error){
                console.log(`Failed to get employee paycheck from DB: \n${error}`);
                reject(error)
            } else {
                resolve(data[0] || null)
            }
        })
    })
}


export const addJob = (values)=> {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO jobs VALUES (default, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values, (err) => {
            if (err) {
                reject("addJob DataRequest failed", err);
            } else {
                resolve(true);
            }
        });
    });
}

export const removeJob = (id) => {
    return new Promise((resolve, reject) => {
        con.query(`DELETE FROM jobs WHERE (id = ?);`, [id], (err) => {
            if (err) {
                reject("addJob DataRequest failed", err);
            } else {
                resolve(true);
            }
        });
    });
}