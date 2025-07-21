// pages/profile/[userId].js or app/profile/[userId]/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // or 'next/navigation' for App Router
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
export async function GET(request, { params }) {
  try {
    const { userId } = params;

    await connectToDatabase();

    const user = await User.findById(userId, {
      // Exclude sensitive fields for public view
      password: 0,
      email: 0,
      providerId: 0,
      currentRoomId: 0,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile is public
    if (user.profileVisibility === "private") {
      return NextResponse.json(
        { error: "Profile is private" },
        { status: 403 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export default function PublicProfilePage({ userProfile, error }) {
  const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Not Found
          </h1>
          <p className="mt-2 text-gray-600">
            The requested profile does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Public Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={userProfile.image || "/default-avatar.png"}
              alt={userProfile.name}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile.name}
              </h1>
              <p className="text-gray-600">
                {userProfile.bio || "No bio provided"}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {userProfile.githubLink && (
                  <a
                    href={userProfile.githubLink}
                    className="text-blue-600 hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {userProfile.linkedinLink && (
                  <a
                    href={userProfile.linkedinLink}
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Public Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Game Stats</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Games:</span>
                <span className="font-semibold">{userProfile.totalGames}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="font-semibold text-green-600">
                  {userProfile.winCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-semibold">
                  {userProfile.totalGames > 0
                    ? Math.round(
                        (userProfile.winCount / userProfile.totalGames) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Problems Solved
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Easy:</span>
                <span className="font-semibold text-green-600">
                  {userProfile.easyProblems}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Medium:</span>
                <span className="font-semibold text-yellow-600">
                  {userProfile.mediumProblems}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hard:</span>
                <span className="font-semibold text-red-600">
                  {userProfile.hardProblems}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Rating:</span>
                <span className="font-semibold">{userProfile.rating}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-semibold">{userProfile.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Streak:</span>
                <span className="font-semibold">
                  {userProfile.currentStreak}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { userId } = context.params;

  try {
    await connectToDatabase();

    const user = await User.findById(userId, {
      // Exclude sensitive information
      password: 0,
      email: 0,
      providerId: 0,
      currentRoomId: 0,
    }).lean();

    if (!user) {
      return {
        props: {
          error: "Profile not found",
        },
      };
    }

    return {
      props: {
        userProfile: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return {
      props: {
        error: "Failed to load profile",
      },
    };
  }
}
