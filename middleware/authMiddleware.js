// // // // // middleware/authMiddleware.js
// // // // // ------------------------------------------------------------------
// // // // // This middleware "protects" routes. It runs BEFORE the route
// // // // // handler, checks for a valid JWT in the cookie, and either:
// // // // //   - lets the request continue (attaching req.user), or
// // // // //   - rejects it with a 401 Unauthorized
// // // // // ------------------------------------------------------------------

// // // // const jwt = require('jsonwebtoken');

// // // // const protect = (req, res, next) => {
// // // //   try {
// // // //     // The token was stored as an HttpOnly cookie named "token"
// // // //     // (see utils/generateToken.js). cookie-parser middleware in
// // // //     // server.js makes req.cookies available.
// // // //     const token = req.cookies.token;

// // // //     if (!token) {
// // // //       return res.status(401).json({ message: 'Not authorized, no token' });
// // // //     }

// // // //     // Verify the token's signature and expiration using our secret.
// // // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

// // // //     // Attach the decoded payload (contains userId) to the request so
// // // //     // later handlers (like getMe) can use it.
// // // //     req.user = decoded;

// // // //     next(); // move on to the actual route handler
// // // //   } catch (error) {
// // // //     return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
// // // //   }
// // // // };

// // // // module.exports = { protect };

// // // const jwt = require("jsonwebtoken");

// // // const authMiddleware = (req, res, next) => {
// // //   const token = req.cookies.token;

// // //   if (!token) {
// // //     return res.status(401).json({
// // //       message: "No token",
// // //     });
// // //   }

// // //   try {
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

// // //     req.user = decoded;

// // //     next();
// // //   } catch (error) {
// // //     return res.status(401).json({
// // //       message: "Invalid token",
// // //     });
// // //   }
// // // };

// // // module.exports = authMiddleware;

// // const jwt = require("jsonwebtoken");

// // const authMiddleware = (req, res, next) => {
// //   try {
// //     const token = req.cookies.token;

// //     if (!token) {
// //       return res.status(401).json({
// //         message: "Not authorized",
// //       });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //     req.user = decoded;

// //     next();
// //   } catch (error) {
// //     return res.status(401).json({
// //       message: "Invalid token",
// //     });
// //   }
// // };

// // module.exports = authMiddleware;

// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({
//         message: "Not authenticated",
//       });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     // IMPORTANT
//     req.user = {
//       userId: decoded.userId
//     };

//     next();

//   } catch (error) {

//     return res.status(401).json({
//       message: "Invalid or expired token",
//     });

//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { userId: decoded.userId };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;
