import express from 'express';
import User from '../models/user';
import passport from 'passport';
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.send("Success");
  } catch (error) {
    res.sendStatus(400).send("Invalid Request");
  }
});

router.post("/login", passport.authenticate("local"), (_req, res) => {
  res.send("success");
});

router.get("/user", (req: any, res) => {
  console.log(req.user  );
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
