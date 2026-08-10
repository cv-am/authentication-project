import { pool } from "../db/db.js";

const insertQuery = "insert into user_data (name,username,email,password) values (?,?,?,?)"
const updateQuery = "update user_data set name=?,username=?,email=? where id=?"
const updatePasswordQuery = "update user_data set password=? where id=?"
const selectQuery = "select * from user_data where username = ?"
const deleteQuery = "delete from user_data where id = ?"
const selectAll = "select * from user_data"

export const registerUser = async (userData) => {
    try {
        const [result] = await pool.query(insertQuery,userData)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getUser = async (username) => {
    try {
        const [result] = await pool.query(selectQuery,username)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const profileUser = async (id) => {
    try {
        const [result] = await pool.query("select name,username,email from user_data where id = ?",id)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const updateUser = async (updateData) => {
    try {
        const [result] = await pool.query(updateQuery,updateData)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const updatePassword = async (newPassword) => {
    try {
        const [result] = await pool.query(updatePasswordQuery,newPassword)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const deleteUser = async (id) => {
    try {
        const [result] = await pool.query(deleteQuery,id)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getAll = async () => {
    try {
        const [result] = await pool.query(selectAll)
        return result
    } catch (error) {
        console.log(error)
    }
}