/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Announcements from './components/Announcements';
import Rules from './components/Rules';
import Candidates from './components/Candidates';
import Results from './components/Results';
import VoterPortalModal from './components/VoterPortalModal';
import Footer from './components/Footer';
import StudentDashboard from './components/StudentDashboard';
import AdminTerminal from './components/AdminTerminal';

export default function App() {
  const [electionPhase, setElectionPhase] = useState<'upcoming' | 'ongoing' | 'results'>('upcoming');
  const [isVoterPortalOpen, setIsVoterPortalOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState<string | null>(null);

  // Custom SPA Router Path tracking
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Secure full-stack session states
  const [token, setTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem('voter_session_token');
  });
  const [voterProfile, setVoterProfile] = useState<any | null>(null);

  // Admin authentication state
  const [adminToken, setAdminTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem('admin_session_token');
  });

  // Track popstate URL adjustments (e.g. going to /admin directly)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Helper to securely trigger administrative URL navigation
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Sync current election phase and name from server on mount & periodically
  useEffect(() => {
    fetch('/api/election-config')
      .then(res => res.json())
      .then(data => {
        if (data.phase) {
          setElectionPhase(data.phase);
        }
      })
      .catch(err => console.warn('Failed to sync active election config:', err));
  }, [voterProfile, adminToken]);

  // Helper to update token and synchronize sessionStorage safely
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem('voter_session_token', newToken);
    } else {
      sessionStorage.removeItem('voter_session_token');
    }
  };

  const setAdminToken = (newAdminToken: string | null) => {
    setAdminTokenState(newAdminToken);
    if (newAdminToken) {
      sessionStorage.setItem('admin_session_token', newAdminToken);
    } else {
      sessionStorage.removeItem('admin_session_token');
    }
  };

  // Synchronize student session details on page load / mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Session expired.');
        }
        return res.json();
      })
      .then(data => {
        if (data.role === 'student') {
          setVoterProfile(data.student);
          setHasVoted(data.student.hasVoted);
        }
      })
      .catch(err => {
        console.warn('Voter session handshake failed, clearing credentials:', err);
        setToken(null);
        setVoterProfile(null);
      });
    }
  }, [token]);

  // Synchronize admin session details on mount
  useEffect(() => {
    if (adminToken) {
      fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Admin session expired.');
        return res.json();
      })
      .then(data => {
        if (data.role !== 'admin') {
          throw new Error('Unauthorized role.');
        }
      })
      .catch(err => {
        console.warn('Admin session validation failed:', err);
        setAdminToken(null);
      });
    }
  }, [adminToken]);

  const handleLogout = () => {
    setToken(null);
    setVoterProfile(null);
    setHasVoted(false);
    setVotedCandidate(null);
    setIsVoterPortalOpen(false);
  };

  const handleVoteCast = (candidateName: string) => {
    setHasVoted(true);
    setVotedCandidate(candidateName);
    
    // Instantly sync local profile state to propagate across dashboard components
    if (voterProfile) {
      setVoterProfile((prev: any) => ({
        ...prev,
        hasVoted: true
      }));
    }
  };

  const images = {
    hero: '/src/assets/images/pragjyotish_college_hero_1790623678640.jpg',
    maleOne: '/src/assets/images/candidate_male_one_1790623693476.jpg',
    femaleOne: '/src/assets/images/candidate_female_one_1790623055000.jpg',
    maleTwo: '/src/assets/images/candidate_male_two_1790623716095.jpg',
    femaleTwo: '/src/assets/images/candidate_female_two_1790623728300.jpg'
  };

  // --- ROUTER GATES ---

  // A. Admin workspace routed via separate /admin URL path
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminTerminal
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        onClose={() => navigateTo('/')}
      />
    );
  }

  // B. Student authorized dashboard route
  if (voterProfile) {
    return (
      <StudentDashboard
        student={voterProfile}
        token={token!}
        onLogout={handleLogout}
        electionPhase={electionPhase}
        setElectionPhase={setElectionPhase}
        onVoteCast={handleVoteCast}
      />
    );
  }

  // C. Public student-facing portal homepage
  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 antialiased selection:bg-blue-600/10 selection:text-blue-700">
      
      {/* Upper Information Banner for important announcements */}
      <div className="bg-blue-600 text-white text-xs py-2 px-4 text-center font-sans tracking-wide">
        <p className="inline-flex items-center gap-1.5 font-medium justify-center w-full">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Notice: Scrutiny of nominations is complete. Direct complaints to Grievance Council before Oct 5.</span>
        </p>
      </div>

      {/* Top Navigation */}
      <Header 
        onOpenPortal={() => setIsVoterPortalOpen(true)} 
        onOpenAdmin={() => navigateTo('/admin')}
        electionPhase={electionPhase}
      />

      {/* Hero Header Area */}
      <Hero 
        onOpenPortal={() => setIsVoterPortalOpen(true)}
        electionPhase={electionPhase}
        heroImagePath={images.hero}
      />

      {/* Announcements Stream */}
      <Announcements />

      {/* Step-by-Step voting instructions and FAQs */}
      <Rules />

      {/* Contesting Nominees List */}
      <Candidates />

      {/* Dynamic Scrutiny & Returns Panel */}
      <Results 
        electionPhase={electionPhase}
        votedCandidateName={votedCandidate}
      />

      {/* Verification Portal & Mock Voting Modal */}
      <VoterPortalModal 
        isOpen={isVoterPortalOpen}
        onClose={() => setIsVoterPortalOpen(false)}
        electionPhase={electionPhase}
        onVoteCast={handleVoteCast}
        token={token}
        setToken={setToken}
        voterProfile={voterProfile}
        setVoterProfile={setVoterProfile}
      />

      {/* System Footer & Evaluator State Toggles */}
      <Footer 
        electionPhase={electionPhase}
        setElectionPhase={setElectionPhase}
      />

    </div>
  );
}
