import { createPersonalFacingUser } from "../utils/utilFunctions";
import { Strategy as localStrategy } from "passport-local";
import User from "../models/user/user";

export const passportConfiguration = (passport) => {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ username }, async (_err, doc) => {
        if (doc) {
          if (doc.password == password) {
            await User.findOneAndUpdate(
              { username },
              { lastOnline: Date.now() }
            );
            return done(null, doc);
          } else {
            return done(null, false, "bad-password");
          }
        } else {
          return done(null, false, "bad-username");
        }
      });
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id }, async (err, user) => {
      // Sednd public facing information only
      cb(err, await createPersonalFacingUser(user));
    });
  });
};
