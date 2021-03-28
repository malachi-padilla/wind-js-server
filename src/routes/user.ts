import express from "express";
import { createPublicFacingUser } from "../utils/utilFunctions";
const router = express.Router();
import User from "../models/user/user";
import { generalMiddleware } from "../middleware/auth";
import { PublicApplicationUser } from "models/user/types";

router.get("/:userId", generalMiddleware, async (req: any, res) => {
  const { userId } = req.params;
  User.findById(userId, async (err, doc) => {
    if (err) {
      ``;
      res.status(400).send("Error getting user");
    } else {
      if (doc) {
        const publicFacingUser = await createPublicFacingUser(doc, req.user);
        res.send(publicFacingUser);
      } else {
        res.status(404).send("Not Found");
      }
    }
  });
});

router.get("/", generalMiddleware, async (req: any, res) => {
  const { username } = req.query;
  User.findOne({ username }, async (err, doc) => {
    if (err) {
      res.status(400).send("Error getting user");
      console.log(err);
    } else {
      if (doc) {
        const publicFacingUser = await createPublicFacingUser(doc, req.user);
        res.send(publicFacingUser);
      } else {
        res.status(404).send("Not Found");
      }
    }
  });
});

// Pass Array of UserID's and Get Array of User Info
router.post("/getUsers", async (req: any, res) => {
  try {
    const { users } = req.body;
    if (users) {
      const friendsArr: PublicApplicationUser[] = [];
      for (const item of users) {
        const user: any = await User.findById(item);
        if (!user) {
          res
            .status(500)
            .send(
              "Friend we are trying to reach doesn't exist, please contact administrators for help"
            );
        } else {
          const publicFacingUser = await createPublicFacingUser(user, req.user);
          friendsArr.push(publicFacingUser);
        }
      }
      res.send(friendsArr);
    }
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

export default router;
