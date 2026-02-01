"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl">
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-lg shadow-black/50">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/dark_wordmark.png"
            alt="Growdex"
            width={140}
            height={35}
            priority
            className="h-6 sm:h-8 w-auto cursor-pointer"
          />
        </Link>
        
        {/* Mobile: About and Fetch APY grouped on right */}
        <div className="flex sm:hidden items-center gap-2">
          <Link 
            href="/about"
            className="text-white text-sm font-medium hover:text-[#fe1f70] transition-colors"
          >
            About
          </Link>
          
          <Link href="/apy">
            <button className="px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20 whitespace-nowrap">
              Fetch APY
            </button>
          </Link>
        </div>

        {/* Desktop: About centered, Fetch APY on right */}
        <Link 
          href="/about"
          className="hidden sm:block text-white text-base font-medium hover:text-[#fe1f70] transition-colors absolute left-1/2 -translate-x-1/2"
        >
          About
        </Link>
        
        <Link href="/apy" className="hidden sm:block">
          <button className="px-6 py-2.5 bg-white/10 text-white text-base font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20 whitespace-nowrap">
            Fetch APY
          </button>
        </Link>
      </div>
    </nav>
  );
}
