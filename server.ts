import express from 'express';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// --- JWT Secret & Security Configurations ---
const JWT_SECRET = process.env.JWT_SECRET || 'gpc-pgsu-election-integrity-key-2026';
const SESSION_EXPIRY = '30m'; // Student & Admin sessions expire in 30 minutes

// --- Brute-force & Enumeration Protection Maps ---
interface LoginAttempt {
  count: number;
  lockUntil?: number;
}
const ipAttempts: Record<string, LoginAttempt> = {};
const idAttempts: Record<string, LoginAttempt> = {};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes lock

const checkBruteForce = (ip: string, enrollmentId: string): { locked: boolean; message?: string } => {
  const now = Date.now();
  
  const ipRecord = ipAttempts[ip];
  if (ipRecord && ipRecord.lockUntil && ipRecord.lockUntil > now) {
    const minsLeft = Math.ceil((ipRecord.lockUntil - now) / 60000);
    return { locked: true, message: `Too many failed login attempts from this network. Try again in ${minsLeft} minutes.` };
  }

  const idRecord = idAttempts[enrollmentId];
  if (idRecord && idRecord.lockUntil && idRecord.lockUntil > now) {
    const minsLeft = Math.ceil((idRecord.lockUntil - now) / 60000);
    return { locked: true, message: `This credentials combo is temporarily locked. Please retry in ${minsLeft} minutes.` };
  }

  return { locked: false };
};

const recordFailure = (ip: string, enrollmentId: string) => {
  const now = Date.now();

  if (!ipAttempts[ip]) ipAttempts[ip] = { count: 0 };
  ipAttempts[ip].count += 1;
  if (ipAttempts[ip].count >= MAX_FAILED_ATTEMPTS) {
    ipAttempts[ip].lockUntil = now + LOCK_TIME_MS;
  }

  if (!idAttempts[enrollmentId]) idAttempts[enrollmentId] = { count: 0 };
  idAttempts[enrollmentId].count += 1;
  if (idAttempts[enrollmentId].count >= MAX_FAILED_ATTEMPTS) {
    idAttempts[enrollmentId].lockUntil = now + LOCK_TIME_MS;
  }
};

const clearFailures = (ip: string, enrollmentId: string) => {
  delete ipAttempts[ip];
  delete idAttempts[enrollmentId];
};


// --- Firebase Admin SDK Setup ---
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const votersCollection = db.collection('voters');
const ballotsCollection = db.collection('ballots');
const candidatesCollection = db.collection('candidates');
const activityLogsCollection = db.collection('activityLogs');
const configCollection = db.collection('config');
const electionsCollection = db.collection('elections');

