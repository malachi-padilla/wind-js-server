import express from "express";
import { createPublicFacingUser } from "../utils/utilFunctions";
const router = express.Router();
import User from "../models/user/user";

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  User.findById(userId, (err, doc) => {
    if (err) {
      res.status(400).send("Error getting user");
    } else {
      if (doc) {
        const user = createPublicFacingUser(doc);
        res.send(user);
      } else {
        res.status(404).send("Not Found");
      }
    }
  });
});

router.get("/", async (req, res) => {
  const { username } = req.query;

  User.findOne({ username }, (err, doc) => {
    if (err) {
      res.status(400).send("Error getting user");
      console.log(err);
    } else {
      if (doc) {
        const user = createPublicFacingUser(doc);
        res.send(user);
      } else {
        res.status(404).send("Not Found");
      }
    }
  });
});
export default router;
