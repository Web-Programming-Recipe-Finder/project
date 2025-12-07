const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const SECRET = "mongodb+srv://user:010203@webprogramming.do8ki3h.mongodb.net/RecipeFinder";

// 註冊
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.json({ success: false, message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  res.json({ success: true });
});

// 登入
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.json({ success: false, message: "User does not exist" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.json({ success: false, message: "Incorrect password" });

  const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "2d" });

  res.json({ success: true, token, username: user.username });
});

module.exports = router;
