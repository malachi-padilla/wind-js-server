import http from "http";
import mongoose from "mongoose";
import cors from "cors"
import express from 'express';
import session from "express-session";
import passport from "passport";
import { Strategy as localStrategy} from 'passport-local';
import User from "./models/user"
import personalChat from './WebSockets/personalChat';
import authRoutes from './routes/auth';
 import messages from "./routes/messages"
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const server = http.createServer(app);

app.use(cors({origin: "http://localhost:3000", credentials: true}));

const URI = "mongodb+srv://malachi:123@cluster0.npkqi.mongodb.net/users?retryWrites=true&w=majority";

const OPTS = {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true
};

mongoose.connect(URI, OPTS, () => {
  console.log("Connected to MONGODB");
})

passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ username }, (_err, doc) => {
      if (doc) {
        if (doc.password == password) {
          return done(null, doc);
        }
      }
    });
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ _id: id }, (err, user) => {
    // the public facing information
    const userInformation = {
      userId: user._id,
      username: user.username,
    };
    cb(err, userInformation);
  });
});





const sessionMiddleware = session({ secret: "secretcode", resave: true, saveUninitialized: true, store: new MongoDBStore({
  uri: 'mongodb+srv://malachi:123@cluster0.npkqi.mongodb.net/users?retryWrites=true&w=majority',
  })
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes)
app.use("/messages", messages)

personalChat(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log(`Server has started on port ${PORT}.`)
);
