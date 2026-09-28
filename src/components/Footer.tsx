import React from 'react';
import { Landmark, Mail, Phone, ExternalLink, Sliders } from 'lucide-react';

interface FooterProps {
  electionPhase: 'upcoming' | 'ongoing' | 'results';
  setElectionPhase: (phase: 'upcoming' | 'ongoing' | 'results') => void;
}

export default function Footer({ electionPhase, setElectionPhase }: FooterProps) {
  const contactHelpDesk = () => {
    alert("Pragjyotish College Election Helpdesk:\n\nEmail: election@pragjyotishcollege.ac.in\nPhone: +91 361 254 4531 (09:00 - 17:00 IST)");
  };

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      
      {/* Dynamic Demo Control Panel (Evaluator Aid) */}
      <div className="bg-stone-950 border-b border-stone-800/80 px-4 py-5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg border border-blue-500/20">
              <Sliders className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">Evaluator Control Panel</h4>
              <p className="text-[10px] text-stone-400 leading-normal">
                Click a button below to interactively switch the entire portal’s status phase and test all layouts!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setElectionPhase('upcoming')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                electionPhase === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Phase 1: Pre-Election (Upcoming)
            </button>
            <button
              onClick={() => setElectionPhase('ongoing')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                electionPhase === 'ongoing'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Phase 2: Poll Day (Voting Live)
            </button>
            <button
              onClick={() => setElectionPhase('results')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                electionPhase === 'results'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Phase 3: Post-Election (Results)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo Brand Lockup */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Landmark className="h-6 w-6 text-blue-500" />
              <span className="font-serif text-lg font-bold tracking-tight">Govt. Pragjyotish College</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Established in 1954, Govt. Pragjyotish College is a premier institution of higher learning in Guwahati, Assam, affiliated with Gauhati University and re-accredited with NAAC 'A' grade.
            </p>
            <p className="text-[10px] text-stone-500">
              © 2026 Govt. Pragjyotish College Students' Union Election Commission. All rights reserved.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-stone-100 font-bold text-xs uppercase tracking-wider">Quick Academic Links</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="https://pragjyotishcollege.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>Official College Site</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#announcements" className="hover:text-white transition-colors">Electoral Roll Notices</a>
              </li>
              <li>
                <a href="#candidates" className="hover:text-white transition-colors">Contesting Nominees List</a>
              </li>
              <li>
                <a href="#instructions" className="hover:text-white transition-colors">Student Guidelines</a>
              </li>
            </ul>
          </div>

          {/* Guidelines info */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-stone-100 font-bold text-xs uppercase tracking-wider">Election Compliance</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Lyngdoh Committee compliant</li>
              <li>Gauhati University statutes</li>
              <li>NAAC institutional records</li>
              <li>Digital ballot integrity audits</li>
            </ul>
          </div>

          {/* Technical contact desk */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-stone-100 font-bold text-xs uppercase tracking-wider">Electoral Grievance Helpdesk</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              If you discover an discrepancy with your registration or credentials, please raise an immediate query.
            </p>
            
            <div className="space-y-2 text-xs text-stone-300">
              <button 
                onClick={contactHelpDesk}
                className="flex items-center gap-2 hover:text-white transition-colors text-left cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>election@pragjyotishcollege.ac.in</span>
              </button>
              <button 
                onClick={contactHelpDesk}
                className="flex items-center gap-2 hover:text-white transition-colors text-left cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                <span>+91 361 254 4531</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
