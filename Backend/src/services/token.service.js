const jwt = require("jsonwebtoken");

function generateAccessToken(id) {
  const token = jwt.sign(
    {
      id: id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  return token;
}

function generateRefreshToken(id) {
  const token = jwt.sign(
    {
      id: id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  return token;
}

module.exports = { generateAccessToken, generateRefreshToken };
