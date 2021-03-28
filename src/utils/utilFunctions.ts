import {
  PersonalApplicationUser,
  PublicApplicationUser,
} from "models/user/types";
// Take a MongoDB Document and Spit Out Public Facing Data.
export async function createPublicFacingUser(
  mongoDBDocument: any,
  signedInUser: any = null
): Promise<PublicApplicationUser> {
  return new Promise((resolve, _) => {
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
    resolve({
      userId: mongoDBDocument._id,
      friends: mongoDBDocument.friends,
      username: mongoDBDocument.username,
      lastOnline: mongoDBDocument.lastOnline,
      relation,
    });
  });
}
// Take a MongoDB Document and Spit Out Personal Facing Data.
export function createPersonalFacingUser(
  mongoDBDocument: any
): PersonalApplicationUser {
  return {
    userId: mongoDBDocument._id,
    friends: mongoDBDocument.friends,
    username: mongoDBDocument.username,
    sentFriendRequests: mongoDBDocument.sentFriendRequests,
    recievedFriendRequests: mongoDBDocument.recievedFriendRequests,
    lastOnline: mongoDBDocument.lastOnline,
  };
}
