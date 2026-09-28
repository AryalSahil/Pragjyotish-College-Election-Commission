import React, { useState } from 'react';
import { Megaphone, FileText, Download, CalendarRange, BellRing } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'notices' | 'nominations' | 'press';
  content: string;
  fileSize?: string;
  fileName?: string;
}

export default function Announcements() {
  const [activeTab, setActiveTab] = useState<'all' | 'notices' | 'nominations' | 'press'>('all');

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Official Notification: Commencement of Union Elections for Academic Session 2026-27',
      date: 'Sept 25, 2026',
      category: 'notices',
      content: 'The Principal of Govt. Pragjyotish College hereby notifies all eligible students regarding the schedule of the upcoming Students\' Union Elections (PGSU). Academic activities will be partially suspended on the day of polling.',
      fileSize: '420 KB',
      fileName: 'PGSU_Election_Schedule_2026.pdf'
    },
    {
      id: 'ann-2',
      title: 'Electoral Code of Conduct (Lyngdoh Committee Recommendation Compliant)',
      date: 'Sept 26, 2026',
      category: 'notices',
      content: 'All contesting candidates must adhere strictly to the Lyngdoh Committee Guidelines. Any wall writing, excessive expenditure, or external interference will result in immediate disqualification by the Disciplinary Committee.',
      fileSize: '1.2 MB',
      fileName: 'Lyngdoh_Guidelines_Pragjyotish.pdf'
    },
    {
      id: 'ann-3',
      title: 'Release of Final Contesting Candidates Nomination List with Symbols',
      date: 'Sept 27, 2026',
      category: 'nominations',
      content: 'Following extensive scrutiny of academic and attendance requirements by the Scrutiny Council, the official list of nominated candidates contesting for key portfolios is finalized.',
      fileSize: '510 KB',
      fileName: 'Final_Contestants_List_2026.pdf'
    },
    {
      id: 'ann-4',
      title: 'Mandatory Briefing for Candidates and Polling Observers',
      date: 'Sept 28, 2026',
      category: 'press',
      content: 'All approved nominees are required to attend a briefing session at the college auditorium on October 2nd at 11:30 AM. Standard election rulebooks and polling booths procedures will be explained.',
      fileSize: '180 KB',
      fileName: 'Nominee_Briefing_Oct2.pdf'
    }
  ];

  const filteredAnnouncements = activeTab === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.category === activeTab);

  const handleDownload = (fileName: string) => {
    alert(`Initiating download for "${fileName}" from Pragjyotish College electoral repository server.`);
  };

  return (
    <section id="announcements" className="py-12 bg-stone-50 border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Megaphone className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wider uppercase font-sans">BULLETIN BOARD</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Announcements & Notices
            </h2>
            <p className="text-stone-500 text-xs">
              Stay updated with the latest declarations from the Pragjyotish College Election Commission.
            </p>
          </div>

          {/* Interactive filter tabs: functional buttons */}
          <div className="flex items-center p-1 bg-stone-200/60 rounded-lg self-start md:self-auto shrink-0">
            {(['all', 'notices', 'nominations', 'press'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'all' ? 'All Bulletins' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List Layout with single-elevation cards */}
        <div className="space-y-4 max-w-4xl">
          {filteredAnnouncements.map((ann) => (
            <div 
              key={ann.id}
              className="bg-white border border-stone-200/80 rounded-xl p-5 sm:p-6 transition-all hover:border-stone-300 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    ann.category === 'notices' 
                      ? 'bg-blue-50 text-blue-800 border-blue-100'
                      : ann.category === 'nominations'
                      ? 'bg-amber-50 text-amber-800 border-amber-100'
                      : 'bg-stone-50 text-stone-800 border-stone-200'
                  }`}>
                    {ann.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs font-mono">
                    <CalendarRange className="h-3.5 w-3.5" />
                    <span>{ann.date}</span>
                  </div>
                </div>
                
                {ann.fileName && (
                  <button 
                    onClick={() => handleDownload(ann.fileName!)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download Document ({ann.fileSize})</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                )}
              </div>

              <h3 className="font-serif font-semibold text-stone-900 text-base sm:text-lg mb-2 leading-snug">
                {ann.title}
              </h3>
              
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                {ann.content}
              </p>

              {ann.fileName && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-xs text-stone-600">
                  <FileText className="h-4 w-4 text-stone-400" />
                  <span className="font-mono truncate max-w-md">{ann.fileName}</span>
                </div>
              )}

            </div>
          ))}

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
              <BellRing className="h-8 w-8 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 font-serif text-sm">No announcements found in this category.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
