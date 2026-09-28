import React from 'react';
import { Landmark, ShieldAlert, KeyRound } from 'lucide-react';

interface HeaderProps {
  onOpenPortal: () => void;
  onOpenAdmin: () => void;
  electionPhase: 'upcoming' | 'ongoing' | 'results';
}

export default function Header({ onOpenPortal, onOpenAdmin, electionPhase }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <a href="/" className="font-serif text-base font-bold tracking-tight text-stone-900 leading-tight">
                Pragjyotish College
              </a>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans font-medium">
                Election Commission
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#announcements" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Announcements
            </a>
            <a href="#instructions" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Instructions
            </a>
            <a href="#candidates" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Candidates
            </a>
            <a href="#results" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Results
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            {electionPhase === 'ongoing' && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-100 text-rose-700 animate-pulse">
                <ShieldAlert className="h-3 w-3" />
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase">VOTING IS LIVE</span>
              </div>
            )}
            
            {/* Admin Terminal Button */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-950 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5 text-stone-400" />
              <span>Admin</span>
            </button>

            <button
              onClick={onOpenPortal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Student Portal
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
