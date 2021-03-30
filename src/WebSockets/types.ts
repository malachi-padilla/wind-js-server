export interface PrivateChatSessionUser {
  socketId: string;
  name: string;
  friend: string;
}

export interface GeneralSessionUsers {
  name: string;
  socketId: string;
}

export interface PrivateChatMessage {
  friend: string;
  message: string;
}

export interface JoinedPrivateChatMessage {
  name: string;
  friend: string;
}
export interface JoinedMessage {
  name: string;
}
