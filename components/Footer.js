"use client";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8 z-50 relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Codeion Logo"
            className="h-10 w-auto object-contain filter drop-shadow-md"
          />
          <span className="text-2xl font-semibold text-white tracking-tight">
            Codeion
          </span>
        </div>
        <p className="text-sm text-gray-300 italic">
          A personal project by{" "}
          <a
            href="https://portfolio-navy-eight-58.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-200 underline cursor-pointer transition-colors duration-200 z-50 relative"
            style={{ pointerEvents: "auto" }}
          >
            Vineet Kumar
          </a>
        </p>
      </div>
    </footer>
  );
}
