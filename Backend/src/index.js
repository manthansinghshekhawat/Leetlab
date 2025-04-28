import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello guys welcome to LEETLAB");
});

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/problems',problemRoutes)
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT} `);
});
