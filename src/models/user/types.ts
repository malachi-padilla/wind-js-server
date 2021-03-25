// Public -> anyone can see this. Ex (Name ETC)
// Personal -> only the person themselves and admins, etc can see. Ex (Sent Friend Requests ETC)
// Internal -> only the server can see this, not even administrators. Ex (Passwords ETC)

export interface PersonalApplicationUser {
    userId: string;
    sentFriendRequests: string[];
    recievedFriendRequests: string[];
    friends: string[];
    username: string
}

export interface PublicApplicationUser {
    userId: string;
    friends: string[];
    username: string
}