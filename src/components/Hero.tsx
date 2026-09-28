import React, { useState, useEffect } from 'react';
import { Play, Calendar, ShieldCheck, Ticket, Users } from 'lucide-react';

interface HeroProps {
  onOpenPortal: () => void;
  electionPhase: 'upcoming' | 'ongoing' | 'results';
  heroImagePath: string;
}

export default function Hero({ onOpenPortal, electionPhase, heroImagePath }: HeroProps) {
  const [electionConfig, setElectionConfig] = useState<any>(null);

  // Sync active election configurations on mount
  useEffect(() => {
    fetch('/api/election-config')
      .then(res => res.json())
      .then(data => {
        if (data.election) {
          setElectionConfig(data.election);
        }
      })
      .catch(err => console.warn('Failed to load active schedule into public Hero:', err));
  }, [electionPhase]);

  return (
    <div className="relative bg-stone-900 overflow-hidden min-h-[500px] flex items-center border-b border-stone-850">
      
      {/* Visual background element */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImagePath}
          alt="Govt. Pragjyotish College Campus"
          className="w-full h-full object-cover opacity-20 filter blur-xs"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        
        {/* Left Column: Heading and info */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wider uppercase font-sans">
              PGSU Returning Board Node
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {electionConfig ? electionConfig.title : 'PGSU Union Executive Election'}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
            {electionConfig 
              ? electionConfig.description
              : 'Shaping the collective mandate of Govt. Pragjyotish College. Sign in to your authorized secure student terminal to cast your secret electronic ballot.'
            }
          </p>

          {/* Quick Stats list */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm text-stone-300 font-sans">
            <div className="flex items-center gap-1.5 bg-stone-900/60 px-3.5 py-1.5 rounded-lg border border-stone-800">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Year: {electionConfig ? electionConfig.year : '2026-27'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-900/60 px-3.5 py-1.5 rounded-lg border border-stone-800">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Semesters: {electionConfig ? electionConfig.eligibleSemesters?.join(', ') : 'All'}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onOpenPortal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="h-4 w-4" />
              <span>Open Student Terminal</span>
            </button>
            <a
              href="#candidates"
              className="border border-stone-700 hover:border-stone-500 bg-stone-950/45 text-stone-200 font-semibold py-3 px-6 rounded-lg text-sm text-center transition-all flex items-center justify-center gap-2"
            >
              <span>Meet the Nominees</span>
            </a>
          </div>

        </div>

        {/* Right Column: Dynamic calendar card */}
        <div className="lg:col-span-5">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-600/10 blur-xl" />
            
            <div className="flex justify-between items-center border-b border-stone-850 pb-4">
              <span className="text-xs font-bold text-stone-400 uppercase font-sans">Electoral Schedule</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-sm font-sans font-bold text-[10px] uppercase tracking-wider ${
                electionPhase === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                electionPhase === 'ongoing' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {electionPhase === 'ongoing' ? 'Voting Live' : electionPhase}
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-sans">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-stone-300">Polling Start Date & Time</span>
                  <span className="block text-stone-400 font-mono text-xs mt-0.5">
                    {electionConfig 
                      ? new Date(electionConfig.startDate).toLocaleString()
                      : 'Monday, October 12, 2026 @ 09:00 AM IST'
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-stone-300">Polling Closure Date & Time</span>
                  <span className="block text-stone-400 font-mono text-xs mt-0.5">
                    {electionConfig 
                      ? new Date(electionConfig.endDate).toLocaleString()
                      : 'Monday, October 12, 2026 @ 05:00 PM IST'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-850 pt-4 text-center text-[10px] text-stone-500 uppercase tracking-widest font-sans font-medium">
              Lyngdoh Scrutiny Committee Audited
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Importing Clock to prevent compiling error
import { Clock } from 'lucide-react';
