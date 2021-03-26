import User from "../models/user/user";

export function isLoggedInMiddleware(): void {
  // Fill Out Later
}

export async function updateLastOnline(req, _, __) {
  // update last online in database then continue
  if (req.user) {
    await User.findByIdAndUpdate(req.user.userId, { lastOnline: Date.now() });
  }
}

export async function generalMiddleware(req, res, next) {
  await updateLastOnline(req,res,next)
  next();
}
