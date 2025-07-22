import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    await connectToDatabase();

    const user = await User.findOne({
      $or: [{ _id: userId }, { email: userId }],
    }).select(
      "name image bio githubLink linkedinLink preferredTopics preferredDifficulty " +
        "winCount totalGames lossCount easyProblems mediumProblems hardProblems " +
        "totalSubmissions acceptedSubmissions averageScore bestScore totalScore " +
        "currentStreak longestStreak rating createdAt solvedProblems"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const publicProfile = {
      ...user.toObject(),
      winRate:
        user.totalGames > 0
          ? Math.round((user.winCount / user.totalGames) * 100)
          : 0,
      acceptanceRate:
        user.totalSubmissions > 0
          ? Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100)
          : 0,
      totalProblemsolved:
        (user.easyProblems || 0) +
        (user.mediumProblems || 0) +
        (user.hardProblems || 0),
    };

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
