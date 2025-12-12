const express = require("express");
const jwt = require("jsonwebtoken");
const Favorite = require("../models/favorite");

require("dotenv").config();
const router = express.Router();
const SECRET = process.env.SECRET || "s8f7G!kL2pQ#xR9vT1bZ";

// 驗證 token
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.json({ success: false, message: "Missing token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.json({ success: false, message: "Invalid token" });
  }
}

// 加入收藏
router.post("/add", auth, async (req, res) => {
  const { recipeId, title, thumbnail } = req.body;

  if (!recipeId || !title || !thumbnail)
    return res.json({ success: false, message: "Missing recipe data" });

  const exists = await Favorite.findOne({ userId: req.userId, recipeId });

  if (exists) return res.json({ success: false, message: "Already in favorites" });

  await Favorite.create({
    userId: req.userId,
    recipeId,
    title,
    thumbnail
  });

  res.json({ success: true });
});

// 移除收藏
router.post("/remove", auth, async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId) return res.json({ success: false, message: "Recipe ID required" });

  await Favorite.deleteOne({ userId: req.userId, recipeId });

  res.json({ success: true });
});

// 取得使用者所有收藏
router.get("/list", auth, async (req, res) => {
  const items = await Favorite.find({ userId: req.userId });
  res.json({ success: true, favorites: items });
});

module.exports = router;
