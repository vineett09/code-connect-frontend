import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  providerId: { type: String },

  // game stats
  solvedProblems: [{ type: String }],
  winCount: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  lossCount: { type: Number, default: 0 },

  // Difficulty-based stats
  easyProblems: { type: Number, default: 0 },
  mediumProblems: { type: Number, default: 0 },
  hardProblems: { type: Number, default: 0 },

  // Submission stats
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },

  // Performance metrics
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },

  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastGameDate: { type: Date },
  currentRoomId: { type: String, default: null },

  // Skill or preferences
  preferredTopics: [{ type: String }],
  preferredDifficulty: { type: String, default: "medium" },
  rating: { type: Number, default: 0 },

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
