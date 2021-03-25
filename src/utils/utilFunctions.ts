import { PersonalApplicationUser, PublicApplicationUser } from 'models/user/types'
// Take a MongoDB Document and Spit Out Public Facing Data.
export function createPublicFacingUser(mongoDBDocument: any): PublicApplicationUser {
    return {
        userId: mongoDBDocument._id,
        friends: mongoDBDocument.friends,
        username: mongoDBDocument.username
    };
}
// Take a MongoDB Document and Spit Out Personal Facing Data.
export function createPersonalFacingUser(mongoDBDocument: any): PersonalApplicationUser {
    return {    
        userId: mongoDBDocument._id,
        friends: mongoDBDocument.friends,
        username: mongoDBDocument.username,
        sentFriendRequests: mongoDBDocument.sentFriendRequests,
        recievedFriendRequests: mongoDBDocument.recievedFriendRequests
    };
}