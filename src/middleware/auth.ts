import User from "../models/user/user";
import jwt from "jsonwebtoken";

export function isLoggedInMiddleware(): void {
  // Fill Out Later
}

export async function updateLastOnline(req, _, __) {
  // update last online in database then continue
  const tokenInfo: any = jwt.decode(req.cookies?.token);
  if (tokenInfo) {
    await User.findByIdAndUpdate(tokenInfo.userId, { lastOnline: Date.now() });
  }
}

export async function verifyJwt(req) {
  const token = req.cookies.token;

  try {
    jwt.verify(token, process.env.JWT_SIGNING_KEY!);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return "Expired Token";
    } else {
      return "Invalid Token";
    }
  }
  return true;
}

export async function generalMiddleware(req, res, next) {
  await updateLastOnline(req, res, next);
  const jwtResult = await verifyJwt(req);
  if (jwtResult === "Expired Token") {
    res.status(401).send("Expired Token");
  } else if (jwtResult === "Invalid Token") {
    res.status(401).send("Invalid Token");
  } else {
    next();
  }
}
