"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  User,
  Trophy,
  Target,
  Github,
  Linkedin,
  Star,
  TrendingUp,
  Code2,
  ArrowLeft,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";

export default function PublicProfilePage() {
  const params = useParams();
  const { userId } = params;
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`/api/user/public/${userId}`);
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      } else if (response.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching public profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 1800) return "text-red-400";
    if (rating >= 1600) return "text-orange-400";
    if (rating >= 1400) return "text-yellow-400";
    if (rating >= 1200) return "text-green-400";
    return "text-blue-400";
  };

  const getRatingLevel = (rating) => {
    if (rating >= 1800) return "Expert";
    if (rating >= 1600) return "Advanced";
    if (rating >= 1400) return "Intermediate";
    if (rating >= 1200) return "Beginner";
    return "Novice";
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${userProfile._id}`;
    navigator.clipboard.writeText(profileUrl);
    setShowShareDialog(true);
    setTimeout(() => setShowShareDialog(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error}</div>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Share */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={userProfile.image || "/default-avatar.png"}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full border-4 border-gray-700"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {userProfile.name}
                </h1>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(
                    userProfile.rating
                  )} bg-gray-800/50`}
                >
                  {getRatingLevel(userProfile.rating)}
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <p className="text-gray-300 mb-4">{userProfile.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex gap-4">
                {userProfile.githubLink && (
                  <a
                    href={userProfile.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {userProfile.linkedinLink && (
                  <a
                    href={userProfile.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Performance Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-yellow-400 w-6 h-6" />
              <span className="text-sm text-gray-400">Performance</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {userProfile.winRate}%
              </div>
              <div className="text-sm text-gray-300">
                {userProfile.winCount}W / {userProfile.lossCount}L
              </div>
              <div className="text-xs text-gray-500">
                from {userProfile.totalGames} games
              </div>
            </div>
          </div>

          {/* Problems Solved */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Code2 className="text-green-400 w-6 h-6" />
              <span className="text-sm text-gray-400">Problems Solved</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {userProfile.totalProblemsolved}
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-green-400">
                  {userProfile.easyProblems}E
                </span>{" "}
                /
                <span className="text-yellow-400">
                  {userProfile.mediumProblems}M
                </span>{" "}
                /
                <span className="text-red-400">
                  {userProfile.hardProblems}H
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {userProfile.acceptanceRate}% acceptance rate
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Star className="text-purple-400 w-6 h-6" />
              <span className="text-sm text-gray-400">Rating</span>
            </div>
            <div className="space-y-2">
              <div
                className={`text-2xl font-bold ${getRatingColor(
                  userProfile.rating
                )}`}
              >
                {userProfile.rating}
              </div>
              <div className="text-sm text-gray-300">
                {getRatingLevel(userProfile.rating)}
              </div>
              <div className="text-xs text-gray-500">
                Avg Score: {Math.round(userProfile.averageScore)}
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-orange-400 w-6 h-6" />
              <span className="text-sm text-gray-400">Streak</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {userProfile.currentStreak}
              </div>
              <div className="text-sm text-gray-300">Current Win Streak</div>
              <div className="text-xs text-gray-500">
                Best: {userProfile.longestStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Preferred Difficulty
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20">
                    {userProfile.preferredDifficulty?.charAt(0).toUpperCase() +
                      userProfile.preferredDifficulty?.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Member Since
                  </h3>
                  <p className="text-white">
                    {new Date(userProfile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Topics */}
          <div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Preferred Topics
              </h2>

              <div className="flex flex-wrap gap-2">
                {userProfile.preferredTopics?.length > 0 ? (
                  userProfile.preferredTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/20"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No preferred topics selected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-400" />
                Profile Link Copied!
              </h2>
              <button
                onClick={() => setShowShareDialog(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Your profile link is ready to share with others.
            </p>

            <div className="bg-gray-800 text-sm text-green-400 px-4 py-2 rounded-lg font-mono truncate border border-gray-700 mb-4">
              {`${window.location.origin}/profile/${userProfile._id}`}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowShareDialog(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