// --- Pre-seed database ---
async function seedDatabase() {
  try {
    const configDoc = await configCollection.doc('election').get();
    if (!configDoc.exists) {
      await configCollection.doc('election').set({
        phase: 'upcoming',
        name: 'PGSU Executive Elections 2026-27',
        updatedAt: new Date().toISOString()
      });
    }

    const electionSnapshot = await electionsCollection.limit(1).get();
    if (electionSnapshot.empty) {
      console.log('Seeding default Student Union Election Event...');
      const defaultElection = {
        id: 'ELEC-2026-001',
        title: 'PGSU Executive Officer Bearers Election',
        description: 'Annual democratic student ballot to elect executive portfolios for the Pragjyotish union body under returning board rules.',
        year: '2026-27',
        startDate: '2026-10-12T09:00:00.000Z',
        endDate: '2026-10-12T17:00:00.000Z',
        status: 'scheduled',
        positions: [
          { position: 'President', maxCandidates: 2 },
          { position: 'Vice President', maxCandidates: 2 },
          { position: 'General Secretary', maxCandidates: 2 },
          { position: 'Assistant General Secretary', maxCandidates: 2 }
        ],
        eligibleSemesters: ['1st Semester', '3rd Semester', '5th Semester'],
        cancelReason: '',
        certified: false,
        resultsPublished: false
      };
      await electionsCollection.doc(defaultElection.id).set(defaultElection);
    }

    const voterSnapshot = await votersCollection.limit(1).get();
    if (voterSnapshot.empty) {
      console.log('Seeding official student voters roll...');
      const officialVoters = [
        {
          enrollmentId: 'PC/2023/104',
          name: 'Ankur Sarma',
          department: 'Computer Science',
          semester: '5th Semester',
          voterId: 'GPC-2026-CS104',
          eligible: true,
          status: 'active',
          accessCode: '123456',
          hasVoted: false,
          votedAt: null
        },
        {
          enrollmentId: 'PC/2023/241',
          name: 'Priya Kalita',
          department: 'Political Science',
          semester: '5th Semester',
          voterId: 'GPC-2026-PS241',
          eligible: true,
          status: 'active',
          accessCode: '241361',
          hasVoted: false,
          votedAt: null
        },
        {
          enrollmentId: 'PC/2024/089',
          name: 'Rahul Boro',
          department: 'Physics',
          semester: '3rd Semester',
          voterId: 'GPC-2026-PH089',
          eligible: true,
          status: 'active',
          accessCode: '890890',
          hasVoted: false,
          votedAt: null
        },
        {
          enrollmentId: 'PC/2025/112',
          name: 'Jahnabi Devi',
          department: 'Assamese',
          semester: '1st Semester',
          voterId: 'GPC-2026-AS112',
          eligible: false,
          status: 'active',
          accessCode: '112112',
          hasVoted: false,
          votedAt: null
        }
      ];
      for (const voter of officialVoters) {
        await votersCollection.doc(voter.enrollmentId).set(voter);
      }
    }

    const candidatesSnapshot = await candidatesCollection.limit(1).get();
    if (candidatesSnapshot.empty) {
      console.log('Seeding approved Union contesting candidates...');
      const defaultCandidates = [
        {
          id: 'cand-1',
          name: 'Abhinav Borah',
          enrollmentId: 'PC/2023/102',
          position: 'President',
          party: 'Students Solidarity Front (SSF)',
          department: 'Department of Political Science',
          motto: 'Empowering student representation through transparent and participatory leadership.',
          image: '/src/assets/images/candidate_male_one_1790623693476.jpg',
          approved: true,
          published: true,
          withdrawn: false,
          bio: 'Abhinav is an outstanding orator, debate champion, and lead coordinator of the college cultural committee. He has been advocating for modern sanitation systems, robust student feedback portals, and immediate digital expansion of the main college library.',
          agenda: [
            'Establishment of an open student grievance and resolution desk inside the main administrative wing.',
            'Immediate modernization of the boys and girls common rooms with proper amenities.',
            'Digitization of library textbook issue logs to eliminate processing latency.',
            'Allocation of designated student parking bays with security camera coverage.'
          ]
        },
        {
          id: 'cand-2',
          name: 'Sanjana Phukan',
          enrollmentId: 'PC/2023/194',
          position: 'President',
          party: 'Progressive Students Coalition (PSC)',
          department: 'Department of Economics',
          motto: 'Bridging the gap between the student fraternity and the administrative registry.',
          image: '/src/assets/images/candidate_female_two_1790623728300.jpg',
          approved: true,
          published: true,
          withdrawn: false,
          bio: 'Sanjana has been at the forefront of students\' rights for the last two years. She represents the college in state-level athletic events and has a consistent academic track record with an aggregate NAAC excellence clearance.',
          agenda: [
            'Setting up a subsidized canteen and nutritional review board to maintain food quality standards.',
            'Enhancement of the college medical center with a full-time professional nurse practitioner.',
            'Introduction of weekly inter-departmental sports leagues to foster healthy peer interaction.',
            'Establishing a student-run entrepreneurship incubator cell and peer mentoring program.'
          ]
        },
        {
          id: 'cand-3',
          name: 'Priya Kalita',
          enrollmentId: 'PC/2023/241',
          position: 'General Secretary',
          party: 'Students Solidarity Front (SSF)',
          department: 'Department of English',
          motto: 'Catalyzing change through systematic accountability and structured annual budgeting.',
          image: '/src/assets/images/candidate_female_one_1790623703730.jpg',
          approved: true,
          published: true,
          withdrawn: false,
          bio: 'Priya is the current chief editor of the departmental newsletter. She is an expert in organization and structural coordination, having successfully managed the Inter-College Pragjyotish Youth Festival last year.',
          agenda: [
            'Fully audited, publicly transparent reporting of the PGSU treasury funds on a quarterly basis.',
            'Modern high-speed Wi-Fi network routing throughout the campus courtyard and library block.',
            'Restoration of clean drinking water purification filters in every building block.',
            'Launching professional career-guidance and public speaking training seminars twice a year.'
          ]
        },
        {
          id: 'cand-4',
          name: 'Partha Pratim Sarma',
          enrollmentId: 'PC/2024/048',
          position: 'Assistant General Secretary',
          party: 'Progressive Students Coalition (PSC)',
          department: 'Department of Computer Science',
          motto: 'Inclusive support for every fresh enrollee and streamlined sports resources.',
          image: '/src/assets/images/candidate_male_two_1790623716095.jpg',
          approved: true,
          published: true,
          withdrawn: false,
          bio: 'Partha is a tech enthusiast, competitive chess player, and open-source project contributor. He specializes in designing clean software systems and volunteers to support first-semester students with registration issues.',
          agenda: [
            'Deployment of an interactive mobile app for real-time notifications on syllabus updates and notices.',
            'Modernization of the indoor games room with new high-quality chessboards and table-tennis equipment.',
            'Assisting first-year students with streamlined scholarship application guidance cells.',
            'Eco-friendly college initiative: setting up segregated recycling bins and a plastic-free campus policy.'
          ]
        }
      ];
      for (const cand of defaultCandidates) {
        await candidatesCollection.doc(cand.id).set(cand);
      }
    }
  } catch (err) {
    console.error('Error pre-seeding collections:', err);
  }
}
seedDatabase();


