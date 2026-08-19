// // utils/generateToken.js
// // ------------------------------------------------------------------
// // Small helper: creates a JWT for a given user ID and sends it back
// // to the browser as an HttpOnly cookie.
// //
// // Why a cookie instead of localStorage?
// // - HttpOnly cookies can't be read by JavaScript in the browser, which
// //   protects the token from XSS (cross-site scripting) attacks.
// // - The browser automatically attaches the cookie to every request to
// //   our API, so the frontend doesn't need to manually manage tokens.
// // ------------------------------------------------------------------

// const jwt = require('jsonwebtoken');

// const generateToken = (res, userId) => {
//   // Sign a token that contains the user's Mongo _id in the payload.
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   });

//   // Set the token as an HttpOnly cookie on the response.
//   res.cookie('token', token, {
//     httpOnly: true, // JS on the frontend cannot read this cookie
//     secure: process.env.NODE_ENV === 'production', // HTTPS only in production
//     sameSite: 'lax', // CSRF protection while still allowing normal navigation
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
//   });

//   return token;
// };

// module.exports = generateToken;

const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: parseExpiresInToMs(expiresIn),
  });

  return token;
};

// Helper to convert simple expirations like '7d' or seconds into ms for cookie maxAge
function parseExpiresInToMs(expiresIn) {
  if (!expiresIn) return 7 * 24 * 60 * 60 * 1000;
  // supports formats like '7d', '24h', or seconds as a number string
  const dayMatch = expiresIn.match(/^(\d+)d$/);
  if (dayMatch) return parseInt(dayMatch[1], 10) * 24 * 60 * 60 * 1000;
  const hourMatch = expiresIn.match(/^(\d+)h$/);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 60 * 60 * 1000;
  const secMatch = expiresIn.match(/^(\d+)s$/);
  if (secMatch) return parseInt(secMatch[1], 10) * 1000;
  const asNumber = Number(expiresIn);
  if (!Number.isNaN(asNumber)) return asNumber * 1000;
  // fallback to 7 days
  return 7 * 24 * 60 * 60 * 1000;
}

module.exports = generateToken;
