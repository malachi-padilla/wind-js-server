export interface PrivateChatSessionUser {
  socketId: string;
  name: string;
  friend: string;
}

export interface PrivateChatMessage {
  friend: string;
  message: string;
}

export interface JoinedMessage {
  name: string;
  friend: string;
}
