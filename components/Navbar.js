"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { UserCircle2, Code, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (status === "loading") return null;

  return (
    <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CodeConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Authentication Section */}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <UserCircle2 className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300 text-sm truncate max-w-[120px]">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-sm px-4 py-2 rounded-lg text-white transition-all "
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm px-6 py-2 rounded-lg text-white transition-all  flex items-center space-x-2"
              >
                <span>Login with Google</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800/95 backdrop-blur-md border-t border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Authentication Section */}
            <div className="border-t border-gray-700 pt-3 mt-3">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <UserCircle2 className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-lg text-sm text-white transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-sm text-white transition-all"
                >
                  Login with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