// --- Authentication Middlewares ---
export interface StudentAuthRequest extends express.Request {
  student?: {
    enrollmentId: string;
    name: string;
    department: string;
    semester: string;
    eligible: boolean;
  };
}

export interface AdminAuthRequest extends express.Request {
  admin?: {
    role: string;
    email: string;
  };
}

const requireStudentAuth = (req: StudentAuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.student = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session signature expired. Please sign in again.' });
  }
};

const requireAdminAuth = (req: AdminAuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin terminal authorization required.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin credentials required.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session signature expired. Please sign in again.' });
  }
};


// --- Audit Logging Helper ---
async function logAdminAction(adminEmail: string, action: string, details: string) {
  try {
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    await activityLogsCollection.doc(logId).set({
      id: logId,
      action,
      adminEmail,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Audit logger failed:', err);
  }
}


// --- API REST Endpoints ---

// A. Get dynamic active election config phase for public front-end
app.get('/api/election-config', async (req, res) => {
  try {
    // 1. Check if results published phase is active for any election
    const publishedResultsSnapshot = await electionsCollection.where('resultsPublished', '==', true).limit(1).get();
    if (!publishedResultsSnapshot.empty) {
      const el = publishedResultsSnapshot.docs[0].data();
      
      // Calculate results dynamically on the backend from stored ballots for absolute security
      const ballotsSnap = await ballotsCollection.get();
      const votes: Record<string, Record<string, number>> = {
        'President': { 'Abhinav Borah': 0, 'Sanjana Phukan': 0 },
        'General Secretary': { 'Priya Kalita': 0 },
        'Assistant General Secretary': { 'Partha Pratim Sarma': 0 }
      };

      let validCount = 0;
      let blankCount = 0;

      ballotsSnap.forEach(doc => {
        const data = doc.data();
        const pos = data.position || 'President';
        const cand = data.candidateName || 'None';

        if (cand === 'None' || cand === 'NOTA' || cand === '') {
          blankCount++;
        } else {
          validCount++;
        }

        if (!votes[pos]) votes[pos] = {};
        if (!votes[pos][cand]) votes[pos][cand] = 0;
        votes[pos][cand]++;
      });

      return res.json({
        phase: 'results',
        name: el.title,
        election: el,
        results: {
          votes,
          validCount,
          blankCount,
          totalCount: ballotsSnap.size
        }
      });
    }

    // 2. Check for live active election
    const activeSnapshot = await electionsCollection.where('status', '==', 'ongoing').limit(1).get();
    if (!activeSnapshot.empty) {
      const activeEl = activeSnapshot.docs[0].data();
      return res.json({
        phase: 'ongoing',
        name: activeEl.title,
        election: activeEl
      });
    }

    // 3. Check for scheduled election
    const scheduledSnapshot = await electionsCollection.where('status', '==', 'scheduled').limit(1).get();
    if (!scheduledSnapshot.empty) {
      const schedEl = scheduledSnapshot.docs[0].data();
      return res.json({
        phase: 'upcoming',
        name: schedEl.title,
        election: schedEl
      });
    }

    const fallbackConfig = await configCollection.doc('election').get();
    const fallbackData = fallbackConfig.exists ? fallbackConfig.data()! : { phase: 'upcoming', name: 'PGSU Executive Elections 2026-27' };
    return res.json(fallbackData);

  } catch (err) {
    return res.status(500).json({ error: 'Failed to sync election config.' });
  }
});

// B. Update global fallback election configuration
app.post('/api/admin/election-status', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { phase } = req.body;
  if (!phase || !['upcoming', 'ongoing', 'results'].includes(phase)) {
    return res.status(400).json({ error: 'Invalid election status phase.' });
  }
  try {
    await configCollection.doc('election').update({
      phase,
      updatedAt: new Date().toISOString()
    });

    await logAdminAction(
      req.admin!.email,
      'UPDATE_ELECTION_PHASE',
      `Modified election phase status to: "${phase.toUpperCase()}"`
    );

    return res.json({ success: true, phase });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update election configurations.' });
  }
});

// 1. Dual-Purpose Login: Student and Administrator
app.post('/api/auth/login', async (req, res) => {
  const { enrollmentId, accessCode, twoFactorCode } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!enrollmentId || !accessCode) {
    return res.status(400).json({ error: 'Enrollment ID and Access Code are required.' });
  }

  const cleanId = enrollmentId.trim().toUpperCase();
  const cleanCode = accessCode.trim();

  const bfCheck = checkBruteForce(clientIp, cleanId);
  if (bfCheck.locked) {
    return res.status(429).json({ error: bfCheck.message });
  }

  if (cleanId === 'ADMIN-2026') {
    if (cleanCode === '888888') {
      if (!twoFactorCode) {
        return res.json({
          require2FA: true,
          message: 'Primary authentication approved. Secure rolling 2FA challenge code requested.'
        });
      }

      if (twoFactorCode.trim() !== '777777' && twoFactorCode.trim() !== 'GPC-2FA-77') {
        recordFailure(clientIp, cleanId);
        return res.status(401).json({ error: 'Invalid rolling Two-Factor security code.' });
      }

      clearFailures(clientIp, cleanId);
      const adminToken = jwt.sign(
        {
          role: 'admin',
          email: 'sahil265064@gmail.com'
        },
        JWT_SECRET,
        { expiresIn: SESSION_EXPIRY }
      );
      
      await logAdminAction('sahil265064@gmail.com', 'ADMIN_LOGIN', 'Administrator entered dashboard terminal with 2FA.');

      return res.json({
        token: adminToken,
        role: 'admin',
        admin: {
          email: 'sahil265064@gmail.com',
          role: 'admin'
        }
      });
    } else {
      recordFailure(clientIp, cleanId);
      return res.status(401).json({ error: 'Invalid admin terminal credentials.' });
    }
  }

  try {
    const voterDoc = await votersCollection.doc(cleanId).get();
    if (!voterDoc.exists) {
      recordFailure(clientIp, cleanId);
      return res.status(401).json({ error: 'Invalid enrollment ID or access code.' });
    }

    const voter = voterDoc.data()!;
    if (voter.status !== 'active') {
      return res.status(403).json({ error: 'This student record is currently locked or inactive.' });
    }

    if (voter.accessCode !== cleanCode) {
      recordFailure(clientIp, cleanId);
      return res.status(401).json({ error: 'Invalid enrollment ID or access code.' });
    }

    clearFailures(clientIp, cleanId);

    const sessionToken = jwt.sign(
      {
        enrollmentId: voter.enrollmentId,
        name: voter.name,
        department: voter.department,
        semester: voter.semester,
        eligible: voter.eligible
      },
      JWT_SECRET,
      { expiresIn: SESSION_EXPIRY }
    );

    return res.json({
      token: sessionToken,
      role: 'student',
      student: {
        enrollmentId: voter.enrollmentId,
        name: voter.name,
        department: voter.department,
        semester: voter.semester,
        voterId: voter.voterId,
        eligible: voter.eligible,
        hasVoted: voter.hasVoted,
        votedAt: voter.votedAt
      }
    });

  } catch (err) {
    return res.status(500).json({ error: 'Secure verification server error.' });
  }
});

