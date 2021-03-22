import express from 'express';
const router = express.Router();
import User from '../models/user'

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    User.findById(userId, (err, doc) => {
      if (doc) res.send(doc);
      else {
        res.status(404).send("Not Found");
      }
    });
  } catch (e) {
    console.log(e);
  }
});

export default  router;
