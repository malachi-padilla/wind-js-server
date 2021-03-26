import express from "express";
import { lastOnlineMiddleware } from "../middleware/auth";
const router = express.Router();
import Message from "../models/message/message";

router.get("/getMessages", lastOnlineMiddleware, async (req, res) => {
  const { user1, user2 } = req.query;
  await Message.find({
    $or: [
      { sentBy: user1, recipient: user2 },
      { recipient: user1, sentBy: user2 },
    ],
  })
    .sort({ $natural: -1 })
    .limit(50)
    .exec((err, docs) => {
      err ? res.send({ err }) : null;

      if (docs) {
        res.send(docs.reverse());
      }
    });
});

export default router;
