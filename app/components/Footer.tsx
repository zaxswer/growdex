"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1">
            <Image
              src="/dark_wordmark.png"
              alt="Growdex"
              width={140}
              height={35}
              className="h-8 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              Real-time Aave data for smarter crypto trading decisions.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Pages</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-[#fe1f70] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#fe1f70] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/apy" className="hover:text-[#fe1f70] transition-colors">
                  Fetch APY
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Credits</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Developed by{" "}
              <a
                href="https://expose.software"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fe1f70] hover:text-[#ff3d87] transition-colors font-medium"
              >
                EXPOSE
              </a>
              <br />
              for MERGE CONFLICT by .mdg
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Growdex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
