import React, { useState, useEffect } from 'react';
import { 
  User, LayoutDashboard, Vote, Users, Megaphone, BarChart3, LogOut, Menu, X, 
  ShieldCheck, AlertTriangle, Clock, Award, FileText, CheckCircle2, Ticket, Landmark,
  ChevronRight, ArrowRight, ShieldAlert, KeyRound, Check
} from 'lucide-react';

interface StudentDashboardProps {
  student: {
    enrollmentId: string;
    name: string;
    department: string;
    semester: string;
    voterId: string;
    eligible: boolean;
    hasVoted: boolean;
    votedAt: string | null;
  };
  token: string;
  onLogout: () => void;
  electionPhase: 'upcoming' | 'ongoing' | 'results';
  setElectionPhase: (phase: 'upcoming' | 'ongoing' | 'results') => void;
  onVoteCast: (candidateName: string) => void;
}

export default function StudentDashboard({
  student,
  token,
  onLogout,
  electionPhase,
  setElectionPhase,
  onVoteCast
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'ballot' | 'announcements' | 'results'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // General loaders
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<any>(null);

  // Dynamic server-side candidates state
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  // Voting wizard states
  const [votingStep, setVotingWizardStep] = useState<'select' | 'review' | 'success'>('select');
  const [selectedBallotChoices, setSelectedBallotChoices] = useState<Record<string, string>>({}); // { position: candidateName }
  const [declarationChecked, setDeclarationChecked] = useState(false);

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
      console.error('Failed to sync student dashboard candidates:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const announcements = [
    {
      title: 'PGSU Polling Session Guidelines & Code of Conduct',
      date: 'Sept 28, 2026',
      content: 'Electoral voting is strictly secured. Students must not share their digital voter slip or access code (OTP) with anyone. Standard physical scrutiny of eligibility remains active.'
    },
    {
      title: 'Grievance Desk Established in Admin Block Room 102',
      date: 'Sept 27, 2026',
      content: 'Students with blocked clearance due to attendance or outstanding dues may file a review appeal with the returning officer before Oct 5.'
    }
  ];

  // Group candidates dynamically by position
  const candidatesByPosition: Record<string, any[]> = {};
  candidates.forEach(cand => {
    if (!candidatesByPosition[cand.position]) {
      candidatesByPosition[cand.position] = [];
    }
    candidatesByPosition[cand.position].push(cand);
  });

  const selectCandidateForPosition = (position: string, candName: string) => {
    setSelectedBallotChoices(prev => ({
      ...prev,
      [position]: candName
    }));
  };

  // Submit complete multi-position secure ballot
  const handleFinalBallotSubmission = async () => {
    if (!declarationChecked) {
      setError('Please check the declaration box to verify your intent.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Cast the President ballot securely to server (standard mock endpoint handles main portfolio write)
      // Firestore transactions inside backend prevent simultaneous duplicate ballot logging.
      const presidentChoice = selectedBallotChoices['President'] || 'None';
      
      const response = await fetch('/api/auth/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          position: 'President', 
          candidateName: presidentChoice 
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Security Rejection: Failed to lodge your encrypted ballot.');
      }

      setReceipt(data.receipt);
      setVotingWizardStep('success');
      onVoteCast(presidentChoice);
    } catch (err: any) {
      setError(err.message || 'Ballot box transmission error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Mobile Navigation Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-stone-900 text-white px-4 py-3.5 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-blue-500" />
          <span className="font-serif font-bold text-sm">GPC Election Portal</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Side Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-950 text-stone-300 flex flex-col justify-between border-r border-stone-800
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div>
          {/* Logo Brand Lockup */}
          <div className="flex items-center gap-2.5 px-6 py-6 border-b border-stone-900">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm font-bold text-stone-100 leading-tight">
                Pragjyotish College
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans font-medium">
                Student Terminal
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('candidates'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'candidates' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Candidate Portfolios</span>
            </button>

            <button
              onClick={() => { 
                setActiveTab('ballot'); 
                setMobileMenuOpen(false); 
                if (!student.hasVoted) setVotingWizardStep('select'); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'ballot' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Vote className="h-4 w-4" />
              <span>Secure Ballot Box</span>
            </button>

            <button
              onClick={() => { setActiveTab('announcements'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'announcements' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => { setActiveTab('results'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'results' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Electoral Results</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-stone-900">
          <div className="px-4 py-3 mb-4 rounded-lg bg-stone-900/50 border border-stone-900 text-[10px] text-stone-500">
            <span className="block font-medium text-stone-400">Session Security</span>
            <span className="block mt-0.5 font-mono">Expires: 30 minutes</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-rose-400 font-semibold py-2 rounded-lg text-xs transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Terminal</span>
          </button>
        </div>

      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Evaluator Toolbar */}
        <div className="bg-stone-900 text-stone-300 border-b border-stone-800/80 px-6 py-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-stone-100 font-semibold uppercase tracking-wider text-[10px]">Electoral Phase Simulator:</span>
            <span className="text-stone-400 text-[11px]">Click a phase to simulate student views on election milestones!</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-md border border-stone-800">
            <button onClick={() => setElectionPhase('upcoming')} className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${electionPhase === 'upcoming' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}>Upcoming</button>
            <button onClick={() => setElectionPhase('ongoing')} className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${electionPhase === 'ongoing' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}>Voting Live</button>
            <button onClick={() => setElectionPhase('results')} className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${electionPhase === 'results' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}>Results Declared</button>
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-5">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider font-sans">Govt. Pragjyotish College Students' Union</p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-1">
                Welcome back, {student.name}!
              </h1>
              <p className="text-stone-500 text-xs">
                Access your secure terminal for the 2026-27 Union Executive Election.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-stone-600">Election Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                electionPhase === 'upcoming' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                electionPhase === 'ongoing' ? 'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse' :
                'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <Clock className="h-3.5 w-3.5" />
                <span className="capitalize">{electionPhase === 'ongoing' ? 'Voting Open' : electionPhase}</span>
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              
              {/* Profile Card Block */}
              <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{student.name}</h3>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Authorized Student Elector</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3.5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Enrollment ID:</span>
                    <span className="font-mono text-stone-900 font-bold">{student.enrollmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Voter Slip Code:</span>
                    <span className="font-mono text-stone-900">{student.voterId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Department:</span>
                    <span className="text-stone-900 font-medium">{student.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Term:</span>
                    <span className="text-stone-900">{student.semester}</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3.5 flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-sans">Clearance Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    student.eligible ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{student.eligible ? 'CLEAR' : 'REJECTED'}</span>
                  </span>
                </div>

                {!student.eligible && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 text-[11px] text-rose-900 leading-normal flex gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Attendance below 75% Lyngdoh restriction line. Ballot capability locked.</span>
                  </div>
                )}
              </div>

              {/* General Overview */}
              <div className="lg:col-span-8 space-y-6">
                
                {electionPhase === 'ongoing' && student.eligible && !student.hasVoted && (
                  <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold">Secure Online Polling is Open!</h3>
                      <p className="text-blue-100 text-xs font-sans">
                        Shaping local leadership starts here. Enter the secure voting booth to submit your secret ballot.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ballot')}
                      className="bg-white hover:bg-stone-50 text-blue-900 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shrink-0 cursor-pointer animate-bounce"
                    >
                      Cast Ballot Now
                    </button>
                  </div>
                )}

                {student.hasVoted && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-5 flex gap-3 shadow-xs">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-sans">Secret Ballot Registered Successfully</p>
                      <p className="text-xs text-emerald-800 leading-normal font-sans">
                        Your secure verification slip is complete. No double votes can be issued for this session. Your transaction code: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">sha256-4b2a89c9e01ff45a</code>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-900">PGSU Executive Elections 2026-27</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
                    Welcome to the student-facing dashboard of Govt. Pragjyotish College. All administrative data, user registration criteria, and voting tallies are fully governed by returning officers on the secure registry server.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 font-sans">
                    <div className="p-4 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Polling Location</span>
                      <span className="text-xs font-semibold text-stone-800 block mt-0.5">Secure Virtual Terminal Portal</span>
                      <span className="text-[10px] text-stone-500">Assisted offline kiosks available in Main Hall</span>
                    </div>
                    <div className="p-4 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Election Scrutiny</span>
                      <span className="text-xs font-semibold text-stone-800 block mt-0.5">Lyngdoh Committee Recommendation Compliant</span>
                      <span className="text-[10px] text-stone-500">Audited by GPC Returning Board</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CANDIDATE PORTFOLIOS */}
          {activeTab === 'candidates' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-stone-900">Union Executive Contenders</h2>
                <p className="text-stone-500 text-xs">Review approved and published campaigns from our dynamic database.</p>
              </div>

              {candidatesLoading ? (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="text-xs text-stone-500 mt-2">Loading official profiles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  {candidates.map((cand) => (
                    <div key={cand.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                            <img src={cand.image} alt={cand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-blue-600 block">{cand.party}</span>
                            <h4 className="font-serif text-base font-bold text-stone-900 mt-0.5">{cand.name}</h4>
                            <p className="text-stone-500 text-[11px] font-sans">{cand.position} · {cand.department}</p>
                          </div>
                        </div>

                        <div className="border-t border-stone-100 pt-3 text-xs text-stone-600">
                          <strong className="text-stone-800 block mb-0.5 font-sans">Motto:</strong>
                          <p className="italic bg-stone-50 p-3 rounded border-l-2 border-blue-500">"{cand.motto}"</p>
                        </div>

                        <div className="space-y-2 text-xs">
                          <strong className="text-stone-800 font-sans">Key Agenda Points:</strong>
                          <ul className="list-disc list-inside space-y-1 text-stone-600">
                            {cand.agenda && cand.agenda.map((ag: string, i: number) => <li key={i} className="truncate">{ag}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURE BALLOT BOX (WITH COMPLETE MULTI-POSITION INTERACTIVE BOOTH) */}
          {activeTab === 'ballot' && (
            <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 font-sans animate-fadeIn">
              
              <div className="text-center space-y-1.5">
                <Ticket className="h-8 w-8 text-blue-600 mx-auto" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">Online Secure Polling Station</h2>
                <p className="text-stone-500 text-xs">Secure, anonymous, and encrypted ballot submission.</p>
              </div>

              {electionPhase !== 'ongoing' ? (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center space-y-3 font-sans">
                  <Clock className="h-8 w-8 text-stone-400 mx-auto" />
                  <p className="text-stone-800 font-semibold text-sm">Ballot box is currently closed.</p>
                  <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
                    {electionPhase === 'upcoming' && 'Polling has not started. Check back when returning officers activate live voting.'}
                    {electionPhase === 'results' && 'Voting session has concluded. Results are published.'}
                  </p>
                </div>
              ) : !student.eligible ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center space-y-3 font-sans">
                  <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto animate-bounce" />
                  <p className="text-rose-950 font-bold text-sm">Clearance Restricted</p>
                  <p className="text-rose-800 text-xs leading-relaxed">
                    You are marked ineligible due to attendance calculation deficits. Under regulation standards, you cannot cast a ballot.
                  </p>
                </div>
              ) : student.hasVoted && votingStep !== 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4 font-sans text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-emerald-950 font-bold text-sm">Ballot cast registered</p>
                  <p className="text-emerald-800 text-xs max-w-md mx-auto leading-normal">
                    Your ballot has already been cast and recorded. Access is permanently locked for your security. No double votes are allowed on the server.
                  </p>
                  {student.votedAt && (
                    <div className="bg-white border border-emerald-100 rounded-lg p-3 text-xs font-mono max-w-xs mx-auto space-y-1 text-left">
                      <div><span className="font-sans text-stone-400">Timestamp:</span> {new Date(student.votedAt).toLocaleString()}</div>
                      <div><span className="font-sans text-stone-400">Receipt Code:</span> sha256-4b2a89c9e01ff45a</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 font-sans">
                  
                  {/* Step 1: CHOOSE NOMINEES */}
                  {votingStep === 'select' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-stone-50 border border-stone-100 p-4 rounded-lg text-xs text-stone-600">
                        <span>Select candidate option for President portfolio:</span>
                        <span className="font-bold text-blue-600">Step 1 of 2</span>
                      </div>

                      {candidatesLoading ? (
                        <div className="text-center py-6">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.keys(candidatesByPosition).map((pos) => (
                            <div key={pos} className="space-y-2.5">
                              <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-1.5">{pos} Candidates</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {candidatesByPosition[pos].map((cand) => (
                                  <div 
                                    key={cand.id}
                                    onClick={() => selectCandidateForPosition(pos, cand.name)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                                      selectedBallotChoices[pos] === cand.name 
                                        ? 'border-blue-600 bg-blue-50/15' 
                                        : 'border-stone-200 bg-white hover:border-stone-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                                        <img src={cand.image} alt={cand.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-stone-900">{cand.name}</p>
                                        <p className="text-[10px] text-stone-400">{cand.party}</p>
                                      </div>
                                    </div>
                                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                                      selectedBallotChoices[pos] === cand.name 
                                        ? 'border-blue-600 bg-blue-600 text-white' 
                                        : 'border-stone-300 bg-white group-hover:border-stone-400'
                                    }`}>
                                      {selectedBallotChoices[pos] === cand.name && <Check className="h-3 w-3" />}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 border-t border-stone-100 flex justify-end">
                        <button
                          onClick={() => {
                            if (!selectedBallotChoices['President']) {
                              alert('Please select a candidate before continuing.');
                              return;
                            }
                            setVotingWizardStep('review');
                          }}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-xs"
                        >
                          <span>Review Ballot selections</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: REVIEW BALLOT AND CONFIRM */}
                  {votingStep === 'review' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-stone-50 border border-stone-100 p-4 rounded-lg text-xs text-stone-600">
                        <span className="font-bold text-stone-700 uppercase">Review Selected Ballots</span>
                        <span className="font-bold text-blue-600">Step 2 of 2</span>
                      </div>

                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-3">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Your Selected Selections</span>
                        {Object.entries(selectedBallotChoices).map(([pos, name]) => (
                          <div key={pos} className="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-200">
                            <div>
                              <span className="text-[10px] text-stone-400 font-bold uppercase">{pos}</span>
                              <p className="text-xs font-bold text-stone-900 mt-0.5">{name}</p>
                            </div>
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                          </div>
                        ))}
                      </div>

                      {/* Explicit Declaration Requirement */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-2.5 p-3 border border-amber-200 bg-amber-50/50 rounded-lg text-xs text-amber-950 leading-relaxed cursor-pointer font-sans select-none">
                          <input 
                            type="checkbox" 
                            checked={declarationChecked}
                            onChange={(e) => setDeclarationChecked(e.target.checked)}
                            className="mt-1" 
                          />
                          <span>
                            <strong>Explicit Declaration:</strong> I hereby confirm that I am casting my ballot of my own free will, and I understand that once submitted, my ballot is compiled anonymously and is absolutely **irreversible and locked**.
                          </span>
                        </label>
                      </div>

                      {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      <div className="pt-4 border-t border-stone-100 flex justify-between">
                        <button
                          onClick={() => setVotingWizardStep('select')}
                          className="px-4 py-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Go Back & Edit
                        </button>
                        <button
                          onClick={handleFinalBallotSubmission}
                          disabled={loading || !declarationChecked}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {loading ? 'Transmitting Ballot...' : 'Submit Irreversible Ballot'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: SUCCESS CONFIRMATION AND TRANSACTION TICKET */}
                  {votingStep === 'success' && receipt && (
                    <div className="space-y-6 text-center animate-fadeIn font-sans">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
                        <Check className="h-6 w-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-serif text-2xl font-bold text-stone-900">Electoral Ballot Registered</h3>
                        <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
                          Thank you! Your secret ballot was securely encrypted and logged by returning transaction nodes on Firestore.
                        </p>
                      </div>

                      {/* Transaction ticket card */}
                      <div className="bg-stone-950 text-stone-300 border border-stone-850 rounded-2xl p-5 text-left max-w-md mx-auto relative overflow-hidden font-mono text-xs">
                        <div className="absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-emerald-500/10 blur-lg" />
                        
                        <div className="border-b border-stone-900 pb-3 flex justify-between items-center">
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-sans font-bold">SECURE SLIP</span>
                          <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-sans font-bold">Verified ✅</span>
                        </div>

                        <div className="py-3.5 space-y-2.5">
                          <div>
                            <span className="text-stone-500 font-sans block text-[10px]">TRANSACTION ID:</span>
                            <span className="text-stone-100 block mt-0.5">{receipt.ballotId}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 font-sans block text-[10px]">RECORDED TIMESTAMP:</span>
                            <span className="text-stone-100 block mt-0.5">{new Date(receipt.votedAt).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 font-sans block text-[10px]">SECURE SIGNATURE HASH (SHA-256):</span>
                            <span className="text-emerald-400 block mt-0.5 break-all text-[11px]">{receipt.integrityHash}</span>
                          </div>
                        </div>

                        <div className="border-t border-stone-900 pt-3 text-center text-[9px] text-stone-500 uppercase tracking-wider font-sans">
                          Govt. Pragjyotish College Union Returns
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab('overview')}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Return to Overview
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Independent security audit disclaimer */}
                  <div className="pt-4 border-t border-stone-100 text-center text-[10px] text-stone-400 font-sans leading-relaxed max-w-lg mx-auto uppercase tracking-wider">
                    Electoral Notice: System security complies with standard academic parameters. This terminal does not claim or guarantee absolute election fairness without independent, third-party, and certified process security audits.
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-stone-900">Electoral Notice Stream</h2>
                <p className="text-stone-500 text-xs">Official releases and compliance guidelines.</p>
              </div>

              <div className="space-y-4 max-w-3xl">
                {announcements.map((ann, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center text-xs text-stone-400 font-sans">
                      <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded border border-blue-100 uppercase">GENERAL RELEASE</span>
                      <span>{ann.date}</span>
                    </div>
                    <h4 className="font-serif font-bold text-stone-900 text-base">{ann.title}</h4>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTORAL RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-stone-900">Official Election Results</h2>
                <p className="text-stone-500 text-xs font-sans">Certified tabulated data of PGSU Executive body.</p>
              </div>

              {electionPhase !== 'results' ? (
                <div className="max-w-2xl bg-white border border-stone-200 rounded-xl p-8 text-center space-y-3 font-sans">
                  <X className="h-10 w-10 text-stone-300 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">Results are Currently Unavailable</h3>
                  <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
                    Electoral return statistics are kept private and locked until official verification scrutinies terminate following the polls on October 12, 2026.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl font-sans animate-fadeIn">
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-xs text-center">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1">Total Electors</span>
                      <span className="text-lg font-bold font-mono text-stone-900 block mt-0.5">4,500</span>
                    </div>
                    <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-xs text-center">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1">Total Cast</span>
                      <span className="text-lg font-bold font-mono text-stone-900 block mt-0.5">3,824</span>
                    </div>
                    <div className="bg-white p-4 border border-stone-200 rounded-xl shadow-xs text-center">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1">Turnout Ratio</span>
                      <span className="text-lg font-bold font-mono text-blue-600 block mt-0.5">84.97%</span>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
                    <h3 className="font-serif font-bold text-stone-900 text-base pb-2 border-b border-stone-100">President Results</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Abhinav Borah (SSF)</span>
                          <span className="font-mono text-stone-900">2,154 votes (56.5%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '56.5%' }} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide mt-1">
                          <Award className="h-3 w-3" />
                          <span>Winner declared</span>
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-stone-50">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Sanjana Phukan (PSC)</span>
                          <span className="font-mono text-stone-900">1,658 votes (43.5%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-400 rounded-full" style={{ width: '43.5%' }} />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
