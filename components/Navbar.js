"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  if (status === "loading") return <p>Loading...</p>;

  return (
    <nav className="flex justify-between p-4 bg-[#0d1117] text-white">
      <Link href="/">Home</Link>

      <div className="space-x-4">
        {session ? (
          <>
            <span>{session.user.name}</span>
            <button onClick={() => signOut()} className="hover:text-red-400">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="hover:text-green-400"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
