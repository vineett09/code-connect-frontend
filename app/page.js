"use client";

import React, { useState, useEffect } from "react";
import {
  Code,
  Users,
  Zap,
  Globe,
  Play,
  ChevronRight,
  Github,
  Twitter,
} from "lucide-react";
import Link from "next/link";
export default function Homepage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "Code together with your team in real-time. See changes as they happen with live cursors and selections.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Instant Room Creation",
      description:
        "Create or join coding rooms instantly. Share a simple room code and start collaborating immediately.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Built with Next.js for optimal performance. Zero-latency typing with advanced conflict resolution.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cross-platform",
      description:
        "Works seamlessly across all devices and browsers. Code from anywhere, anytime.",
    },
  ];

  const codeExamples = [
    {
      lang: "JavaScript",
      code: `function collaborate() {
  const room = createRoom();
  const users = joinRoom(room.id);
  
  users.forEach(user => {
    user.onCodeChange(sync);
  });
}`,
    },
    {
      lang: "Python",
      code: `def real_time_sync():
    room = Room.create()
    
    @room.on_change
    def handle_change(delta):
        broadcast(delta)
        
    return room.join_url`,
    },
    {
      lang: "TypeScript",
      code: `interface CollabRoom {
  id: string;
  users: User[];
  code: string;
}

const createRoom = (): CollabRoom => {
  return new Room({ realTime: true });
}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-ping" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
            Code Together,
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Build Faster
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The ultimate real-time collaborative coding platform. Create rooms,
            invite teammates, and write code together with zero latency
            synchronization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/enter-room"
              className="group bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="flex items-center">
                Start Coding Now
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <button className="group flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Live Demo Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 border-b border-white/10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-400">
                  Room: #dev-team-alpha
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-slate-800"></div>
                    <div className="w-6 h-6 bg-cyan-500 rounded-full border-2 border-slate-800"></div>
                    <div className="w-6 h-6 bg-pink-500 rounded-full border-2 border-slate-800"></div>
                  </div>
                  <span className="text-sm text-gray-400">3 online</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex space-x-4 mb-4">
                  {codeExamples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        activeTab === index
                          ? "bg-purple-500 text-white"
                          : "bg-slate-700/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      {example.lang}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-left">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    <code>{codeExamples[activeTab].code}</code>
                  </pre>
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-400">
                        Alex is typing...
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">
                        Sarah saved changes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Powerful Features
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-purple-400 mb-4 group-hover:text-cyan-400 transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">50K+</div>
              <div className="text-gray-300">Active Developers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cyan-400">1M+</div>
              <div className="text-gray-300">Lines of Code</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pink-400">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who are already coding collaboratively.
            Start your first room in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              Create Your First Room
            </button>
            <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">CodeSync</span>
              </div>
              <p className="text-gray-400">
                The future of collaborative coding.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold">Product</h5>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Documentation</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold">Company</h5>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold">Connect</h5>
              <div className="flex space-x-4">
                <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 CodeSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
