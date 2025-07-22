"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Play,
  Zap,
  ArrowRight,
  MessageSquare,
  Trophy,
  Target,
  BarChart3,
  Shield,
  Star,
  Crown,
  Clock,
  Globe,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState("collaboration");

  const router = useRouter();

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "Code together with your teammates. See code, selections, and changes in real-time.",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Integrated Chat",
      description:
        "Built-in text chat. Discuss code without leaving your workspace.",
      gradient: "from-green-500 to-emerald-400",
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Universal Compiler",
      description:
        "Execute code instantly. No setup required, just code and run.",
      gradient: "from-purple-500 to-pink-400",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Challenge Battles",
      description:
        "AI-generated DSA problems. Compete in real-time with live leaderboards.",
      gradient: "from-yellow-500 to-orange-400",
    },

    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description:
        "Detailed stats, performance insights, badges, levels, and achievement tracking.",
      gradient: "from-pink-500 to-red-400",
    },
  ];

  const languages = [
    { name: "JavaScript", popularity: 95 },
    { name: "Python", popularity: 92 },
    { name: "C++", popularity: 85 },
    { name: "C", popularity: 80 },
    { name: "C#", popularity: 72 },
    { name: "PHP", popularity: 68 },
    { name: "Go", popularity: 78 },
    { name: "Java", popularity: 88 },
    { name: "SQL", popularity: 75 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-8">
              <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm font-medium">
                Now with AI-Powered Challenges
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
              Code
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Compete
              </span>
              <span className="block text-5xl md:text-7xl">Conquer</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The ultimate collaborative coding platform where developers{" "}
              <span className="text-blue-400 font-semibold">code together</span>
              ,
              <span className="text-purple-400 font-semibold">
                {" "}
                compete in challenges
              </span>
              , and
              <span className="text-pink-400 font-semibold">
                {" "}
                level up their skills
              </span>{" "}
              in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={() => {
                  router.push("/enter-room");
                }}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                <Users className="mr-3 w-6 h-6" />
                Create Room
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => {
                  router.push("/challenge-room");
                }}
                className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-10 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 flex items-center justify-center"
              >
                <Trophy className="mr-3 w-6 h-6" />
                Challenge Arena
                <Crown className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tabs */}
      <section className="py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Everything You Need</h2>
            <p className="text-2xl text-gray-300">
              From collaboration to competition
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["collaboration", "challenges", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                  activeFeature === index
                    ? `bg-gradient-to-br ${feature.gradient}/20 border-blue-500/50 shadow-2xl`
                    : "bg-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50"
                }`}
              >
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Code Editor Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="bg-gray-800/80 px-8 py-6 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-400 cursor-pointer transition-colors"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-400 cursor-pointer transition-colors"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-400 cursor-pointer transition-colors"></div>
                </div>
                <span className="text-gray-400 font-mono">
                  challenge_arena.js
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300 font-medium">
                    5 players online
                  </span>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer">
                  <Play className="w-4 h-4 inline mr-2" />
                  Execute
                </div>
              </div>
            </div>
            <div className="p-8 font-mono text-base">
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-10">1</span>
                  <span className="text-blue-400">
                    // AI Generated Challenge: Two Sum
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-10">2</span>
                  <span className="text-purple-400">function</span>
                  <span className="text-yellow-400 ml-2">twoSum</span>
                  <span className="text-white">(</span>
                  <span className="text-orange-400">nums</span>
                  <span className="text-white">, </span>
                  <span className="text-orange-400">target</span>
                  <span className="text-white">) </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-10">3</span>
                  <span className="ml-6 text-purple-400">const</span>
                  <span className="text-blue-400 ml-2">map</span>
                  <span className="text-white"> = </span>
                  <span className="text-purple-400">new</span>
                  <span className="text-blue-400 ml-2">Map</span>
                  <span className="text-white">();</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-10">4</span>
                  <span className="ml-6 text-purple-400">for</span>
                  <span className="text-white"> (</span>
                  <span className="text-purple-400">let</span>
                  <span className="text-orange-400 ml-2">i</span>
                  <span className="text-white">
                    {" "}
                    = 0; i &lt; nums.length; i++){" "}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-10">5</span>
                  <div className="flex items-center space-x-3 ml-6">
                    <div className="w-1 h-6 bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Live Leaderboard */}
              <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-bold">Live Leaderboard</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "CodeNinja", score: 2450, status: "Completed" },
                    { name: "AlgoMaster", score: 1980, status: "Testing..." },
                    { name: "You", score: 1850, status: "Coding..." },
                  ].map((player, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                            i === 0
                              ? "bg-yellow-500"
                              : i === 1
                              ? "bg-gray-400"
                              : "bg-orange-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span>{player.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-mono">
                          {player.score}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            player.status === "Completed"
                              ? "bg-green-600"
                              : player.status === "Testing..."
                              ? "bg-yellow-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {player.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Support with Progress Bars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6"> Languages Supported</h2>
          <p className="text-2xl text-gray-300 mb-16">
            Code, compile, and compete in any language
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((lang, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">{lang.name}</span>
                  <span className="text-blue-400 font-mono text-sm">
                    {lang.popularity}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 group-hover:from-blue-400 group-hover:to-purple-400"
                    style={{ width: `${lang.popularity}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile & Achievement Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Track Your Journey</h2>
            <p className="text-2xl text-gray-300">
              Comprehensive analytics and achievements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  JD
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold">John Developer</h3>
                  <p className="text-blue-400 font-semibold">
                    Algorithm Architect
                  </p>
                  <div className="flex items-center mt-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-yellow-500 font-semibold">
                      Level 47
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">100</div>
                  <div className="text-gray-400">Total games</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">89%</div>
                  <div className="text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">20</div>
                  <div className="text-gray-400">Win Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">23</div>
                  <div className="text-gray-400">Badges Earned</div>
                </div>
              </div>
            </div>

            {/* Achievement Showcase */}
            <div className="space-y-6">
              {[
                {
                  icon: Crown,
                  title: "Algorithm Master",
                  desc: "Solved 100 hard problems",
                  color: "text-yellow-500",
                },
                {
                  icon: Zap,
                  title: "Speed Demon",
                  desc: "Fastest solution in 10 challenges",
                  color: "text-blue-500",
                },
                {
                  icon: Users,
                  title: "Team Player",
                  desc: "Collaborated on 50+ projects",
                  color: "text-green-500",
                },
                {
                  icon: Target,
                  title: "Perfect Score",
                  desc: "Achieved 100% in 5 challenges",
                  color: "text-purple-500",
                },
              ].map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center ${achievement.color} mr-4`}
                    >
                      <achievement.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{achievement.title}</h4>
                      <p className="text-gray-400">{achievement.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl border border-blue-500/30 p-16">
            <h2 className="text-6xl font-bold mb-8">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dominate
              </span>
              ?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join the elite community of developers who code, compete, and
              conquer together
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => {
                  router.push("/challenge-room");
                }}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-6 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                Start challenge Now
                <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-12 text-gray-400">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Global Community</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
