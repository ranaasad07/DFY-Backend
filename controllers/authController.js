// controllers/authController.js
// ------------------------------------------------------------------
// All the "business logic" for authentication lives here.
// The routes file (routes/authRoutes.js) just wires URLs to these
// functions - it doesn't contain any logic itself.
// ------------------------------------------------------------------

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Google's SDK needs this client to verify tokens sent from the frontend.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==================================================================
// 1) REGISTER (SIGN UP) - the "normal" email + password flow
// ==================================================================
// POST /api/auth/signup
// body: { name, email, password }
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if a user with this email already exists.
    const existingUser = await User.findOne({ email: normalizedEmail });

    // ---------------------------------------------------------------
    // *** THE IMPORTANT EDGE CASE: signing up with an email that
    // already exists as a GOOGLE-only account ***
    //
    // Scenario: someone signed in with Google previously using
    // "john@gmail.com". Now they come to the normal signup form and
    // type "john@gmail.com" + a password.
    //
    // We DON'T want two separate documents for the same person.
    // Since they already own that Google account (Google verified the
    // email for us), it's safe to just ADD a password to their
    // existing account. This "links" local login onto their Google
    // account, so from now on they can log in EITHER way.
    // ---------------------------------------------------------------
    if (existingUser) {
      if (existingUser.password) {
        // They already have a password -> a real duplicate signup attempt.
        return res.status(400).json({
          message:
            "An account with this email already exists. Please log in instead.",
        });
      }

      // existingUser has googleId but NO password yet -> link them.
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
      if (!existingUser.authProviders.includes("local")) {
        existingUser.authProviders.push("local");
      }
      await existingUser.save();

      generateToken(res, existingUser._id);
      return res.status(200).json({
        message:
          "Password added to your existing Google account. You can now log in with either method.",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          avatar: existingUser.avatar,
          //for admin
          role: existingUser.role,
          authProviders: existingUser.authProviders,
        },
      });
    }

    // No existing user at all -> completely new account.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      authProviders: ["local"],
      //role
    });

    generateToken(res, newUser._id);
    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        authProviders: newUser.authProviders,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

// ==================================================================
// 2) LOGIN - the "normal" email + password flow
// ==================================================================
// POST /api/auth/login
// body: { email, password }
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // We must explicitly select '+password' because the schema hides
    // it by default (select: false).
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      // Same generic message whether email doesn't exist or password
      // is wrong - this avoids leaking which emails are registered.
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ---------------------------------------------------------------
    // Edge case: this account was created via Google ONLY and has
    // never set a password. Tell the user clearly what to do instead
    // of throwing a confusing "invalid password" error.
    // ---------------------------------------------------------------
    if (!user.password) {
      return res.status(400).json({
        message:
          'This email is registered via Google. Please use "Sign in with Google", or log in with Google once and set a password from your profile.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(res, user._id);
    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProviders: user.authProviders,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ==================================================================
// 3) GOOGLE LOGIN / SIGNUP - one endpoint handles BOTH cases
// ==================================================================
// POST /api/auth/google
// body: { idToken }  <- this comes from Google's frontend SDK
//
// How this works end-to-end (explain to new devs):
//  1. On the frontend, the user clicks "Sign in with Google".
//  2. Google's script shows its own popup/consent screen and, if
//     successful, gives the frontend a signed "ID token" (a JWT that
//     Google itself signed - proving the user's identity).
//  3. The frontend sends that raw idToken to OUR backend.
//  4. Our backend asks Google's library to VERIFY the token's
//     signature using Google's public keys. We NEVER trust the token
//     blindly - verifying it is what actually proves it's legit.
//  5. Once verified, we get the user's real Google email, name,
//     picture, and Google's unique "sub" (subject) ID.
//  6. We then look the user up (see linking logic below), create a
//     session cookie, and respond.
// ==================================================================
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    // Ask Google to verify this token was really issued by Google for
    // OUR app (the audience must match our GOOGLE_CLIENT_ID).
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user is ALREADY logged in (cookie present)
    let loggedInUser = null;
    if (req.cookies && req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        loggedInUser = await User.findById(decoded.userId);
      } catch (err) {
        // Token invalid/expired, ignore
      }
    }

    let user;

    if (loggedInUser) {
      // -----------------------------------------------------------
      // Scenario A: User is already logged in (e.g. from Dashboard)
      // and clicks "Connect Google Account". Link it directly.
      // -----------------------------------------------------------
      user = loggedInUser;
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      if (!user.authProviders.includes("google")) {
        user.authProviders.push("google");
      }
      await user.save();
    } else {
      // Scenario B: Public login/signup page flow
      // First, try to find a user already linked to this exact Google account.
      user = await User.findOne({ googleId });

      if (!user) {
        // No one has this googleId yet. Check by EMAIL.
        user = await User.findOne({ email: normalizedEmail });

        if (user) {
          // Account exists with this email -> link Google provider.
          user.googleId = googleId;
          if (picture && !user.avatar) user.avatar = picture;
          if (!user.authProviders.includes("google")) {
            user.authProviders.push("google");
          }
          await user.save();
        } else {
          // Brand new user
          user = await User.create({
            name,
            email: normalizedEmail,
            googleId,
            avatar: picture || "",
            authProviders: ["google"],
          });
        }
      }
    }

    generateToken(res, user._id);
    return res.status(200).json({
      message: "Logged in with Google successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProviders: user.authProviders,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("googleAuth error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

// ==================================================================
// 4) LOGOUT - just clears the cookie
// ==================================================================
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // instantly expire the cookie
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

// ==================================================================
// 5) GET CURRENT USER - used by frontend on page load to check
//    "is someone already logged in?" via the cookie.
// ==================================================================
const getMe = async (req, res) => {
  // req.user is attached by the authMiddleware (see middleware/authMiddleware.js)
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProviders: user.authProviders,
      role: user.role,
    },
  });
};

module.exports = { registerUser, loginUser, googleAuth, logoutUser, getMe };
