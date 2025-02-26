import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jsonwebtoken from "jsonwebtoken";

const authRouter = express.Router();
const prisma = new PrismaClient();
const emailRegex = /^.+@.+\..+$/;
const saltRounds = 10;

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return res.status(400).json({ error: "Email is required." });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      throw new Error("Email already in use.");
    }
  } catch (err) {
    console.error("Error validating email: ", err);
    return res
      .status(500)
      .json({ error: "Database error while validating email." });
  }

  // validate passwod
  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    return res.status(400).json({ error: "Password is required." });
  }

  // must contain 1 upper, 1 lower, 1 number, 1 symbol
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.",
    });
  }

  // hash pw and create user
  bcrypt
    .hash(password, saltRounds)
    .then((hashed) =>
      prisma.user.create({
        data: {
          email,
          password: hashed,
        },
      })
    )
    .then((newUser) => {
      return res
        .status(201)
        .json({ message: "User created succesfully.", userId: newUser.id });
    })
    .catch((err) => {
      console.error("Error during signup: ", err);
      return res.status(500).json({ error: "Error creating user." });
    });
});

authRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return res.status(400).json({ error: "Email is required." });
  }

  // validate passwod
  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    return res.status(400).json({ error: "Password is required." });
  }

  // find user
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const userSignature = {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };

    const acccessToken = jsonwebtoken.sign(
      userSignature,
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
    );
    const refreshToken = jsonwebtoken.sign(
      userSignature,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    );

    return res.status(200).json({
      userId: user.id,
      acccessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Error during signin: ", err);
    return res.status(500).json({ error: "Error during sign in." });
  }
});

export default authRouter;
