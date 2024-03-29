import express from "express";
import { PublicApplicationUser } from "models/user/types";
import { createPublicFacingUser } from "../utils/utilFunctions";
import jwt from "jsonwebtoken";
// import { PublicApplicationUser } from "models/types";
const router = express.Router();
import User from "../models/user/user";
import { generalMiddleware } from "../middleware/auth";

router.post("/friendRequest", generalMiddleware, async (req, res) => {
  // User 1 Is Requesting User 2:
  try {
    const { user1, user2 } = req.body;
    const mongoUser1: any = await User.findById(user1);
    const mongoUser2: any = await User.findById(user2);

    if (mongoUser1 && mongoUser2) {
      // Check to make sure you arent already friends
      if (mongoUser1.friends.includes(user2)) {
        res.send("Sorry you are already friends with this user.");
      }

      // If he has requested us, make us friends!
      else if (
        mongoUser1.recievedFriendRequests.includes(user2) &&
        mongoUser2.sentFriendRequests.includes(user1)
      ) {
        // slice off his id from our requests array and make us friends
        await User.findByIdAndUpdate(user1, {
          $pullAll: { recievedFriendRequests: [user2] },
        });
        await User.findByIdAndUpdate(user2, {
          $pullAll: { sentFriendRequests: [user1] },
        });
        await User.findByIdAndUpdate(user1, { $push: { friends: user2 } });
        await User.findByIdAndUpdate(user2, { $push: { friends: user1 } });
        res.send("Successfully added friend.");
      }

      // If we have never requested him
      else if (
        !mongoUser2.recievedFriendRequests.includes(user1) &&
        !mongoUser2.sentFriendRequests.includes(user1)
      ) {
        await User.findByIdAndUpdate(user1, {
          $push: { sentFriendRequests: user2 },
        });
        await User.findByIdAndUpdate(user2, {
          $push: { recievedFriendRequests: user1 },
        });
        res.send("Friend request sent.");
      }

      // only other condition is that they are already in our requests
      else {
        res.send("You have already requested this person before.");
      }
    } else {
      res.status(404).send("User doesn't exist");
    }
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

router.delete("/friendRequest", generalMiddleware, async (req, res) => {
  // User 1 Is Requesting To Unfriend User 2:
  try {
    const { user1, user2 } = req.body;
    const mongoUser1: any = await User.findById(user1);
    const mongoUser2: any = await User.findById(user2);

    if (mongoUser1 && mongoUser2) {
      // Validate that we actually have requested him
      if (
        mongoUser1.sentFriendRequests.includes(user2) &&
        mongoUser2.recievedFriendRequests.includes(user1)
      ) {
        await User.findByIdAndUpdate(user2, {
          $pullAll: { recievedFriendRequests: [user1] },
        });
        await User.findByIdAndUpdate(user1, {
          $pullAll: { sentFriendRequests: [user2] },
        });
        res.send("Successfully unrequested user.");
      }
      // If we are currently friends with the user
      else if (
        mongoUser2.friends.includes(user1) &&
        mongoUser1.friends.includes(user2)
      ) {
        await User.findByIdAndUpdate(user1, {
          $pullAll: { friends: [user2] },
        });

        await User.findByIdAndUpdate(user2, {
          $pullAll: { friends: [user1] },
        });

        await User.findByIdAndUpdate(user1, {
          $push: { recievedFriendRequests: user2 },
        });
        await User.findByIdAndUpdate(user2, {
          $push: { sentFriendRequests: user1 },
        });
        res.send("Successfully unfriended user.");
      } else {
        res.send("Error, bad request");
      }
    } else {
      res.status(404).send("User doesn't exist");
    }
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

router.get("/", generalMiddleware, async (req: any, res) => {
  // Get all friends of user
  try {
    const { user } = req.query;
    await User.findById(user, async (err, doc) => {
      if (err) {
        res.status(400).send("Error getting user");
      } else {
        if (doc) {
          const { friends } = doc;
          const friendsArr: PublicApplicationUser[] = [];
          for (const item of friends) {
            const user: any = await User.findById(item);
            if (!user) {
              res
                .status(500)
                .send(
                  "Friend doesn't exist, please contact administrators for help"
                );
            } else {
              const requesterClaims: any = jwt.decode(req.cookies?.token);
              const requesterInfo = await User.findById(requesterClaims.userId);
              const publicFacingUser = await createPublicFacingUser(
                user,
                requesterInfo
              );
              friendsArr.push(publicFacingUser);
            }
          }
          res.send(friendsArr);
        } else {
          res.status(404).send("Not Found");
        }
      }
    });
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

router.get("/getMutualFriends", generalMiddleware, async (req, res) => {
  // Get Mutual Friends between User1 and User2
  try {
    const { user1, user2 } = req.query;
    await User.findById(user1, async (err, doc) => {
      if (err) {
        res.status(400).send("Error getting user");
      } else {
        if (doc) {
          User.findById(user2, async (err, doc2) => {
            if (err) {
              res.status(400).send("Error getting user");
            }
            const user1Friends = doc.friends;
            const user2Friends = doc2.friends;

            const mutual = user2Friends.filter((item) =>
              user1Friends.includes(item)
            );
            const promises = mutual.map(async (item) => {
              const user = await User.findById(item);
              return await createPublicFacingUser(user);
            });

            const mutualFriends = await Promise.all(promises);
            res.send(mutualFriends);
          });
        } else {
          res.status(404).send("Not Found");
        }
      }
    });
  } catch (e) {
    res.status(422).send("Sorry, Bad Input.");
  }
});

router.get("/search", generalMiddleware, async (req, res) => {
  try {
    const result: any = await User.aggregate([
      {
        $search: {
          autocomplete: {
            query: `${req.query.term}`,
            path: "username",
            fuzzy: {
              maxEdits: 1,
            },
          },
        },
      },
    ]);
    const promises = result.map(async (item) => {
      return await createPublicFacingUser(item);
    });

    const searchResults = await Promise.all(promises);
    res.send(searchResults);
  } catch (e) {
    res.status(500).send("Sorry, Bad Input");
  }
});

export default router;
