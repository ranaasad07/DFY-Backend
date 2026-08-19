// // router.get("/dashboard", authMiddleware, adminMiddleware, controller);
// const User = require("../models/User");

// const adminMiddleware = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     if (user.role !== "admin") {
//       return res.status(403).json({
//         message: "Admin access required",
//       });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: "Admin verification failed",
//     });
//   }
// };

// module.exports = adminMiddleware;

const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Admin verification failed",
    });
  }
};

module.exports = adminMiddleware;
