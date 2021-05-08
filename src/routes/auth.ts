import express from "express";
import User from "../models/user/user";
import passport from "passport";
import { createPersonalFacingUser, signJwt } from "../utils/utilFunctions";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = new User({ username, password, email });
    await newUser.save();
    res.send("Success");
  } catch (error) {
    res.sendStatus(400).send("Invalid Request");
  }
});

router.post("/login", (req: any, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (user) {
      req.logIn(user, async function () {
        const publicUser = await createPersonalFacingUser(user);
        const token = await signJwt(publicUser.userId);
        res.cookie("token", token, {
          maxAge: 500000000000,
        });
        res.send("success");
      });
      // Register failed, flash message is in info
    } else {
      res.status(400).json(info);
    }
  })(req, res, next);
});

router.get("/user", async (req: any, res) => {
  if (req.cookies?.token) {
    const claims: any = jwt.decode(req.cookies.token);

    const user = await createPersonalFacingUser(
      await User.findById(claims.userId)
    );
    res.send(user);
  } else {
    res.send("no user");
  }
});

router.get("/logout", (req: any, res) => {
  req.logout();
  res.cookie("token", "", {
    expires: new Date(),
  });
  res.send("success");
});

router.post("/refreshToken", async (req, res) => {
  // (BEGIN) The code uptil this point is the same as the first part of the `welcome` route
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).end();
  }

  const payload: any = jwt.decode(token);

  const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
  if (payload.exp - nowUnixSeconds > 30) {
    return res.status(400).end();
  }
  delete payload.exp;
  delete payload.iat;

  const newToken = await signJwt(payload.userId);

  res.cookie("token", newToken, {
    maxAge: 50000000000,
  });
  res.send("success");
});
export default router;
