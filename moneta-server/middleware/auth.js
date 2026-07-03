import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export const requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired session." });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
};
