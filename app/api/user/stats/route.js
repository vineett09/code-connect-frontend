import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route"; // Fixed import
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameResult, newRating, solvedProblem } = await request.json();

    await connectToDatabase();

    const updateData = {
      $inc: { totalGames: 1 },
      $set: { updatedAt: new Date() },
    };

    if (gameResult === "win") {
      updateData.$inc.winCount = 1;
    }

    if (newRating) {
      updateData.$set.rating = newRating;
    }

    if (solvedProblem) {
      updateData.$addToSet = { solvedProblems: solvedProblem };
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
