import React from 'react';
import { Award, Lock, HelpCircle, BarChart3, CheckCircle2, RefreshCw } from 'lucide-react';

interface ResultsProps {
  electionPhase: 'upcoming' | 'ongoing' | 'results';
  votedCandidateName: string | null;
}

export default function Results({ electionPhase, votedCandidateName }: ResultsProps) {
  // Mock results data
  const turnoutData = {
    totalEligible: 4500,
    totalVoted: 3824,
    turnoutPercent: 84.97,
    invalidBallots: 12
  };

  const resultsData = [
    {
      position: 'President',
      candidates: [
        { name: 'Abhinav Borah', party: 'Students Solidarity Front (SSF)', votes: 2154, percent: 56.5, status: 'Winner' },
        { name: 'Sanjana Phukan', party: 'Progressive Students Coalition (PSC)', votes: 1658, percent: 43.5, status: 'Contestant' }
      ]
    },
    {
      position: 'General Secretary',
      candidates: [
        { name: 'Priya Kalita', party: 'Students Solidarity Front (SSF)', votes: 2310, percent: 60.6, status: 'Winner' },
        { name: 'Partha Pratim Sarma', party: 'Progressive Students Coalition (PSC)', votes: 1502, percent: 39.4, status: 'Contestant' }
      ]
    }
  ];

  return (
    <section id="results" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-blue-600">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider uppercase font-sans">ELECTION RETURNS</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Official Election Results
          </h2>
          <p className="text-stone-500 text-sm">
            Tally certification audited and authenticated by the Govt. Pragjyotish College Electoral Council.
          </p>
        </div>

        {/* Phase-Dependent UI Content */}
        {electionPhase !== 'results' ? (
          
          /* Phase: Locked or Polling Ongoing */
          <div className="max-w-3xl mx-auto rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-stone-200/60 text-stone-500 flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900">Official Results are Currently Locked</h3>
              <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                {electionPhase === 'upcoming' && 'Voting has not commenced yet. The ballot boxes will open on October 12, 2026. Tallies will be published instantly upon official scrutiny completion.'}
                {electionPhase === 'ongoing' && 'Voting is actively in progress. Complete audit validation and final counts will begin after polling closes at 04:00 PM IST on October 12, 2026.'}
              </p>
            </div>

            {votedCandidateName && electionPhase === 'ongoing' && (
              <div className="max-w-md mx-auto p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>You successfully cast a live test ballot for <strong className="font-semibold text-blue-900">{votedCandidateName}</strong> inside the Student Portal. Your vote is recorded!</span>
              </div>
            )}

            <div className="pt-3 max-w-md mx-auto grid grid-cols-2 gap-4 text-left border-t border-stone-200/80">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-500">PROPOSED RESULTS TIME</span>
                <p className="text-xs font-semibold text-stone-900">Oct 12, 2026 · 19:00 IST</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-500">AUDITOR AUDIT STAMP</span>
                <p className="text-xs font-semibold text-stone-900">Electoral Council Certified</p>
              </div>
            </div>
          </div>

        ) : (
          
          /* Phase: Results Published (Unlocked!) */
          <div className="space-y-8 animate-fadeIn">
            
            {/* General Tally Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">REGISTERED ELECTORS</span>
                <span className="font-mono text-2xl font-bold text-stone-950 tabular-nums">4,500</span>
                <span className="text-[11px] text-stone-500 block mt-1">Full-time eligible students</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">TOTAL BALLOTS CAST</span>
                <span className="font-mono text-2xl font-bold text-stone-950 tabular-nums">3,824</span>
                <span className="text-[11px] text-stone-500 block mt-1">Both paper & digital modes</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">POLL PERCENTAGE</span>
                <span className="font-mono text-2xl font-bold text-blue-600 tabular-nums">84.97%</span>
                <span className="text-[11px] text-stone-500 block mt-1">Outstanding overall turnout</span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">INVALIDATED BALLOTS</span>
                <span className="font-mono text-2xl font-bold text-stone-900 tabular-nums">12</span>
                <span className="text-[11px] text-stone-500 block mt-1">Duplicate attempts / errors</span>
              </div>

            </div>

            {/* Candidate Vote Returns Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {resultsData.map((posBlock, idx) => (
                <div 
                  key={idx}
                  className="bg-stone-50/50 border border-stone-200 rounded-xl p-6 shadow-xs space-y-5"
                >
                  <div className="flex justify-between items-center border-b border-stone-200/80 pb-3">
                    <h3 className="font-serif text-lg font-bold text-stone-900">{posBlock.position} Results</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">CERTIFIED TALLY</span>
                  </div>

                  <div className="space-y-4">
                    {posBlock.candidates.map((cand, candIdx) => (
                      <div key={candIdx} className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <div>
                            <span className="font-semibold text-stone-900">{cand.name}</span>
                            <span className="text-[10px] text-stone-500 block">{cand.party}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-stone-950 tabular-nums">{cand.votes.toLocaleString()} votes</span>
                            <span className="text-[10px] text-stone-500 block font-mono font-medium">{cand.percent}%</span>
                          </div>
                        </div>

                        {/* Beautiful Visual Percentage Bar */}
                        <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              cand.status === 'Winner' ? 'bg-blue-600' : 'bg-stone-400'
                            }`}
                            style={{ width: `${cand.percent}%` }}
                          />
                        </div>

                        {cand.status === 'Winner' && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm font-semibold tracking-wider uppercase">
                            <Award className="h-3 w-3" />
                            <span>Winner Declared</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Audit compliance message */}
            <div className="max-w-3xl mx-auto text-center p-4 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-500 leading-relaxed">
                Tally integrity hash code verification matches physical ballot audits: <code className="bg-stone-200 px-1 py-0.5 rounded font-mono text-stone-800 text-[10px]">sha256-4b2a89c9e01ff45a</code>. 
                <br />
                Signed: Prof. J. K. Goswami, Principal and Returning Officer, Govt. Pragjyotish College.
              </p>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
