// models/User.js
// ------------------------------------------------------------------
// This is the MongoDB schema (blueprint) for a "user" document.
//
// KEY DESIGN DECISION (explain this to new devs!):
// A user can end up authenticating in two possible ways:
//   1) Local (email + password)
//   2) Google (OAuth sign-in)
//
// Instead of creating two separate collections (LocalUser / GoogleUser),
// we use ONE "User" collection where:
//   - `password`  is set ONLY if the user signed up the normal way
//   - `googleId`  is set ONLY if the user has linked/used Google
//
// A single user document CAN have BOTH fields set at the same time.
// That's what happens when someone signs up locally first, and later
// logs in with Google using the SAME email (see authController.js for
// the exact linking logic, and the README for a full explanation).
// ------------------------------------------------------------------

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // Email is our "unique identity key" that ties a local account
    // and a Google account together if they match.
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // always store emails in lowercase to avoid duplicates like "A@x.com" vs "a@x.com"
      trim: true,
    },

    // Only present for users who signed up with email + password.
    // "select: false" means this field is NOT returned by default in
    // queries (e.g. User.find()) unless we explicitly ask for it with
    // .select('+password'). This is a basic security best practice so
    // we never accidentally send password hashes to the frontend.
    password: {
      type: String,
      select: false,
    },

    // Only present for users who have signed in with Google at least once.
    // This is Google's unique "sub" (subject) identifier for the account,
    // NOT the email. Using this instead of email as the lookup key for
    // Google is important because emails could theoretically change.
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many documents to have googleId: null without violating "unique"
    },

    // Optional profile picture URL (Google provides this automatically)
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // Handy flag so the frontend/backend can quickly tell how this
    // account can log in, without checking password/googleId directly.
    // Possible values: "local", "google", "both"
    authProviders: {
      type: [String],
      enum: ["local", "google"],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  },
);

module.exports = mongoose.model("User", userSchema);
