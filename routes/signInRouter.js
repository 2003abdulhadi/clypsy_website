import express from "express";

const signInRouter = express.Router();

signInRouter.post("/", (req, res) => {
  const { email, password } = req.body;
  if (email === "reject") {
    res.status(401);
  } else if (email === "accept") {
    res.status(200);
  } else {
    res.status(404);
  }
  res.send();
});

export default signInRouter;
