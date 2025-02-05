import express from "express";
import authRouter from "./authRouter.js";

const router = express.Router();

router.use("/auth", authRouter)

router.get("/", async (req, res) => {
  res.send("Welcome to the Clypsy API!");
});

export default router;
