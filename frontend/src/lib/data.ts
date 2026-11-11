/**
 * HostelIQ AI — Server-side in-memory data store (demo only).
 *
 * This module runs exclusively on the server (Next.js Route Handlers).
 * All mutable records live in JavaScript arrays/objects in memory.
 *
 * LIMITATIONS (development demo):
 *   - Data is lost when the Next.js server process restarts.
 *   - Data is not shared between server instances (no distributed store).
 *   - Browser-tab closure does NOT clear server-side data.
 *
 * Never import this module from client components.
 */

import {
  User,
  UserRole,
  DocumentMetadata,
  DocumentChunk,
  MessMenuItem,
  AnnouncementItem,
  ComplaintItem,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPriority,
} from '@/types';

const nowISO = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Demo users (development-only — NOT production authentication)
// Populated dynamically at demo login time. No hardcoded credentials.
// ---------------------------------------------------------------------------

export const DEMO_USERS: User[] = [];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && process.env.ENVIRONMENT !== "production";
}

export function createDemoUser(email: string, role: UserRole): User {
  const localPart = email.split("@")[0];
  const displayName = localPart.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const id = `demo_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  const user: User = {
    id,
    email,
    full_name: displayName,
    role,
    room_number: undefined,
    block_name: undefined,
  };
  DEMO_USERS.push(user);
  return user;
}

export function findUserById(id: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

export function findUserByEmail(email: string): User | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ---------------------------------------------------------------------------
// In-memory mutable stores
// ---------------------------------------------------------------------------

export const complaints: ComplaintItem[] = [];
export const announcements: AnnouncementItem[] = [];
export const messMenus: MessMenuItem[] = [];
export const documents: DocumentMetadata[] = [];
export const documentChunks: DocumentChunk[] = [];
export const auditLogs: Array<{
  id: string;
  event_type: string;
  details: Record<string, unknown>;
  status: string;
  timestamp: string;
}> = [];

let complaintSeq = 42; // so first new tracking id is CMP-2026-0043

// ---------------------------------------------------------------------------
// Seed initial demo data
// ---------------------------------------------------------------------------

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;
const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const;

const sampleSchedule: Record<string, Record<string, { items: string[]; dietary: Record<string, boolean>; start: string; end: string }>> = {
  Monday: {
    Breakfast: { items: ['Idli & Medu Vada', 'Coconut Chutney & Sambar', 'Bread Butter Jam', 'Tea & Coffee', 'Boiled Eggs / Banana'], dietary: { veg: true, egg: true, dairy: true, jain: true }, start: '07:30', end: '09:30' },
    Lunch: { items: ['Rajma Masala (Punjabi style)', 'Jeera Rice', 'Whole Wheat Chapati', 'Aloo Gobhi Sabzi', 'Boondi Raita', 'Green Salad'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:15' },
    Snacks: { items: ['Vegetable Poha', 'Roasted Peanuts & Sev', 'Ginger Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Dal Tadka', 'Steamed Basmati Rice', 'Paneer Butter Masala', 'Mix Veg Korma', 'Tawa Roti', 'Gulab Jamun (1 pc)'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '19:45', end: '21:45' },
  },
  Tuesday: {
    Breakfast: { items: ['Aloo Paratha with Curd', 'Pickle', 'Sprouts Salad', 'Bread Butter', 'Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '07:30', end: '09:30' },
    Lunch: { items: ['Chole Masala', 'Bhature / Steamed Rice', 'Yellow Moong Dal', 'Cucumber Onion Salad', 'Sweet Lassi'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:15' },
    Snacks: { items: ['Bread Pakoda with Mint Chutney', 'Biscuits', 'Masala Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Egg Curry (non-veg) / Kadhai Paneer (veg)', 'Dal Makhani', 'Jeera Rice', 'Phulka Roti', 'Ice Cream Cup'], dietary: { veg: true, egg: true, dairy: true, jain: false }, start: '19:45', end: '21:45' },
  },
  Wednesday: {
    Breakfast: { items: ['Masala Dosa with Sambar', 'Tomato Chutney', 'Oatmeal Porridge', 'Boiled Eggs', 'Tea & Coffee'], dietary: { veg: true, egg: true, dairy: true, jain: true }, start: '07:30', end: '09:30' },
    Lunch: { items: ['Kadhi Pakora', 'Khichdi & Steamed Rice', 'Bhindi Do Pyaza', 'Papad', 'Pudina Raita'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:15' },
    Snacks: { items: ['Corn Chaat (Butter Salt & Pepper)', 'Filter Coffee & Green Tea'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Chicken Curry (non-veg) / Malai Kofta (veg)', 'Dal Fry', 'Peas Pulao', 'Tandoori Roti', 'Fruit Custard'], dietary: { veg: true, egg: true, dairy: true, jain: false }, start: '19:45', end: '21:45' },
  },
  Thursday: {
    Breakfast: { items: ['Poori with Aloo Bhaji', 'Suji Halwa', 'Cut Fresh Papaya', 'Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '07:30', end: '09:30' },
    Lunch: { items: ['Dal Palak', 'Veg Kolhapuri', 'Steamed Rice', 'Chapati', 'Plain Curd', 'Kachumber Salad'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:15' },
    Snacks: { items: ['Veg Cutlet with Tomato Ketchup', 'Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Sambar', 'Curd Rice & Lemon Rice', 'Potato Fry (Sukha)', 'Chapati', 'Semiyan Kheer'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '19:45', end: '21:45' },
  },
  Friday: {
    Breakfast: { items: ['Veg Upma with Coconut Chutney', 'Boiled Chana Chaat', 'Bread Omelette / Jam', 'Tea & Coffee'], dietary: { veg: true, egg: true, dairy: true, jain: false }, start: '07:30', end: '09:30' },
    Lunch: { items: ['Veg Biryani with Mirchi ka Salan', 'Dal Tadka', 'Raita', 'Chapati', 'Roasted Papad'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:15' },
    Snacks: { items: ['Samosa with Tamarind Chutney', 'Chai & Lemon Tea'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Fish Curry / Shahi Paneer', 'Dal Makhani', 'Jeera Rice', 'Butter Roti', 'Moong Dal Halwa'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '19:45', end: '21:45' },
  },
  Saturday: {
    Breakfast: { items: ['Uttapam (Onion & Tomato)', 'Sambar & Chutney', 'Boiled Eggs / Bananas', 'Tea & Coffee'], dietary: { veg: true, egg: true, dairy: true, jain: true }, start: '07:30', end: '10:00' },
    Lunch: { items: ['Kashmiri Dum Aloo', 'Panchratan Dal', 'Steamed Rice', 'Phulka Roti', 'Dahi Vada'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '12:15', end: '14:30' },
    Snacks: { items: ['Bhelpuri / Sev Puri', 'Tea & Coffee'], dietary: { veg: true, egg: false, dairy: false, jain: false }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Pav Bhaji with Butter Pav', 'Veg Pulao with Raita', 'Green Salad', 'Rasgulla (1 pc)'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '19:45', end: '21:45' },
  },
  Sunday: {
    Breakfast: { items: ['Paneer Paratha & Butter', 'Curd & Pickle', 'Cornflakes with Milk', 'Tea & Coffee'], dietary: { veg: true, egg: false, dairy: true, jain: false }, start: '08:00', end: '10:30' },
    Lunch: { items: ['Hyderabadi Chicken Biryani / Paneer Dum Biryani', 'Mirchi Ka Salan', 'Mix Veg Raita', 'Onion Lemon Salad', 'Gulab Jamun'], dietary: { veg: true, egg: true, dairy: true, jain: false }, start: '12:30', end: '14:45' },
    Snacks: { items: ['Biscuits & Rusks', 'Filter Coffee & Masala Chai'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '17:00', end: '18:15' },
    Dinner: { items: ['Light Khichdi / Steamed Rice', 'Yellow Moong Dal', 'Aloo Beans Sabzi', 'Tawa Phulka', 'Seasonal Fresh Fruit'], dietary: { veg: true, egg: false, dairy: true, jain: true }, start: '19:45', end: '21:45' },
  },
};

function seedMessMenus() {
  for (const day of days) {
    for (const meal of meals) {
      const slot = sampleSchedule[day]?.[meal];
      if (!slot) continue;
      messMenus.push({
        id: `menu_${day.toLowerCase()}_${meal.toLowerCase()}`,
        day_of_week: day,
        meal_type: meal,
        start_time: slot.start,
        end_time: slot.end,
        items: slot.items,
        dietary_info: {
          veg: Boolean(slot.dietary.veg),
          egg: Boolean(slot.dietary.egg),
          dairy: Boolean(slot.dietary.dairy),
          jain: Boolean(slot.dietary.jain),
        },
      });
    }
  }
}

function seedAnnouncements() {
  announcements.push({
    id: 'ann_demo_1',
    title: 'Mandatory Curfew Verification & Late Entry Gate Pass Protocol',
    content: 'All resident students are reminded that the main hostel gates close strictly at 10:30 PM. Any student requiring entry after 10:30 PM for genuine academic lab work or emergency travel must submit an approved Digital Late Pass signed by their project guide and hostel warden at least 4 hours in advance.',
    category: 'Urgent',
    priority: 'Urgent',
    is_pinned: true,
    target_audience: 'all',
    author_name: 'Prof. Arthur Pendelton (Chief Warden)',
    created_at: '2026-10-26T09:00:00.000Z',
  });
  announcements.push({
    id: 'ann_demo_2',
    title: 'Scheduled Electrical Maintenance in Block B & C',
    content: 'Routine maintenance and transformer testing will be conducted on Saturday between 09:00 AM and 01:00 PM. High-power appliances are strictly prohibited. Emergency elevator and corridor lighting will remain on backup inverter power.',
    category: 'Maintenance',
    priority: 'High',
    is_pinned: false,
    target_audience: 'all',
    author_name: 'Estate Office (Electrical Wing)',
    created_at: '2026-10-27T11:30:00.000Z',
  });
  announcements.push({
    id: 'ann_demo_3',
    title: 'Mess Rebate Application Deadline for End-Semester Break',
    content: 'Students leaving the campus for vacation must apply for mess rebate on the student portal at least 3 days prior to departure. A minimum continuous absence of 4 days is mandatory to qualify for dining bill deductions.',
    category: 'Mess',
    priority: 'Normal',
    is_pinned: false,
    target_audience: 'students',
    author_name: 'Mess Council Office',
    created_at: '2026-10-28T08:15:00.000Z',
  });
}

function seedComplaints() {
  complaints.push({
    id: 'cmp_demo_1',
    tracking_id: 'CMP-2026-0041',
    student_id: 's_demo_1',
    student_name: 'Rohan Sharma',
    room_number: 'B-304',
    block_name: 'Block B (Aryabhatta Hall)',
    category: 'Plumbing',
    title: 'Bathroom tap leakage causing continuous water drip',
    description: 'The cold water washbasin faucet in room B-304 does not shut off completely, wasting water and creating continuous dripping noise.',
    priority: 'Medium',
    status: 'In Progress',
    admin_notes: 'Plumber Jagdish assigned on Oct 27; replacement ceramic cartridge requisitioned.',
    resolved_at: undefined,
    created_at: '2026-10-26T14:20:00.000Z',
    updated_at: '2026-10-27T09:45:00.000Z',
  });
  complaints.push({
    id: 'cmp_demo_2',
    tracking_id: 'CMP-2026-0042',
    student_id: 's_demo_1',
    student_name: 'Rohan Sharma',
    room_number: 'B-304',
    block_name: 'Block B (Aryabhatta Hall)',
    category: 'Internet',
    title: 'LAN port 2 connectivity intermittent',
    description: 'Study table wall ethernet port drops packets after 10-15 minutes of continuous connection. WiFi signal on 3rd floor west wing is also weak.',
    priority: 'Low',
    status: 'Submitted',
    admin_notes: undefined,
    resolved_at: undefined,
    created_at: '2026-10-27T16:50:00.000Z',
    updated_at: '2026-10-27T16:50:00.000Z',
  });
  complaints.push({
    id: 'cmp_demo_3',
    tracking_id: 'CMP-2026-0038',
    student_id: 's_demo_1',
    student_name: 'Ananya Iyer',
    room_number: 'G-112',
    block_name: 'Block G (Gargi Hall)',
    category: 'Electrical',
    title: 'Ceiling fan regulator sparking on speed 3',
    description: 'The ceiling fan speed regulator is sparking when turned to speeds 3 and 4. Needs immediate replacement before use.',
    priority: 'High',
    status: 'Resolved',
    admin_notes: 'Electrician Mohan replaced faulty rotary switch with modular dimmer on Oct 26. Verified working safely.',
    resolved_at: '2026-10-26T17:30:00.000Z',
    created_at: '2026-10-25T11:10:00.000Z',
    updated_at: '2026-10-26T17:30:00.000Z',
  });
}

function seedDocumentsAndChunks() {
  const docId = 'doc_demo_1';
  documents.push({
    id: docId,
    title: 'Hostel Rules & Regulations Handbook 2026',
    file_name: 'Hostel_Rules_and_Regulations_2026.pdf',
    file_size: 248500,
    category: 'Rules & Discipline',
    status: 'indexed',
    chunk_count: 4,
    created_at: '2026-01-15T10:00:00.000Z',
  });

  const docChunks = [
    {
      id: `${docId}_chunk_0`,
      document_id: docId,
      content: '## Section 1: Gate Timings, Curfew, and Entry Protocols\n1.1 Main Gate Curfew: The main hostel gates will be locked strictly at 10:30 PM on all weekdays (Monday through Friday) and at 11:00 PM on weekends (Saturday and Sunday).\n1.2 Late Entry Gate Pass: Any student arriving past curfew must present a pre-approved Digital Late Entry Pass issued via the Hostel Administration Portal. The request must be submitted at least four (4) hours prior to gate closure and countersigned by the student\'s research guide or batch coordinator.\n1.3 Unapproved Late Arrivals: Students arriving after curfew without prior clearance will have their entry logged in the Warden Disciplinary Register. More than two (2) unapproved late entries in a semester will result in disciplinary review and parental intimation.\n1.4 Night Out / Overnight Leave: Overnight leave outside campus requires submission of a "Night-Out Request Form" on the portal 24 hours prior to travel. Verification SMS will be dispatched to the registered guardian contact.',
      page_number: 1,
      chunk_index: 0,
      metadata: { section: 'Gate Timings, Curfew, and Entry Protocols', doc_title: 'Hostel Rules & Regulations Handbook 2026' },
    },
    {
      id: `${docId}_chunk_1`,
      document_id: docId,
      content: '## Section 2: Visitor and Guest Policy\n2.1 Visiting Hours: Visitors, including parents, local guardians, and fellow students from other hostel blocks, are permitted only in the designated Ground Floor Reception Lounge between 04:30 PM and 08:00 PM on weekdays, and 10:00 AM to 08:00 PM on Sundays and Institute holidays.\n2.2 Room Access: No external visitor, parent, or student of a different residential block is permitted inside student living rooms at any time without written authorization from the Resident Warden.\n2.3 Overnight Stay Prohibitions: Overnight stay of guests in student rooms is strictly prohibited. Violations will incur an administrative penalty of ₹2,500 and possible suspension from hostel accommodation for the following academic term.\n2.4 Guest Rooms: For visiting parents, a limited number of Institute Guest Rooms may be booked via the Estate Office portal at subsidized university tariff rates, subject to room availability.',
      page_number: 2,
      chunk_index: 1,
      metadata: { section: 'Visitor and Guest Policy', doc_title: 'Hostel Rules & Regulations Handbook 2026' },
    },
    {
      id: `${docId}_chunk_2`,
      document_id: docId,
      content: '## Section 4: Noise Discipline and Quiet Hours\n4.1 Quiet Hours: Strict silence hours are enforced across all hostel wings and corridors from 11:00 PM to 06:00 AM daily.\n4.2 Audio Equipment: High-decibel audio speakers, amplifiers, and subwoofers are prohibited in individual rooms. Students must use headphones for music and multimedia after 10:00 PM.\n4.3 Common Rooms: Common television and recreation rooms close promptly at 11:30 PM, except during officially approved academic events or university screenings.',
      page_number: 3,
      chunk_index: 2,
      metadata: { section: 'Noise Discipline and Quiet Hours', doc_title: 'Hostel Rules & Regulations Handbook 2026' },
    },
  ];
  for (const c of docChunks) {
    documentChunks.push({ ...c, similarity: undefined });
  }

  const docId2 = 'doc_demo_2';
  documents.push({
    id: docId2,
    title: 'Mess Dining Guidelines & Rebate Policy 2026',
    file_name: 'Mess_Guidelines_and_Rebate_Policy_2026.pdf',
    file_size: 154200,
    category: 'Mess & Dining',
    status: 'indexed',
    chunk_count: 3,
    created_at: '2026-01-20T14:30:00.000Z',
  });

  const docChunks2 = [
    {
      id: `${docId2}_chunk_0`,
      document_id: docId2,
      content: '## Section 1: Dining Hall Operating Timings and Etiquette\n1.1 Service Hours:\n- Breakfast: 07:30 AM to 09:30 AM (Weekdays) | 08:00 AM to 10:30 AM (Weekends)\n- Lunch: 12:15 PM to 02:15 PM (Weekdays) | 12:30 PM to 02:45 PM (Weekends)\n- Evening Snacks: 05:00 PM to 06:15 PM (Daily)\n- Dinner: 07:45 PM to 09:45 PM (Daily)\n1.2 Dining Entry: Every student must tap their Biometric Smart Card or present their authenticated QR code at the dining hall entrance turnstiles.\n1.3 Food Removal: Dining hall food and utensils (plates, bowls, glasses, spoons) may not be taken out of the dining hall or into student residential rooms, except in certified medical illness cases endorsed by the University Health Center.',
      page_number: 1,
      chunk_index: 0,
      metadata: { section: 'Dining Hall Operating Timings and Etiquette', doc_title: 'Mess Dining Guidelines & Rebate Policy 2026' },
    },
    {
      id: `${docId2}_chunk_1`,
      document_id: docId2,
      content: '## Section 2: Mess Rebate and Absence Deductions\n2.1 Eligibility Criteria: Students leaving campus for academic conferences, field projects, or authorized institute holidays are entitled to a daily dining rebate.\n2.2 Minimum Duration: A minimum continuous absence of four (4) full dining days is required to qualify for rebate credit.\n2.3 Advance Notice Requirement: Rebate applications must be lodged via the HostelIQ portal at least 72 hours (3 days) before the starting meal of absence. Retroactive rebate claims after departure will be rejected automatically.\n2.4 Monthly Cap: The maximum allowable rebate in a single calendar month during regular semester instruction is ten (10) days, unless an official medical leave letter is issued by the University CMO.',
      page_number: 2,
      chunk_index: 1,
      metadata: { section: 'Mess Rebate and Absence Deductions', doc_title: 'Mess Dining Guidelines & Rebate Policy 2026' },
    },
  ];
  for (const c of docChunks2) {
    documentChunks.push({ ...c, similarity: undefined });
  }

  const docId3 = 'doc_demo_3';
  documents.push({
    id: docId3,
    title: 'Hostel Maintenance & Electrical Appliance Policy',
    file_name: 'Electrical_and_Maintenance_Policy.pdf',
    file_size: 98400,
    category: 'Facilities & Maintenance',
    status: 'indexed',
    chunk_count: 2,
    created_at: '2026-02-05T09:15:00.000Z',
  });

  const docChunks3 = [
    {
      id: `${docId3}_chunk_0`,
      document_id: docId3,
      content: '## Section 1: Permitted and Prohibited Electrical Appliances\n1.1 Permitted Devices: Students are permitted to operate standard personal electronics: laptops, desktop PCs (power rated under 400W), mobile phone chargers, table study lamps (LED/CFL), and low-wattage grooming trimmers.\n1.2 Strictly Prohibited Appliances: The following high-power resistive and heating equipment are strictly prohibited in residential rooms:\n- Electric room heaters and heat blowers\n- Induction cooktops, immersion water heaters, and electric kettles exceeding 500W\n- Air conditioners and unauthorized desert coolers\n- Electric sandwich toasters and hot plates\n1.3 Confiscation and Fines: Prohibited electrical equipment discovered during routine safety inspections will be confiscated without return until the completion of the degree program. An unauthorized appliance penalty of ₹1,500 will be levied.',
      page_number: 1,
      chunk_index: 0,
      metadata: { section: 'Permitted and Prohibited Electrical Appliances', doc_title: 'Hostel Maintenance & Electrical Appliance Policy' },
    },
    {
      id: `${docId3}_chunk_1`,
      document_id: docId3,
      content: '## Section 2: Maintenance Request Workflow and Turnaround Times\n2.1 Request Submission: All repairs (electrical, plumbing, carpentry, air circulation, mason work) must be submitted via the HostelIQ Complaints module.\n2.2 SLA Guidelines:\n- Emergency Issues (Live sparking, water pipe bursts, elevator stalls): Attended within two (2) hours.\n- High Priority (Fan failure, tube light replacement, lock malfunctions): Attended within 24 hours.\n- Medium/Normal Priority (Furniture touch-up, window mesh repair): Attended within 72 hours.\n2.3 Staff Access: Authorized estate maintenance staff will carry official photo identity badges and will only enter rooms when accompanied by a hostel floor supervisor or the room occupant.',
      page_number: 2,
      chunk_index: 1,
      metadata: { section: 'Maintenance Request Workflow and Turnaround Times', doc_title: 'Hostel Maintenance & Electrical Appliance Policy' },
    },
  ];
  for (const c of docChunks3) {
    documentChunks.push({ ...c, similarity: undefined });
  }
}

function seedAuditLogs() {
  auditLogs.push({
    id: 'audit_demo_1',
    event_type: 'complaint_created',
    details: { tracking_id: 'CMP-2026-0041', category: 'Plumbing' },
    status: 'success',
    timestamp: '2026-10-26T14:20:00.000Z',
  });
  auditLogs.push({
    id: 'audit_demo_2',
    event_type: 'complaint_status_updated',
    details: { tracking_id: 'CMP-2026-0038', new_status: 'Resolved' },
    status: 'success',
    timestamp: '2026-10-26T17:30:00.000Z',
  });
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export { generateId };

// Run seeding once at module load
seedMessMenus();
seedAnnouncements();
seedComplaints();
seedDocumentsAndChunks();
seedAuditLogs();

// ---------------------------------------------------------------------------
// Operational overview computation
// ---------------------------------------------------------------------------

export function getOverview() {
  const complaintsList = [...complaints];
  const total = complaintsList.length;
  const pending = complaintsList.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProg = complaintsList.filter((c) => c.status === 'In Progress').length;
  const resolved = complaintsList.filter((c) => c.status === 'Resolved').length;

  const recentCmp = [...complaintsList]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  const recentAnn = [...announcements]
    .sort((a, b) => (b.is_pinned ? 0 : 1) - (a.is_pinned ? 0 : 1) || (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  // Determine current meal
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }) as string;
  const currentTimeStr = now.toTimeString().slice(0, 5);
  let currentMeal: MessMenuItem | null = null;

  for (const item of messMenus) {
    if (item.day_of_week === currentDay && item.start_time <= currentTimeStr && currentTimeStr <= item.end_time) {
      currentMeal = { ...item, is_active_now: true };
      break;
    }
  }
  if (!currentMeal) {
    for (const item of messMenus) {
      if (item.day_of_week === currentDay && item.meal_type === 'Lunch') {
        currentMeal = { ...item };
        break;
      }
    }
  }

  return {
    total_complaints: total,
    pending_complaints: pending,
    in_progress_complaints: inProg,
    resolved_complaints: resolved,
    active_announcements: announcements.length,
    indexed_documents: documents.filter((d) => d.status === 'indexed').length,
    total_chunks: documentChunks.length,
    current_meal: currentMeal,
    recent_complaints: recentCmp,
    recent_announcements: recentAnn,
    is_demo_mode: true,
  };
}

// ---------------------------------------------------------------------------
// Complaints helpers
// ---------------------------------------------------------------------------

export function createComplaint(data: {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  room_number: string;
  block_name: string;
  student_id: string;
  student_name: string;
}): ComplaintItem {
  complaintSeq += 1;
  const tracking_id = `CMP-2026-${(complaintSeq + 1).toString().padStart(4, '0')}`;
  const id = generateId();
  const timestamp = nowISO();
  const item: ComplaintItem = {
    id,
    tracking_id,
    student_id: data.student_id,
    student_name: data.student_name,
    room_number: data.room_number,
    block_name: data.block_name,
    category: data.category,
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: 'Submitted',
    admin_notes: undefined,
    resolved_at: undefined,
    created_at: timestamp,
    updated_at: timestamp,
  };
  complaints.push(item);
  auditLogs.push({
    id: generateId(),
    event_type: 'complaint_created',
    details: { tracking_id, category: data.category },
    status: 'success',
    timestamp,
  });
  return item;
}

export function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  adminNotes: string | null
): ComplaintItem | null {
  const item = complaints.find((c) => c.id === complaintId || c.tracking_id === complaintId);
  if (!item) return null;

  const timestamp = nowISO();
  const resolved_at = status === 'Resolved' ? timestamp : undefined;
  const updated: ComplaintItem = {
    ...item,
    status,
    admin_notes: adminNotes ?? item.admin_notes,
    resolved_at,
    updated_at: timestamp,
  };
  const idx = complaints.findIndex((c) => c.id === item.id);
  if (idx !== -1) complaints[idx] = updated;

  auditLogs.push({
    id: generateId(),
    event_type: 'complaint_status_updated',
    details: { tracking_id: item.tracking_id, new_status: status },
    status: 'success',
    timestamp,
  });
  return updated;
}

export function getComplaintsForUser(user: User, status?: string, category?: string): ComplaintItem[] {
  let items = [...complaints];
  if (user.role === 'student') {
    items = items.filter((c) => c.student_id === user.id || c.student_name === user.full_name);
  }
  if (status && status !== 'All') items = items.filter((c) => c.status === status);
  if (category && category !== 'All') items = items.filter((c) => c.category === category);
  return items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

// ---------------------------------------------------------------------------
// Mess menu helpers
// ---------------------------------------------------------------------------

export function getWeeklyMenu(): MessMenuItem[] {
  const daysOrder = days;
  const mealsOrder = meals;
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }) as string;
  const currentTimeStr = now.toTimeString().slice(0, 5);

  const results: MessMenuItem[] = [];
  for (const day of daysOrder) {
    for (const meal of mealsOrder) {
      const item = messMenus.find((m) => m.day_of_week === day && m.meal_type === meal);
      if (item) {
        const copy = { ...item };
        if (day === currentDay && copy.start_time <= currentTimeStr && currentTimeStr <= copy.end_time) {
          copy.is_active_now = true;
        }
        results.push(copy);
      }
    }
  }
  return results;
}

export function updateMenuItem(
  day: string,
  meal: string,
  items: string[],
  dietary: { veg: boolean; egg: boolean; dairy: boolean; jain: boolean },
  start_time: string,
  end_time: string
): MessMenuItem {
  const id = `menu_${day.toLowerCase()}_${meal.toLowerCase()}`;
  const updated: MessMenuItem = {
    id,
    day_of_week: day as any,
    meal_type: meal as any,
    start_time,
    end_time,
    items,
    dietary_info: dietary,
  };
  const idx = messMenus.findIndex((m) => m.id === id);
  if (idx !== -1) messMenus[idx] = updated;
  else messMenus.push(updated);

  auditLogs.push({
    id: generateId(),
    event_type: 'menu_updated',
    details: { day, meal },
    status: 'success',
    timestamp: nowISO(),
  });
  return updated;
}

// ---------------------------------------------------------------------------
// Announcements helpers
// ---------------------------------------------------------------------------

export function getAnnouncements(category?: string): AnnouncementItem[] {
  let items = [...announcements];
  if (category && category !== 'All') items = items.filter((a) => a.category === category);
  return items.sort((a, b) => (b.is_pinned ? 0 : 1) - (a.is_pinned ? 0 : 1) || (b.created_at || '').localeCompare(a.created_at || ''));
}

export function createAnnouncement(data: {
  title: string;
  content: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  target_audience: string;
  author_name: string;
}): AnnouncementItem {
  const id = generateId();
  const timestamp = nowISO();
  const item: AnnouncementItem = {
    id,
    title: data.title,
    content: data.content,
    category: data.category as any,
    priority: data.priority as any,
    is_pinned: data.is_pinned,
    target_audience: data.target_audience as any,
    author_name: data.author_name,
    created_at: timestamp,
  };
  announcements.push(item);
  auditLogs.push({
    id: generateId(),
    event_type: 'announcement_created',
    details: { title: item.title, priority: item.priority },
    status: 'success',
    timestamp,
  });
  return item;
}

export function deleteAnnouncement(announcementId: string): boolean {
  const idx = announcements.findIndex((a) => a.id === announcementId);
  if (idx === -1) return false;
  const removed = announcements[idx];
  announcements.splice(idx, 1);
  auditLogs.push({
    id: generateId(),
    event_type: 'announcement_deleted',
    details: { id: announcementId, title: removed.title },
    status: 'success',
    timestamp: nowISO(),
  });
  return true;
}

// ---------------------------------------------------------------------------
// Documents helpers
// ---------------------------------------------------------------------------

export function getDocuments(): DocumentMetadata[] {
  return [...documents];
}

export function deleteDocument(docId: string): boolean {
  const idx = documents.findIndex((d) => d.id === docId);
  if (idx === -1) return false;
  const removed = documents[idx];
  documents.splice(idx, 1);
  const chunkIds = documentChunks.filter((c) => c.document_id === docId).map((c) => c.id);
  for (const cId of chunkIds) {
    const cIdx = documentChunks.findIndex((c) => c.id === cId);
    if (cIdx !== -1) documentChunks.splice(cIdx, 1);
  }
  auditLogs.push({
    id: generateId(),
    event_type: 'document_deleted',
    details: { title: removed.title, doc_id: docId, chunks_removed: chunkIds.length },
    status: 'success',
    timestamp: nowISO(),
  });
  return true;
}

export function getDocumentChunks(docId: string): DocumentChunk[] {
  return documentChunks.filter((c) => c.document_id === docId);
}

export function uploadDocument(data: {
  title: string;
  file_name: string;
  file_size: number;
  category: string;
  chunks: Array<{
    content: string;
    page_number: number;
    chunk_index: number;
    metadata: Record<string, unknown>;
  }>;
  uploaded_by: string;
}): DocumentMetadata {
  const id = generateId();
  const timestamp = nowISO();
  const docMeta: DocumentMetadata = {
    id,
    title: data.title,
    file_name: data.file_name,
    file_size: data.file_size,
    category: data.category as any,
    status: 'indexed',
    chunk_count: data.chunks.length,
    created_at: timestamp,
  };
  documents.push(docMeta);
  for (const c of data.chunks) {
    documentChunks.push({
      id: `${id}_chunk_${c.chunk_index}`,
      document_id: id,
      content: c.content,
      page_number: c.page_number,
      chunk_index: c.chunk_index,
      metadata: c.metadata,
      similarity: undefined,
    });
  }
  auditLogs.push({
    id: generateId(),
    event_type: 'document_uploaded',
    details: { title: data.title, doc_id: id, chunks: data.chunks.length, uploaded_by: data.uploaded_by },
    status: 'success',
    timestamp,
  });
  return docMeta;
}

export function getAuditLogs() {
  return {
    logs: [...auditLogs].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')),
    total_events: auditLogs.length,
  };
}

