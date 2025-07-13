import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose"; // Your DB connection utility
import User from "@/models/User"; // Your User Mongoose model

/**
 * API Route to update user game statistics after a challenge.
 * This endpoint is intended to be called by the secure backend service.
 *
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} The response object.
 */
export async function POST(request) {
  // 1. Security Check: Verify the internal API key
  // This ensures that only your trusted backend service can call this endpoint.
  const internalApiKey = request.headers.get("x-internal-api-key");
  if (internalApiKey !== process.env.INTERNAL_API_SECRET) {
    console.warn("Unauthorized attempt to access update-stats API.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Parse and Validate Incoming Data
    const body = await request.json();
    const { email, stats } = body;

    // Check for required fields in the payload
    if (!email || !stats) {
      return NextResponse.json(
        { message: "Bad Request: Email and stats object are required." },
        { status: 400 }
      );
    }

    // 3. Connect to the Database
    await connectToDatabase();

    // 4. Find the user and update their stats atomically
    // We use findOneAndUpdate to ensure the find and update operations are a single, atomic transaction.
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Find the user by their unique email
      {
        // Use the $inc operator to increment numerical fields.
        // This prevents race conditions and ensures accurate counting.
        $inc: {
          totalGames: 1, // Always increment the total games played
          winCount: stats.won ? 1 : 0, // Increment winCount only if the user won
          rating: stats.ratingChange || 0, // Apply the rating change (can be positive or negative)
        },
        // Use the $addToSet operator with $each to add new solved problem IDs.
        // $addToSet ensures no duplicate problem IDs are added to the array.
        $addToSet: {
          solvedProblems: { $each: stats.solvedProblems || [] },
        },
        // Also, update the 'updatedAt' timestamp to reflect this recent activity.
        $set: {
          updatedAt: new Date(),
        },
      },
      {
        new: true, // Return the modified document rather than the original
        upsert: false, // Do not create a new user if one isn't found
      }
    );

    // 5. Handle User Not Found
    if (!updatedUser) {
      console.log(`User with email ${email} not found for stat update.`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log(`Successfully updated stats for user: ${email}`);

    // 6. Return Success Response
    return NextResponse.json(
      {
        success: true,
        message: "User stats updated successfully.",
        user: updatedUser, // Return the updated user profile
      },
      { status: 200 }
    );
  } catch (error) {
    // 7. Handle Server Errors
    console.error("Error in /api/user/update-stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
