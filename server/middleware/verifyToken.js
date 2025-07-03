import jwt from "jsonwebtoken";

export const isLoggin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({ message: "Unauthorized - No token" });

  try {
    const decoded = jwt.verify(token, "hdhddhdhdhdhdhhhdhdhdhdhdh");
    req.user = decoded; // Attach user info
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
