import express from "express";
import {
  isUserLoggedIn,
  login,
  signUp,
} from "../controller/authController.js";
import {  validateToken } from "../helpers/token.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
authRoutes.get("/isuserloggedin", validateToken, isUserLoggedIn);
