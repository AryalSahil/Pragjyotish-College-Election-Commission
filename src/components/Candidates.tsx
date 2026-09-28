import React, { useState, useEffect } from 'react';
import { Award, Users, Search, X, Check, BookOpen, ShieldAlert } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: 'President' | 'Vice President' | 'General Secretary' | 'Assistant General Secretary';
  party: string;
  rollNo?: string;
  enrollmentId: string;
  image: string;
  motto: string;
  department: string;
  agenda: string[];
  bio: string;
  approved: boolean;
  published: boolean;
  withdrawn: boolean;
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<'All' | 'President' | 'Vice President' | 'General Secretary' | 'Assistant General Secretary'>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Real-time server state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync approved and published candidates list from official API
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error('Failed to load published candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const positions = ['All', 'President', 'Vice President', 'General Secretary', 'Assistant General Secretary'] as const;

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || cand.party.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'All' || cand.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <section id="candidates" className="py-12 bg-stone-50 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Users className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wider uppercase font-sans">NOMINATED CONTESTANTS</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Meet the Candidates
            </h2>
            <p className="text-stone-500 text-xs">
              Review certified portfolios, educational backgrounds, and core manifestos to cast an informed ballot.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or alliance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Controls (Segmented Tabs / Functional Buttons) */}
        <div className="flex flex-wrap gap-1.5 mb-8 p-1 bg-stone-200/50 rounded-lg max-w-fit">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPosition(pos)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                filterPosition === pos
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-xs text-stone-500 mt-2 font-medium">Synchronizing contesting nominees...</p>
          </div>
        ) : (
          /* Candidates Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCandidates.map((cand) => (
              <div 
                key={cand.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={cand.image}
                      alt={cand.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[10px] tracking-wider uppercase font-semibold text-blue-200">
                      {cand.party}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
                      {cand.position}
                    </div>
                    
                    <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug">
                      {cand.name}
                    </h3>

                    <p className="text-stone-500 text-xs font-sans">
                      {cand.department} · {cand.enrollmentId}
                    </p>

                    <p className="text-stone-600 text-xs italic leading-relaxed line-clamp-2 pt-1 border-t border-stone-100">
                      "{cand.motto}"
                    </p>
                  </div>
                </div>

                {/* Action Button: Bio & Agenda Modal Link */}
                <div className="px-5 pb-5 pt-1">
                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="w-full flex items-center justify-center gap-1.5 border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-stone-500" />
                    <span>View Full Manifesto</span>
                  </button>
                </div>

              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
                <ShieldAlert className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-serif text-sm">No contesting candidates matched your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Interactive Candidate Manifesto Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setSelectedCandidate(null)} />
            
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-100 transform transition-all text-left">
                
                {/* Header Lockup */}
                <div className="relative h-48 bg-stone-950 overflow-hidden">
                  <img
                    src={selectedCandidate.image}
                    alt={selectedCandidate.name}
                    className="w-full h-full object-cover object-top opacity-50 filter blur-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
                  
                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="absolute right-4 top-4 p-1.5 rounded-lg bg-stone-900/55 text-stone-300 hover:bg-stone-800 hover:text-white transition-all cursor-pointer"
                    aria-label="Close manifesto modal"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between text-white">
                    <div className="space-y-1.5">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-blue-300">
                        {selectedCandidate.position} CANDIDATE
                      </span>
                      <h3 className="font-serif text-3xl font-bold leading-tight">
                        {selectedCandidate.name}
                      </h3>
                      <p className="text-stone-300 text-xs">
                        {selectedCandidate.department} · {selectedCandidate.enrollmentId}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wider bg-blue-600 px-3 py-1 rounded-sm font-semibold text-stone-100">
                      {selectedCandidate.party}
                    </span>
                  </div>
                </div>

                {/* Modal Body with 2 Columns or structured sections */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Motto & Commitment</h4>
                    <p className="text-stone-800 font-serif text-base italic leading-relaxed bg-stone-50 p-4 border-l-4 border-blue-600 rounded-r-lg">
                      "{selectedCandidate.motto}"
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Candidate Biography</h4>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      {selectedCandidate.bio}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span>Key Agenda Points (Manifesto)</span>
                    </h4>
                    
                    <ul className="space-y-2">
                      {selectedCandidate.agenda && selectedCandidate.agenda.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 shrink-0 mt-0.5 border border-emerald-100">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="leading-normal">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer close option */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium py-1.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Close Manifesto
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
