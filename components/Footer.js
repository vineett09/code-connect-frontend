"use-client";
import { Github, Twitter, Linkedin } from "lucide-react";
import { Code } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50 shadow-lg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white ">CodeConnect</span>
          </div>

          <div className="flex items-center space-x-6">
            <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 CodeSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
