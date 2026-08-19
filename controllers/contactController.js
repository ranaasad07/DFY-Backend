const Contact = require("../models/Contact");

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Message)",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject: subject || "",
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
      contact,
    });
  } catch (error) {
    console.error("submitContact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error sending message. Please try again.",
    });
  }
};

module.exports = { submitContact };
