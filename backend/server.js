import app from "./src/app.js";
import { connection } from "./src/db/db.js";

app.listen(1111,()=>{
    console.log("We are live on http://localhost:1111")
    connection()
})