import express from "express";
import {
  createPublicFacingUser,
  generateS3BucketUrl,
} from "../utils/utilFunctions";
const router = express.Router();
import User from "../models/user/user";
import jwt from "jsonwebtoken";
import { generalMiddleware } from "../middleware/auth";
import { PublicApplicationUser } from "models/user/types";
import multer from "multer";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../index";

// Pass Array of UserID's and Get Array of User Info
router.post("/getUsers", generalMiddleware, async (req: any, res) => {
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
          const requestersInfo = jwt.decode(req.cookies?.token);
          const publicFacingUser = await createPublicFacingUser(
            user,
            requestersInfo
          );
          friendsArr.push(publicFacingUser);
        }
      }
      res.send(friendsArr);
    }
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

router.post("/updateUserInfo", generalMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.cookies?.token;

    const { body } = req;

    await User.findByIdAndUpdate(userId, body);
    res.send("Updated");
  } catch (e) {
    console.log(e);
    res.status(400).send("Error Updating UserInfo");
  }
});

router.post(
  "/uploadProfilePicture",
  multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
    "avatar"
  ),
  async (req: any, res) => {
    try {
      const d = new Date();
      const { userId } = req.body;
      const KEY_NAME = `userAvatar/${userId}/${d.getTime()}${
        req.file.originalname
      }`;

      const params = {
        Bucket: process.env.PROFILE_PICTURES_BUCKET,
        Body: fs.createReadStream(req.file.path),
        ACL: "public-read",
        Key: KEY_NAME,
      };

      try {
        await s3.send(new PutObjectCommand(params));
        await User.findByIdAndUpdate(userId, { profilePicture: KEY_NAME });
      } catch (err) {
        res.status(400).send("Couldn't Save to S3");
      }
      fs.unlinkSync(req.file.path); // Empty temp folder
      res.send("Successfully Uploaded Image");
    } catch (e) {
      console.log(e);
      res.status(400).send("Error with Upload");
    }
  }
);

router.get("/getProfilePicture", generalMiddleware, async (req, res) => {
  try {
    const { userId, username } = req.query;

    let user: any;
    if (username) {
      user = await User.findOne({ username });
    } else if (userId) {
      user = await User.findById(userId);
    }

    const profilePicture = user.profilePicture;

    if (profilePicture && profilePicture !== "") {
      generateS3BucketUrl(process.env.PROFILE_PICTURES_BUCKET, profilePicture)
        .then((url) => {
          res.send(url);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send("Error");
        });
    } else {
      res.send("https://source.unsplash.com/random");
    }
  } catch (e) {
    res.status(400).send("Error fetching user");
  }
});

router.get("/:userId", generalMiddleware, async (req: any, res) => {
  const { userId } = req.params;
  User.findById(userId, async (err, doc) => {
    if (err) {
      ``;
      res.status(400).send("Error getting user");
    } else {
      if (doc) {
        const requestersInfo = jwt.decode(req.cookies?.token);
        const publicFacingUser = await createPublicFacingUser(
          doc,
          requestersInfo
        );
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
        const userInfo = jwt.decode(req.cookies?.token);
        const publicFacingUser = await createPublicFacingUser(doc, userInfo);
        res.send(publicFacingUser);
      } else {
        res.status(404).send("Not Found");
      }
    }
  });
});

export default router;
