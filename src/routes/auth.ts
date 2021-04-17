import express from "express";
import User from "../models/user/user";
import passport from "passport";
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
      req.logIn(user, function () {
        res.send("success");
      });
      // Register failed, flash message is in info
    } else {
      res.status(400).json(info);
    }
  })(req, res, next);
});

router.get("/user", (req: any, res) => {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send("no user");
  }
});

router.get("/logout", (req: any, res) => {
  req.logout();
  res.send("success");
});

export default router;
