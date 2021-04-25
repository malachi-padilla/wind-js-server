import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import personalChat from './WebSockets/personalChat';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import userRoutes from './routes/user';
import friendRoutes from './routes/friends';
import dotenv from 'dotenv';
import { CLIENT_URL } from './config/globalVariables';
import { S3Client } from '@aws-sdk/client-s3';
import { passportConfiguration } from './config/passport';

dotenv.config();
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? CLIENT_URL
        : 'http://localhost:3000',
    credentials: true,
  })
);

const URI =
  'mongodb+srv://malachi:123@cluster0.npkqi.mongodb.net/users?retryWrites=true&w=majority';

const OPTS = {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true,
};

mongoose.connect(URI, OPTS, () => {
  console.log('Connected to MONGODB');
});

passportConfiguration(passport);

const sessionMiddleware = session({
  secret: 'secretcode',
  resave: true,
  saveUninitialized: true,
  store: new MongoDBStore({
    uri:
      'mongodb+srv://malachi:123@cluster0.npkqi.mongodb.net/users?retryWrites=true&w=majority',
  }),
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
    secure: process.env.NODE_ENV === 'production' ? true : undefined,
    maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
  },
});

export const s3 = new S3Client({
  region: 'us-west-1',
  credentials: {
    accessKeyId: 'AKIAUNEWDFPB5KYH2CX7',
    secretAccessKey: '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',
  },
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);
app.use('/friends', friendRoutes);

personalChat(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));
