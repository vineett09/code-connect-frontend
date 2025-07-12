import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  providerId: { type: String },

  // Game stats
  solvedProblems: [{ type: String }],
  winCount: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  currentRoomId: { type: String, default: null },

  // Skill or preferences
  preferredTopics: [{ type: String }],
  preferredDifficulty: { type: String, default: "medium" },
  rating: { type: Number, default: 1200 },

  // Optional profile
  bio: { type: String },
  githubLink: { type: String },
  linkedinLink: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.index({ providerId: 1 });
userSchema.index({ rating: -1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
