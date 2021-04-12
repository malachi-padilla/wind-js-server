import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../index";
import {
  PersonalApplicationUser,
  PublicApplicationUser,
} from "models/user/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Take a MongoDB Document and Spit Out Public Facing Data.
export async function createPublicFacingUser(
  mongoDBDocument: any,
  signedInUser: any = null
): Promise<PublicApplicationUser> {
  return new Promise(async (resolve, _) => {
    let relation;
    if (signedInUser && Object.keys(signedInUser).length > 0) {
      if (signedInUser.sentFriendRequests.includes(mongoDBDocument._id)) {
        relation = "Requested";
      } else if (
        signedInUser.recievedFriendRequests.includes(mongoDBDocument._id)
      ) {
        relation = "Recipient Requested";
      } else if (signedInUser.friends.includes(mongoDBDocument._id)) {
        relation = "Friends";
      } else {
        relation = "None";
      }
    }

    let profilePicture: string;
    if (
      mongoDBDocument.profilePicture &&
      mongoDBDocument.profilePicture !== ""
    ) {
      profilePicture = await generateS3BucketUrl(
        process.env.PROFILE_PICTURES_BUCKET,
        mongoDBDocument.profilePicture
      );
    } else {
      profilePicture = "https://source.unsplash.com/random";
    }

    resolve({
      userId: mongoDBDocument._id,
      friends: mongoDBDocument.friends,
      username: mongoDBDocument.username,
      lastOnline: mongoDBDocument.lastOnline,
      relation,
      profilePicture,
    });
  });
}
// Take a MongoDB Document and Spit Out Personal Facing Data.
export async function createPersonalFacingUser(
  mongoDBDocument: any
): Promise<PersonalApplicationUser> {
  let profilePicture: string;

  if (mongoDBDocument.profilePicture && mongoDBDocument.profilePicture !== "") {
    profilePicture = await generateS3BucketUrl(
      process.env.PROFILE_PICTURES_BUCKET,
      mongoDBDocument.profilePicture
    );
  } else {
    profilePicture = "https://source.unsplash.com/random";
  }

  return {
    userId: mongoDBDocument._id,
    friends: mongoDBDocument.friends,
    username: mongoDBDocument.username,
    sentFriendRequests: mongoDBDocument.sentFriendRequests,
    recievedFriendRequests: mongoDBDocument.recievedFriendRequests,
    lastOnline: mongoDBDocument.lastOnline,
    profilePicture,
  };
}

export function generateS3BucketUrl(bucketName, bucketKey): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: bucketKey,
      Expires: 120, // 2 minutes
    };
    const command = new GetObjectCommand(params);
    getSignedUrl(s3, command, { expiresIn: 3600 })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => reject(error));
  });
}
