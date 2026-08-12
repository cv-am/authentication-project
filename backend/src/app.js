import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import route from "./module/route.js";
import { globalLimiter } from "./middleware/rate-limit.middleware.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
  origin: true,
  credentials: true 
}));

app.use(express.json())
app.use(cookieParser())



app.use(globalLimiter)
app.use("/api",route)

app.use(express.static(path.join(__dirname, "../../public")))

export default app