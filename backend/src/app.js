import express from "express";
import authRouter from "./module/auth/route.js";
import errorHandler from "./middleware/error.middleware.js";


const app = express()


app.use(express.json())

app.use("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy"
  })
})

app.use("/api/v1/auth", authRouter)

//Error handling middleware must come after routes
app.use(errorHandler)

export default app