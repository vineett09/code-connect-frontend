import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

/**
 * @param {Request} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  const internalApiKey = request.headers.get("x-internal-api-key");
  if (internalApiKey !== process.env.INTERNAL_API_SECRET) {
    console.warn("Unauthorized attempt to access update-stats API.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, stats } = body;

    if (!email || !stats) {
      return NextResponse.json(
        { message: "Bad Request: Email and stats object are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the user first to calculate streaks
    const user = await User.findOne({ email: email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Calculate streak
    const today = new Date();
    const lastGame = user.lastGameDate;
    let newStreak = user.currentStreak;

    if (stats.won) {
      if (lastGame && isConsecutiveDay(lastGame, today)) {
        newStreak = user.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 0;
    }

    // Calculate difficulty-based increments
    const difficultyUpdates = {};
    if (stats.solvedProblems && stats.problemDifficulties) {
      stats.problemDifficulties.forEach((difficulty) => {
        switch (difficulty) {
          case "easy":
            difficultyUpdates.easyProblems =
              (difficultyUpdates.easyProblems || 0) + 1;
            break;
          case "medium":
            difficultyUpdates.mediumProblems =
              (difficultyUpdates.mediumProblems || 0) + 1;
            break;
          case "hard":
            difficultyUpdates.hardProblems =
              (difficultyUpdates.hardProblems || 0) + 1;
            break;
        }
      });
    }

    // Calculate new average score
    const newTotalScore = user.totalScore + (stats.score || 0);
    const newTotalGames = user.totalGames + 1;
    const newAverageScore = newTotalScore / newTotalGames;

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        $inc: {
          totalGames: 1, // Always increment total games when challenge ends
          winCount: stats.won ? 1 : 0,
          lossCount: !stats.won ? 1 : 0, // Only count as loss if someone actually won
          rating: stats.ratingChange || 0,
          totalSubmissions: stats.submissions || 0,
          acceptedSubmissions: stats.acceptedSubmissions || 0,
          totalScore: stats.score || 0,
          ...difficultyUpdates,
        },
        $addToSet: {
          solvedProblems: { $each: stats.solvedProblems || [] },
        },
        $set: {
          averageScore: newAverageScore,
          bestScore: Math.max(user.bestScore, stats.score || 0),
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          lastGameDate: today,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: false,
      }
    );

    console.log(`Successfully updated stats for user: ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User stats updated successfully.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/user/update-stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to check consecutive days
function isConsecutiveDay(lastDate, currentDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const timeDiff = currentDate.getTime() - lastDate.getTime();
  return timeDiff >= 0 && timeDiff <= oneDay;
}
