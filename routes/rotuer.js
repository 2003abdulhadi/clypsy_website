import express from "express";
import signInRouter from "./signinRouter.js";

const router = express.Router();

router.use("/signin", signInRouter)

router.get("/", async (req, res) => {
  res.send("Welcome to the Clypsy API!");
});

export default router;
