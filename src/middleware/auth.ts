import User from "../models/user/user";

export function isLoggedInMiddleware(): void {
  // Fill Out Later
}

export async function lastOnlineMiddleware(req, _, next) {
  // update last online in database then continue
  if (req.user) {
    await User.findByIdAndUpdate(req.user.userId, { lastOnline: Date.now() });
  }
  next();
}

// Make middleware that combines isLoggedIn and lastOnline when ready.
