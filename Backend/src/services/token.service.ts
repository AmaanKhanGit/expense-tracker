import jwt from "jsonwebtoken";

export function generateAccessToken(id: string): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }
  const token = jwt.sign(
    {
      id,
    },
    secret,
    { expiresIn: "15m" }
  );
  return token;
}

export function generateRefreshToken(id: string): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured");
  }
  const token = jwt.sign(
    {
      id,
    },
    secret,
    { expiresIn: "7d" }
  );
  return token;
}
