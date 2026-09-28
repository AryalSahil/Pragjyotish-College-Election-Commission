import React, { useState } from 'react';
import { ClipboardList, ShieldCheck, HelpCircle, ArrowRight, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function Rules() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Voter Registration Verification',
      desc: 'All bonafide undergraduate and postgraduate students with a valid college roll number must verify their names in the electoral draft. Enter your credentials on the Student Portal to retrieve your status.',
      tip: 'Requires minimum 75% attendance for absolute voting clearance.'
    },
    {
      id: 2,
      title: 'Digital Voter Slip Generation',
      desc: 'Once cleared, students must download and print their Digital Voter Slip containing a unique 12-digit security transaction hash. This slip serves as the official digital entry pass for the poll day.',
      tip: 'Do not share your voter slip credentials or hash code with anyone.'
    },
    {
      id: 3,
      title: 'Accessing the Secure Booth',
      desc: 'On election day (October 12th, 09:00 AM - 04:00 PM), click "Enter Digital Voting Booth" inside the verified student dashboard. Your session is protected by standard 256-bit encryption.',
      tip: 'IP tracking and one-voter-one-device locks are strictly enforced.'
    },
    {
      id: 4,
      title: 'Casting the Confidential Ballot',
      desc: 'Select your preferred candidate under each major portfolio. Confirm your ballot. Once completed, a secure confirmation certificate is logged, and an SMS confirmation will be sent to your registered phone.',
      tip: 'Once submitted, a ballot cannot be re-opened, modified, or deleted.'
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'Who is eligible to participate in the PGSU elections?',
      answer: 'All full-time registered undergraduate (BA, BSc, BCom) and postgraduate (MA, MSc) students of Govt. Pragjyotish College with clear academic status, clear fee records, and at least 75% classroom attendance are eligible to vote.'
    },
    {
      question: 'Is the online voting ballot completely private?',
      answer: 'Yes. The Pragjyotish College Election Commission guarantees absolute anonymity. The relationship between your student identity and the candidate chosen is completely severed through cryptographic sanitization before the ballot is stored in the database.'
    },
    {
      question: 'Can I change my vote after final submission?',
      answer: 'No. To ensure absolute authenticity and prevent electoral coercion, once a vote is cast and submitted in the database, it is completely permanent and irreversible.'
    },
    {
      question: 'What should I do if my Roll Number is marked ineligible?',
      answer: 'If you believe your status is an error (e.g. attendance record calculation or fee clearance delay), please file an immediate review request with the Election Grievance Board in the Admin Block before Oct 5, 2026.'
    }
  ];

  return (
    <section id="instructions" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-blue-600">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider uppercase font-sans">VOTER EDUCATION</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight text-wrap-balance">
            Voting Instructions & Guidelines
          </h2>
          <p className="text-stone-500 text-sm">
            Familiarize yourself with the digital voting steps and electoral codes of Govt. Pragjyotish College.
          </p>
        </div>

        {/* Step-by-Step voting process block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Interactive Steps Navigation */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-4">Voting Booth Walkthrough</h3>
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeStep === s.id
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-white border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                  activeStep === s.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {s.id}
                </span>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${
                    activeStep === s.id ? 'text-blue-900' : 'text-stone-800'
                  }`}>
                    {s.title}
                  </h4>
                  <p className="text-stone-500 text-xs line-clamp-1">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active Step Explainer Card */}
          <div className="lg:col-span-7 bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-blue-600 font-bold font-sans">
                  Detailed Step {activeStep} of 4
                </span>
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {steps[activeStep - 1].title}
              </h3>
              
              <p className="text-stone-600 text-sm leading-relaxed">
                {steps[activeStep - 1].desc}
              </p>

              <div className="bg-white border border-stone-100 rounded-lg p-3 text-xs text-stone-600">
                <strong className="text-stone-800 font-semibold block mb-0.5">Electoral Tip:</strong>
                {steps[activeStep - 1].tip}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-200/60 flex items-center justify-between">
              <span className="text-xs text-stone-400">Pragjyotish Students' Union Election Comm.</span>
              {activeStep < 4 ? (
                <button
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Ready to Vote</span>
                </span>
              )}
            </div>
          </div>

        </div>

        {/* FAQs Accordion Block */}
        <div className="max-w-3xl mx-auto pt-6 border-t border-stone-100">
          <h3 className="text-center font-serif text-xl font-bold text-stone-900 mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-stone-200/80 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-stone-800 hover:bg-stone-50 transition-colors text-sm"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-stone-500" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-stone-600 text-xs sm:text-sm border-t border-stone-100 pt-3 leading-relaxed bg-stone-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
