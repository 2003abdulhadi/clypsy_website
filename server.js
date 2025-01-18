import express from "express";
import cors from "cors";
import router from "./routes/rotuer.js";
import morgan from "morgan";
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
