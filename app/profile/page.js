"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Trophy,
  Target,
  BarChart3,
  Edit,
  Save,
  X,
  Github,
  Linkedin,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Brain,
  Code2,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    githubLink: "",
    linkedinLink: "",
    preferredTopics: [],
    preferredDifficulty: "medium",
  });

  const topicOptions = [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
    "Sorting",
    "Searching",
    "Hash Tables",
    "Stacks",
    "Queues",
    "Heaps",
  ];

  const difficultyOptions = ["easy", "medium", "hard"];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setEditForm({
          bio: profile.bio || "",
          githubLink: profile.githubLink || "",
          linkedinLink: profile.linkedinLink || "",
          preferredTopics: profile.preferredTopics || [],
          preferredDifficulty: profile.preferredDifficulty || "medium",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
        // Update the session with new data
        await update();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTopicToggle = (topic) => {
    setEditForm((prev) => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter((t) => t !== topic)
        : [...prev.preferredTopics, topic],
    }));
  };

  const calculateWinRate = () => {
    if (!userProfile || userProfile.totalGames === 0) return 0;
    return Math.round((userProfile.winCount / userProfile.totalGames) * 100);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <p className="text-gray-400 mb-4">{userProfile.email}</p>

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

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500/20 rounded-lg p-2">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Rating</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {userProfile.rating}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {getRatingLevel(userProfile.rating)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-500/20 rounded-lg p-2">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Win Rate</h3>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {calculateWinRate()}%
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {userProfile.winCount} wins
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-500/20 rounded-lg p-2">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Total Games</h3>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {userProfile.totalGames}
            </div>
            <p className="text-sm text-gray-400 mt-1">Games played</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl border border-orange-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500/20 rounded-lg p-2">
                <Brain className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Problems Solved
              </h3>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {userProfile.solvedProblems?.length || 0}
            </div>
            <p className="text-sm text-gray-400 mt-1">Unique problems</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Link
                    </label>
                    <input
                      type="url"
                      value={editForm.githubLink}
                      onChange={(e) =>
                        setEditForm({ ...editForm, githubLink: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LinkedIn Link
                    </label>
                    <input
                      type="url"
                      value={editForm.linkedinLink}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          linkedinLink: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Difficulty
                    </label>
                    <select
                      value={editForm.preferredDifficulty}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          preferredDifficulty: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {difficultyOptions.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Bio
                    </h3>
                    <p className="text-white">
                      {userProfile.bio || "No bio provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Preferred Difficulty
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/20">
                      {userProfile.preferredDifficulty
                        ?.charAt(0)
                        .toUpperCase() +
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
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Preferred Topics
              </h2>

              {isEditing ? (
                <div className="space-y-3">
                  {topicOptions.map((topic) => (
                    <label
                      key={topic}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.preferredTopics.includes(topic)}
                        onChange={() => handleTopicToggle(topic)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-white text-sm">{topic}</span>
                    </label>
                  ))}
                </div>
              ) : (
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
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {userProfile.currentRoomId && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-green-400 text-sm font-medium">
                        Currently in game
                      </p>
                      <p className="text-gray-400 text-xs">
                        Room: {userProfile.currentRoomId}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-gray-400 text-sm">
                  <p>
                    Last updated:{" "}
                    {new Date(userProfile.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
