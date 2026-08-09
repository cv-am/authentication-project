import mysql2 from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

export const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port:3306,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
})

export const connection = async() => {
    try {
        await pool.getConnection()
        console.log("Connected to Database successfully")
    } catch (error) {
        console.log("Database connection failed:",error)
    }
}

