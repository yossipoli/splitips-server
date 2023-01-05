import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2";

export const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
    dateStrings: true
});

// con.connect((err) =>
//     err
//         ? console.log("Problem with DB:\n", err)
//         : console.log("connected to DB")
// );

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
        pool.query(`SELECT * FROM users where (${where} = ?);`, [value], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data[0] || null);
            }
        });
    });
};

export const register = (email, password) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO users VALUES (default, ?, ?, 0)`, [email, password], (err) => {
            if (err) {
                console.log("Failed to insert a new user", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
};

export const set = (table, parameter, parameterValue, fieldToChange, newValue)=> {
    pool.query(`UPDATE ${table} SET ${fieldToChange} = ? WHERE (${parameter} = ?);`,[newValue, parameterValue])
}

//jobs:

// export const insertData = (values)=> {
//     pool.query(`INSERT INTO jobs VALUES (?);`, [values])
// }
    
export const changeTookTip = (userId, newValue, name, date)=> {
    try{
        pool.query(`UPDATE jobs SET took_tip = ? WHERE (user_id = ? and name = ? and date= ?);`,[newValue, userId, name, date])
        return true
    } catch {
        return false
    }
}

export const getData = (userId)=> {
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT * FROM jobs WHERE (user_id = ?);`, [userId] , (error, data)=>{
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
        pool.query(`call show_days(?, ?, ?);`, [userId, startDate, endDate] , (error, data)=>{
            if (error){
                console.log(`Failed to get date data from DB: \n${error}`);
                reject(error)
            } else {
                resolve(data[0] || null)
            }
        })
    })
}

export const getSalaryOf = (userId, date)=> {
    return new Promise((resolve, reject)=>{
        pool.query(`call get_day_salary_data(?, ?);`, [userId, date] , (error, data)=>{
            if (error){
                console.log(`Failed to get date data from DB at get salary date: \n${error}`);
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
            pool.query(`call splitips.show_employee_in_period(?, ?, ?, ?);`, [userId, startDate, endDate, employeeName] , (error, data)=>{
            if (error){
                console.log(`Failed to get employee paycheck from DB: \n${error}`);
                reject(error)
            } else {
                resolve(data[0] || null)
            }
        })
    })
}


export const saveDateSalary = (values)=> {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO salaries VALUES (default, ?, ?, ?, ?, ?, ?);`, values, (err) => {
            if (err) {
                console.log("salary DataRequest failed", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

export const removeSalaryOn = (userId, date) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM salaries WHERE (user_id = ? AND date = ?);`, [userId, date], (err) => {
            if (err) {
                console.log("Remove a job from DataRequest is failed", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

export const addJob = (values)=> {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO jobs VALUES (default, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values, (err) => {
            if (err) {
                console.log("addJob DataRequest failed", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

export const removeJob = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM jobs WHERE (id = ?);`, [id], (err) => {
            if (err) {
                console.log("Remove a job from DataRequest is failed", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

export const removeDate = (userId, date) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM jobs WHERE (user_id = ? and date =?);`, [userId, date], (err) => {
            if (err) {
                console.log("Remove a date failed in DataRequest", err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}