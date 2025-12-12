const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    recipeId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true }
  }, { collection: "favorites" });

module.exports = mongoose.model("Favorite", FavoriteSchema);