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

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        $inc: {
          totalGames: 1,
          winCount: stats.won ? 1 : 0,
          rating: stats.ratingChange || 0,
        },

        $addToSet: {
          solvedProblems: { $each: stats.solvedProblems || [] },
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: false,
      }
    );

    if (!updatedUser) {
      console.log(`User with email ${email} not found for stat update.`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

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
