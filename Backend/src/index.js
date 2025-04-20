import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello guys welcome to LEETLAB");
});

app.get
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT} `);
});
