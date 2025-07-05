"use client";

import React, { useState, useEffect } from "react";
import { Code, Users, Play, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description:
        "Code together with your team in real-time. See changes instantly as they happen.",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Multi-language Support",
      description:
        "Support for 20+ programming languages with syntax highlighting and IntelliSense.",
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Built-in Compiler",
      description:
        "Run and test your code instantly without leaving the editor.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Optimized for performance with minimal latency in collaborative editing.",
    },
  ];

  const languages = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "Go",
    "Rust",
    "TypeScript",
    "PHP",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Code Together,
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Build Better
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate collaborative code editor with real-time
              synchronization, built-in compiler, and support for 20+
              programming languages. Create rooms, invite teammates, and code
              together seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => {
                  router.push("/enter-room");
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform  flex items-center justify-center group"
              >
                Create Room
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300">
              Everything you need for collaborative coding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  activeFeature === index
                    ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50"
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Editor Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">main.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">3 online</span>
                </div>
                <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">
                  Run
                </button>
              </div>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-500 w-8">1</span>
                  <span className="text-purple-400">function</span>
                  <span className="text-blue-400 ml-2">fibonacci</span>
                  <span className="text-white">(</span>
                  <span className="text-orange-400">n</span>
                  <span className="text-white">) </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">2</span>
                  <span className="ml-4 text-purple-400">if</span>
                  <span className="text-white ml-2">(n &lt;= 1) </span>
                  <span className="text-purple-400">return</span>
                  <span className="text-orange-400 ml-2">n</span>
                  <span className="text-white">;</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">3</span>
                  <span className="ml-4 text-purple-400">return</span>
                  <span className="text-blue-400 ml-2">fibonacci</span>
                  <span className="text-white">(n - 1) + </span>
                  <span className="text-blue-400">fibonacci</span>
                  <span className="text-white">(n - 2);</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">4</span>
                  <span className="text-white"></span>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-gray-500 w-8">5</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-4 bg-blue-500 animate-pulse"></div>
                    <span className="text-gray-400 text-xs">
                      User typing...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Support */}
      <section
        id="languages"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">20+ Languages Supported</h2>
          <p className="text-xl text-gray-300 mb-12">
            Code in your favorite programming language
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {languages.map((lang, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 px-6 py-3 rounded-full hover:border-blue-500 transition-colors"
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Coding Together?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already collaborating on
            CodeSync
          </p>
          <button
            onClick={() => {
              router.push("/enter-room");
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all "
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
