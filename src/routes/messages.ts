import express from "express";
import { generalMiddleware } from "../middleware/auth";
const router = express.Router();
import Message from "../models/message/message";

router.get("/getMessages", generalMiddleware, async (req, res) => {
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

router.get("/recentlyMessaged", async (req, res) => {
  // get last 10 recently messaged from username
  const { user } = req.query;

  const information = await Message.aggregate([
    {
      $match: { $or: [{ sentBy: user }, { recipient: user }] },
    },
    {
      $group: {
        _id: { recipient: "$recipient", sentBy: "$sentBy" },
        date: { $max: "$createdAt" },
      },
    },
    { $sort: { date: -1 } },
  ]);

  const revisedInformation = information.map((item) => {
    if (item._id.sentBy === user) {
      return item._id.recipient;
    } else {
      return item._id.sentBy;
    }
  });

  const uniq = [...new Set(revisedInformation)];

  res.send(uniq);
});