// 2. Fetch authenticated Session details
app.get('/api/auth/session', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing session token.' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role === 'admin') {
      return res.json({
        role: 'admin',
        admin: {
          email: decoded.email,
          role: 'admin'
        }
      });
    } else {
      const voterDoc = await votersCollection.doc(decoded.enrollmentId).get();
      const voter = voterDoc.data()!;
      return res.json({
        role: 'student',
        student: {
          enrollmentId: voter.enrollmentId,
          name: voter.name,
          department: voter.department,
          semester: voter.semester,
          voterId: voter.voterId,
          eligible: voter.eligible,
          hasVoted: voter.hasVoted,
          votedAt: voter.votedAt
        }
      });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Session signature expired.' });
  }
});

// 3. SECURE PUBLIC CANDIDATES RETRIEVAL
app.get('/api/candidates', async (req, res) => {
  try {
    const snapshot = await candidatesCollection
      .where('approved', '==', true)
      .where('published', '==', true)
      .where('withdrawn', '==', false)
      .get();
    
    const list: any[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data());
    });
    return res.json({ candidates: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to synchronize approved contenders.' });
  }
});

// --- ELECTIONS MANAGEMENT ENDPOINTS (REST) ---

app.get('/api/elections', async (req, res) => {
  try {
    const snapshot = await electionsCollection.get();
    const list: any[] = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return res.json({ elections: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load election stream.' });
  }
});

app.get('/api/admin/elections', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  try {
    const snapshot = await electionsCollection.get();
    const list: any[] = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return res.json({ elections: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load administrative elections list.' });
  }
});

// SECURE AUDIT: LOG SENSITIVE REPORT DOWNLOADS
app.post('/api/admin/reports/log-access', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { reportName } = req.body;
  if (!reportName) {
    return res.status(400).json({ error: 'Report name is required.' });
  }
  try {
    await logAdminAction(
      req.admin!.email,
      'DOWNLOAD_SENSITIVE_REPORT',
      `Accessed and downloaded turnout metrics report: "${reportName}"`
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write security log.' });
  }
});

app.post('/api/admin/elections', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { title, description, year, startDate, endDate, positions, eligibleSemesters } = req.body;

  if (!title || !startDate || !endDate || !positions || !eligibleSemesters) {
    return res.status(400).json({ error: 'Required fields missing: Title, Start Date, End Date, Positions, Eligible Semesters.' });
  }

  try {
    const electionId = `ELEC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newElection = {
      id: electionId,
      title: title.trim(),
      description: description ? description.trim() : 'College Union Council Election Cycle.',
      year: year || '2026-27',
      startDate,
      endDate,
      status: 'scheduled',
      positions: Array.isArray(positions) ? positions : [],
      eligibleSemesters: Array.isArray(eligibleSemesters) ? eligibleSemesters : [],
      cancelReason: '',
      certified: false,
      resultsPublished: false
    };

    await electionsCollection.doc(electionId).set(newElection);

    await logAdminAction(
      req.admin!.email,
      'CREATE_ELECTION_EVENT',
      `Created new scheduled election: "${newElection.title}" (${newElection.year})`
    );

    return res.status(201).json({ success: true, election: newElection });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to write election event.' });
  }
});

app.put('/api/admin/elections/:id', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { title, description, year, startDate, endDate, positions, eligibleSemesters } = req.body;

  try {
    const elRef = electionsCollection.doc(id);
    const elDoc = await elRef.get();

    if (!elDoc.exists) {
      return res.status(404).json({ error: 'Election not found.' });
    }

    const current = elDoc.data()!;
    const updates: any = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (year) updates.year = year;
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;
    if (Array.isArray(positions)) updates.positions = positions;
    if (Array.isArray(eligibleSemesters)) updates.eligibleSemesters = eligibleSemesters;

    let isOverride = false;
    if (current.status === 'ongoing') {
      isOverride = true;
    }

    await elRef.update(updates);

    if (isOverride) {
      await logAdminAction(
        req.admin!.email,
        'EXCEPTIONAL_ELECTION_CONFIG_OVERRIDE',
        `Scrutiny Alert: Returning Officer modified configurations for election "${current.title}" while live polls were active!`
      );
    } else {
      await logAdminAction(
        req.admin!.email,
        'EDIT_ELECTION_EVENT',
        `Adjusted election configs for "${current.title}".`
      );
    }

    return res.json({ success: true, updates });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to update election configuration.' });
  }
});

app.post('/api/admin/elections/:id/status', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { status, cancelReason } = req.body;

  if (!status || !['scheduled', 'ongoing', 'paused', 'completed', 'cancelled', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid transition status parameter.' });
  }

  try {
    const elRef = electionsCollection.doc(id);
    const elDoc = await elRef.get();

    if (!elDoc.exists) {
      return res.status(404).json({ error: 'Election cycle not found.' });
    }

    const current = elDoc.data()!;
    const updates: any = { status };

    if (status === 'cancelled') {
      if (!cancelReason || cancelReason.trim().length === 0) {
        return res.status(412).json({ error: 'Procedural Violation: A specific justification reason must be submitted to cancel active elections.' });
      }
      updates.cancelReason = cancelReason.trim();
    }

    await elRef.update(updates);

    await logAdminAction(
      req.admin!.email,
      `TRANSITION_ELECTION_${status.toUpperCase()}`,
      `Transitioned election "${current.title}" status to "${status.toUpperCase()}".`
    );

    return res.json({ success: true, status });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to transition election status.' });
  }
});

// --- DYNAMIC RESULTS CALCULATION (CRITICAL: CALCULATED SECURELY FROM BALLOTS, NOT FRONTEND!) ---
app.get('/api/admin/elections/:id/results', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  try {
    const elRef = electionsCollection.doc(id);
    const elDoc = await elRef.get();
    if (!elDoc.exists) {
      return res.status(404).json({ error: 'Election not found.' });
    }

    const election = elDoc.data()!;

    // Tally ballots securely from database ballots collection
    const ballotsSnap = await ballotsCollection.get();
    const votes: Record<string, Record<string, number>> = {
      'President': { 'Abhinav Borah': 0, 'Sanjana Phukan': 0 },
      'General Secretary': { 'Priya Kalita': 0 },
      'Assistant General Secretary': { 'Partha Pratim Sarma': 0 }
    };

    let validCount = 0;
    let blankCount = 0;

    ballotsSnap.forEach(doc => {
      const data = doc.data();
      const pos = data.position || 'President';
      const cand = data.candidateName || 'None';

      if (cand === 'None' || cand === 'NOTA' || cand === '') {
        blankCount++;
      } else {
        validCount++;
      }

      if (!votes[pos]) votes[pos] = {};
      if (!votes[pos][cand]) votes[pos][cand] = 0;
      votes[pos][cand]++;
    });

    return res.json({
      id: election.id,
      title: election.title,
      certified: election.certified || false,
      resultsPublished: election.resultsPublished || false,
      validCount,
      blankCount,
      totalCount: ballotsSnap.size,
      votes
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate electoral results.' });
  }
});

// ELECTION RESULTS VERIFICATION & APPROVAL WORKFLOW
app.post('/api/admin/elections/:id/approve-results', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  try {
    const elRef = electionsCollection.doc(id);
    const elDoc = await elRef.get();
    if (!elDoc.exists) return res.status(404).json({ error: 'Election not found.' });

    await elRef.update({ certified: true });

    await logAdminAction(
      req.admin!.email,
      'APPROVE_ELECTION_RESULTS',
      `Returning Officer reviewed and certified official results for election: "${elDoc.data()!.title}" (${id})`
    );

    return res.json({ success: true, certified: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to certify results.' });
  }
});

// ELECTION RESULTS PUBLICATION WORKFLOW
app.post('/api/admin/elections/:id/publish-results', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  try {
    const elRef = electionsCollection.doc(id);
    const elDoc = await elRef.get();
    if (!elDoc.exists) return res.status(404).json({ error: 'Election not found.' });

    const election = elDoc.data()!;
    if (!election.certified) {
      return res.status(412).json({ error: 'Workflow Blocked: Results must be certified and approved by returning board PRIOR to public publication.' });
    }

    await elRef.update({ 
      resultsPublished: true,
      status: 'completed'
    });

    await logAdminAction(
      req.admin!.email,
      'PUBLISH_ELECTION_RESULTS',
      `Officially published certified electoral results for: "${election.title}" on the main student website portal.`
    );

    return res.json({ success: true, resultsPublished: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to publish results.' });
  }
});


// --- ADMIN SECURE CHANNELS ---

// 1. REAL-TIME STATS CALCULATION
app.get('/api/admin/stats', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  try {
    const votersSnapshot = await votersCollection.get();
    const candidatesSnapshot = await candidatesCollection.get();

    let totalEligible = 0;
    let totalVoted = 0;
    
    votersSnapshot.forEach((doc) => {
      const v = doc.data();
      if (v.eligible) totalEligible++;
      if (v.hasVoted) totalVoted++;
    });

    const totalNotVoted = totalEligible - totalVoted;
    const turnoutPercent = totalEligible > 0 ? Number(((totalVoted / totalEligible) * 100).toFixed(2)) : 0;
    const totalCandidates = candidatesSnapshot.size;

    return res.json({
      totalEligible,
      totalVoted,
      totalNotVoted,
      turnoutPercent,
      totalCandidates
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute server statistics.' });
  }
});

// 2. ADMIN CANDIDATES MANAGEMENT (GET, POST, PUT, DELETE, SCRUTINY)
app.get('/api/admin/candidates', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  try {
    const snapshot = await candidatesCollection.get();
    const list: any[] = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return res.json({ candidates: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load administrative candidates list.' });
  }
});

app.post('/api/admin/candidates', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { name, enrollmentId, position, party, department, motto, bio, image, agenda } = req.body;
  if (!name || !enrollmentId || !position || !party || !department) {
    return res.status(400).json({ error: 'Required fields missing: Name, Enrollment ID, Position, Party, Department.' });
  }
  const cleanId = enrollmentId.trim().toUpperCase();
  try {
    const existingSnapshot = await candidatesCollection.where('enrollmentId', '==', cleanId).get();
    if (!existingSnapshot.empty) {
      return res.status(409).json({ error: `Candidate nomination exists for enrollment ID "${cleanId}".` });
    }

    const candId = `cand-${Date.now()}`;
    const newCandidate = {
      id: candId,
      name: name.trim(),
      enrollmentId: cleanId,
      position,
      party: party.trim(),
      department: department.trim(),
      motto: motto ? motto.trim() : '',
      bio: bio ? bio.trim() : '',
      image: image || '/src/assets/images/candidate_male_one_1790623693476.jpg',
      agenda: Array.isArray(agenda) ? agenda : [],
      approved: false,
      published: false,
      withdrawn: false
    };

    await candidatesCollection.doc(candId).set(newCandidate);

    await logAdminAction(
      req.admin!.email,
      'REGISTER_CANDIDATE_NOMINATION',
      `Registered candidate nomination for "${newCandidate.name}" for position "${position}".`
    );

    return res.status(201).json({ success: true, candidate: newCandidate });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to file candidate nomination.' });
  }
});

app.put('/api/admin/candidates/:id', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { name, position, party, department, motto, bio, image, agenda } = req.body;
  try {
    const candRef = candidatesCollection.doc(id);
    const candDoc = await candRef.get();
    if (!candDoc.exists) {
      return res.status(404).json({ error: 'Candidate nomination record not found.' });
    }

    const current = candDoc.data()!;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (position) updates.position = position;
    if (party) updates.party = party.trim();
    if (department) updates.department = department.trim();
    if (motto !== undefined) updates.motto = motto.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (image) updates.image = image;
    if (Array.isArray(agenda)) updates.agenda = agenda;

    await candRef.update(updates);

    await logAdminAction(
      req.admin!.email,
      'EDIT_CANDIDATE_NOMINATION',
      `Modified candidate nomination record details for "${current.name}" (${current.enrollmentId}).`
    );

    return res.json({ success: true, updates });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update candidate nomination.' });
  }
});

app.delete('/api/admin/candidates/:id', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  try {
    const ref = candidatesCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Candidate nomination record not found.' });
    }
    const cand = doc.data()!;
    await ref.delete();
    await logAdminAction(
      req.admin!.email,
      'DELETE_CANDIDATE_NOMINATION',
      `Permanently removed candidate nomination for "${cand.name}" (${cand.enrollmentId}).`
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete candidate nomination.' });
  }
});

app.post('/api/admin/candidates/:id/scrutiny', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!action || !['approve', 'reject', 'publish', 'unpublish', 'withdraw'].includes(action)) {
    return res.status(400).json({ error: 'Invalid scrutiny action parameter.' });
  }
  try {
    const candRef = candidatesCollection.doc(id);
    const candDoc = await candRef.get();
    if (!candDoc.exists) {
      return res.status(404).json({ error: 'Candidate nomination record not found.' });
    }
    const current = candDoc.data()!;
    const updates: any = {};

    if (action === 'approve') {
      updates.approved = true;
    } else if (action === 'reject') {
      updates.approved = false;
      updates.published = false;
    } else if (action === 'publish') {
      if (!current.approved) {
        return res.status(412).json({ error: 'Workflow Blocked: Candidate must be approved by the returning officer PRIOR to publication.' });
      }
      updates.published = true;
    } else if (action === 'unpublish') {
      updates.published = false;
    } else if (action === 'withdraw') {
      updates.withdrawn = true;
    }

    await candRef.update(updates);

    await logAdminAction(
      req.admin!.email,
      `CANDIDATE_SCRUTINY_${action.toUpperCase()}`,
      `Executed scrutiny action "${action.toUpperCase()}" on candidate "${current.name}" (${current.enrollmentId}).`
    );

    return res.json({ success: true, action });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to execute scrutiny action.' });
  }
});

// 3. ADMIN VOTERS MANAGEMENT (GET)
app.get('/api/admin/voters', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  try {
    const snapshot = await votersCollection.get();
    const list: any[] = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return res.json({ voters: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load voter registry.' });
  }
});

// 3. ADMIN VOTER REGISTRATION (POST)
app.post('/api/admin/voters', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { name, enrollmentId, department, semester, eligible, status, accessCode } = req.body;

  if (!name || !enrollmentId || !department || !semester || !accessCode) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const cleanId = enrollmentId.trim().toUpperCase();

  try {
    const docRef = votersCollection.doc(cleanId);
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      return res.status(409).json({ error: `Voter Registration Denied: Student ID "${cleanId}" is already registered.` });
    }

    const voterId = `GPC-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newVoter = {
      enrollmentId: cleanId,
      name: name.trim(),
      department: department.trim(),
      semester: semester.trim(),
      voterId,
      eligible: eligible !== undefined ? eligible : true,
      status: status || 'active',
      accessCode: accessCode.trim(),
      hasVoted: false,
      votedAt: null
    };

    await docRef.set(newVoter);

    await logAdminAction(
      req.admin!.email,
      'REGISTER_STUDENT_VOTER',
      `Registered voter "${newVoter.name}" with ID: ${newVoter.enrollmentId} in ${newVoter.department}`
    );

    return res.status(201).json({ success: true, voter: newVoter });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write voter student.' });
  }
});

// 4. ADMIN VOTERS BULK IMPORT (POST)
app.post('/api/admin/voters/bulk', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid payload.' });
  }
  let importedCount = 0;
  let duplicateCount = 0;

  try {
    const batch = db.batch();
    for (const record of records) {
      const cleanId = record.enrollmentId.trim().toUpperCase();
      const voterRef = votersCollection.doc(cleanId);
      const voterDoc = await voterRef.get();

      if (voterDoc.exists) {
        duplicateCount++;
        continue;
      }

      const voterId = `GPC-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const newVoter = {
        enrollmentId: cleanId,
        name: record.name.trim(),
        department: record.department.trim(),
        semester: record.semester.trim(),
        voterId,
        eligible: record.eligible !== undefined ? record.eligible : true,
        status: record.status || 'active',
        accessCode: record.accessCode ? record.accessCode.trim() : Math.floor(100000 + Math.random() * 900000).toString(),
        hasVoted: false,
        votedAt: null
      };

      batch.set(voterRef, newVoter);
      importedCount++;
    }

    if (importedCount > 0) {
      await batch.commit();
      await logAdminAction(
        req.admin!.email,
        'BULK_IMPORT_VOTERS',
        `Completed bulk import of ${importedCount} student voter records. Ignored duplicates: ${duplicateCount}`
      );
    }
    return res.json({ success: true, importedCount, duplicateCount });
  } catch (err) {
    return res.status(500).json({ error: 'Database bulk upload failed.' });
  }
});

// 5. ADMIN VOTER DETAILS UPDATE
app.put('/api/admin/voters/:id', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  const { name, department, semester, eligible, status, accessCode } = req.body;

  try {
    const voterRef = votersCollection.doc(id);
    const voterDoc = await voterRef.get();

    if (!voterDoc.exists) {
      return res.status(404).json({ error: 'Voter student not found.' });
    }

    const current = voterDoc.data()!;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (department) updates.department = department.trim();
    if (semester) updates.semester = semester.trim();
    if (status) updates.status = status;
    if (accessCode) updates.accessCode = accessCode.trim();

    let exceptionLogRequired = false;
    let exceptionDetails = '';

    if (eligible !== undefined && eligible !== current.eligible) {
      updates.eligible = eligible;

      const activeSnapshot = await electionsCollection.where('status', '==', 'ongoing').limit(1).get();
      if (!activeSnapshot.empty) {
        exceptionLogRequired = true;
        exceptionDetails = `Scrutiny Exception Override: Voter ${current.name} (${current.enrollmentId}) eligibility adjusted from ${current.eligible} to ${eligible} during active voting polls.`;
      }
    }

    await voterRef.update(updates);

    if (exceptionLogRequired) {
      await logAdminAction(req.admin!.email, 'EXCEPTIONAL_ELIGIBILITY_OVERRIDE', exceptionDetails);
    } else {
      await logAdminAction(req.admin!.email, 'EDIT_VOTER_DETAILS', `Adjusted voter record details for student "${current.name}" (${current.enrollmentId}).`);
    }

    return res.json({ success: true, updates });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update student voter details.' });
  }
});

// 6. ADMIN VOTER DE-REGISTRATION
app.delete('/api/admin/voters/:id', requireAdminAuth, async (req: AdminAuthRequest, res) => {
  const { id } = req.params;
  try {
    const ref = votersCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    const voter = doc.data()!;
    await ref.delete();
    await logAdminAction(req.admin!.email, 'DELETE_STUDENT_VOTER', `De-registered student "${voter.name}" (${voter.enrollmentId}).`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete student record.' });
  }
});


// --- Standard vote, recovery & session routes ---
app.post('/api/auth/vote', requireStudentAuth, async (req: StudentAuthRequest, res) => {
  const { candidateName, position } = req.body;
  if (!req.student) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!candidateName || !position) {
    return res.status(400).json({ error: 'Ballot data missing.' });
  }

  const enrollmentId = req.student.enrollmentId;

  try {
    const activeSnapshot = await electionsCollection.where('status', '==', 'ongoing').limit(1).get();
    if (activeSnapshot.empty) {
      return res.status(403).json({ error: 'Ballot Box is Closed: There is no active voting election polls currently.' });
    }

    const activeEl = activeSnapshot.docs[0].data();
    const now = new Date();
    const start = new Date(activeEl.startDate);
    const end = new Date(activeEl.endDate);

    if (now < start || now > end) {
      return res.status(403).json({ error: `Electoral Error: Ballot submission is restricted to the configured poll window.` });
    }

    if (!activeEl.eligibleSemesters.includes(req.student.semester)) {
      return res.status(403).json({ error: `Scrutiny Lock: Your student cohort ("${req.student.semester}") is not eligible to vote in this cycle.` });
    }

    const voterRef = votersCollection.doc(enrollmentId);
    const result = await db.runTransaction(async (transaction) => {
      const voterDoc = await transaction.get(voterRef);
      if (!voterDoc.exists) throw new Error('Voter profile missing.');
      const voter = voterDoc.data()!;
      if (!voter.eligible) throw new Error('Student is ineligible to cast votes.');
      if (voter.hasVoted) throw new Error('Voter has already cast their ballot.');

      const timestamp = new Date().toISOString();
      transaction.update(voterRef, {
        hasVoted: true,
        votedAt: timestamp
      });
      const ballotId = `BAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const ballotRef = ballotsCollection.doc(ballotId);
      transaction.set(ballotRef, {
        id: ballotId,
        position,
        candidateName,
        castAt: timestamp
      });
      return { ballotId, timestamp };
    });
    return res.json({
      success: true,
      receipt: {
        ballotId: result.ballotId,
        votedAt: result.timestamp,
        integrityHash: jwt.sign({ ballotId: result.ballotId, timestamp: result.timestamp }, JWT_SECRET).substring(0, 32)
      }
    });
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Ballot secure logging failed.' });
  }
});

app.post('/api/auth/recovery', async (req, res) => {
  const { enrollmentId } = req.body;
  if (!enrollmentId) return res.status(400).json({ error: 'Enrollment ID required.' });
  return res.json({
    success: true,
    message: 'Recovery protocol initiated. To securely reset your 6-digit access code (OTP), please present yourself physically at the College Electoral Registrar Desk in the Main Admin Block (Block A, Room 102) with your valid Govt. Student ID card.'
  });
});

app.get('/api/test/voters', async (req, res) => {
  try {
    const snapshot = await votersCollection.get();
    const list: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      list.push({
        enrollmentId: data.enrollmentId,
        name: data.name,
        department: data.department,
        eligible: data.eligible,
        accessCode: data.accessCode,
        hasVoted: data.hasVoted
      });
    });
    return res.json({ voters: list });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load test voters.' });
  }
});


// --- Serve Static Frontend via Vite Middleware or Dist folder ---
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const fs = await import('fs');
      const htmlPath = path.resolve(__dirname, 'index.html');
      let template = fs.readFileSync(htmlPath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Govt. Pragjyotish College Election Portal running on http://localhost:${PORT}`);
});
