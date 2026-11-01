/**
 * Single source of truth for all site copy and practice data.
 * Anything marked TODO must be confirmed with Dr. Gupta's clinic before launch
 * (see docs/CONTENT_TODO.md). The UI handles missing values gracefully:
 * - a location with `opd: null` shows "Call to confirm timings"
 * - the reviews section hides quote cards until `reviews` has real text
 */

export const doctor = {
  name: 'Dr. Siddharth Gupta',
  shortTitle: 'Orthopaedic & Robotic Joint Surgeon',
  qualifications: 'MBBS, MS (Orthopaedics)',
  registration: 'WBMC Reg. No. 69329',
  languages: null as string | null, // TODO: e.g. 'Bengali · Hindi · English'
  phonePrimary: '+91 88302 58641',
  phonePrimaryHref: 'tel:+918830258641',
  whatsapp: '+91 91300 88422',
  whatsappNumber: '919130088422',
  email: 'siddharthguptaortho@gmail.com',
  clinic: {
    name: 'ACESO Multispeciality Clinic',
    address: '4 Gobindo Banerjee Lane, Bandhaghat, Howrah, West Bengal 711106',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=ACESO+Multispeciality+Clinic+Bandhaghat+Howrah',
  },
  robots: ['MAKO', 'VELYS', 'CUVIS'],
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${doctor.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Figures carried over from the existing website — TODO: confirm with Dr. Gupta before launch. */
export const stats = [
  { value: 4590, suffix: '+', label: 'Joint replacement surgeries' },
  { value: 4500, suffix: '+', label: 'Sports arthroscopy surgeries' },
  { value: 9950, suffix: '+', label: 'Trauma surgeries' },
  { value: 7, suffix: '', label: 'Hospitals & clinics' },
];

export type Location = {
  id: string;
  name: string;
  area: string;
  opd: string | null; // TODO: real OPD days & times, e.g. 'Mon & Thu · 5–8 pm'
  byAppointment?: boolean;
  mapsQuery: string;
};

export const locations: Location[] = [
  { id: 'aceso', name: 'ACESO Clinic', area: 'Bandhaghat, Howrah', opd: null, mapsQuery: 'ACESO Multispeciality Clinic Bandhaghat Howrah' },
  { id: 'ils-howrah', name: 'ILS Hospital', area: 'Howrah', opd: null, mapsQuery: 'ILS Hospital Howrah' },
  { id: 'ils-dumdum', name: 'ILS Hospital', area: 'Dum Dum', opd: null, mapsQuery: 'ILS Hospital Dum Dum' },
  { id: 'ils-saltlake', name: 'ILS Hospital', area: 'Salt Lake', opd: null, byAppointment: true, mapsQuery: 'ILS Hospital Salt Lake' },
  { id: 'amri', name: 'AMRI Hospital', area: 'Mukundapur', opd: null, mapsQuery: 'AMRI Hospital Mukundapur' },
  { id: 'bellevue', name: 'Belle Vue Clinic', area: 'Kolkata', opd: null, mapsQuery: 'Belle Vue Clinic Kolkata' },
  { id: 'kothari', name: 'Kothari Medical Centre', area: 'Kolkata', opd: null, mapsQuery: 'Kothari Medical Centre Kolkata' },
];

export const opdLabel = (l: Location) => l.opd ?? (l.byAppointment ? 'By appointment' : 'Call to confirm timings');

export type Area = {
  id: string;
  title: string;
  kicker: string;
  headline: string;
  conditions: string[];
  treatments: string[];
  when: string;
  robotic: boolean;
};

export const areas: Area[] = [
  { id: 'knee', title: 'Knee', kicker: 'KNEE', robotic: true, headline: 'Knee pain on stairs, swelling, or a knee that gives way.', conditions: ['Osteoarthritis', 'ACL tears', 'Meniscus tears', 'Kneecap problems'], treatments: ['Physiotherapy & injections', 'Arthroscopic repair', 'ACL reconstruction', 'Robotic knee replacement'], when: 'See a specialist if pain lasts beyond a few weeks, or the knee locks, swells or gives way.' },
  { id: 'hip', title: 'Hip', kicker: 'HIP', robotic: true, headline: 'Groin or hip pain that limits walking, sitting or sleep.', conditions: ['Hip arthritis', 'Avascular necrosis', 'Hip fractures', 'Failed replacement'], treatments: ['Medication & rehab', 'Hip arthroscopy', 'Robotic hip replacement', 'Revision surgery'], when: 'See a specialist if hip pain stops you walking comfortably or wakes you at night.' },
  { id: 'shoulder', title: 'Shoulder', kicker: 'SHOULDER', robotic: false, headline: 'Pain lifting your arm, stiffness, or a shoulder that slips out.', conditions: ['Frozen shoulder', 'Rotator cuff tears', 'Dislocation', 'Impingement'], treatments: ['Targeted physiotherapy', 'Guided injections', 'Arthroscopic cuff repair', 'Stabilisation surgery'], when: 'See a specialist after a dislocation, or if you cannot lift your arm above shoulder height.' },
  { id: 'sports', title: 'Sports', kicker: 'SPORTS INJURIES', robotic: false, headline: 'Back to your sport — safely, on a clear timeline.', conditions: ['Ligament injuries', 'Cartilage damage', 'Tendon tears', 'Overuse injuries'], treatments: ['Return-to-play rehab', 'Arthroscopy', 'Ligament reconstruction', 'Tendon repair'], when: 'See a specialist if you heard a pop, the joint swelled quickly, or it feels unstable.' },
  { id: 'spine', title: 'Spine', kicker: 'SPINE & SCOLIOSIS', robotic: false, headline: 'Back or neck pain, nerve pain down the leg, or spinal curvature.', conditions: ['Slipped disc', 'Spinal stenosis', 'Scoliosis', 'Spinal fractures'], treatments: ['Conservative care', 'Pain interventions', 'Decompression surgery', 'Deformity correction'], when: 'Seek urgent care for leg weakness or loss of bladder or bowel control.' },
  { id: 'fractures', title: 'Fractures', kicker: 'TRAUMA', robotic: false, headline: 'Broken bones and complex injuries, treated promptly.', conditions: ['Fractures', 'Complex injuries', 'Non-healing fractures', 'Bone infections'], treatments: ['Emergency fixation', 'Plating & nailing', 'Reconstruction', 'Infection management'], when: 'For an injury that just happened, call directly — do not wait for an online booking.' },
];

export const kneeStages = [
  { title: 'Worn cartilage', body: "Arthritis wears away the knee's cushioning cartilage. Bone rubs on bone — causing pain, stiffness and deformity." },
  { title: '3D scan & plan', body: 'A CT scan builds a 3D model of your knee. Implant size, position and every cut are planned before surgery.' },
  { title: 'Robot-guided cuts', body: 'Dr. Gupta removes only the damaged surfaces. The robotic arm keeps each cut inside the planned boundary.' },
  { title: 'Implant fitted', body: 'Metal components cap the bone ends, with a smooth medical-grade insert between them.' },
  { title: 'Aligned & moving', body: 'A balanced, aligned knee — followed by physiotherapy to get you walking again.' },
];

export type Review = { name: string; text: string; treatment?: string };
/** TODO: paste 3–6 real Google review excerpts (with permission). Cards stay hidden while empty. */
export const reviews: Review[] = [];
export const googleRating: { rating: string; count: string; url: string } | null = null; // TODO

export const training = [
  { kind: 'MBBS', title: 'IPGME&R & SSKM Hospital', place: 'Kolkata' },
  { kind: 'MS (ORTHOPAEDICS)', title: 'Government Medical College & Hospital', place: 'Nagpur · 2015–2018' },
  { kind: 'FELLOWSHIP', title: 'APOA-SIAA Arthroplasty Fellowship', place: 'Primary, complex & revision hip and knee, navigation and robotics — Sunshine (Hyderabad), Sparsh (Bangalore), AJRI (Chennai), Ganga Hospital (Coimbatore)' },
  { kind: 'INTERNATIONAL', title: "Arthroplasty & Arthroscopy — King's College Hospital NHS", place: 'PRUH & Orpington, United Kingdom' },
  { kind: 'INTERNATIONAL', title: 'Advanced Arthroscopy — shoulder, hip & knee', place: 'Barcelona, Spain' },
  { kind: 'FELLOWSHIP', title: 'Scoliosis & spine', place: 'OSS / Scoliosis Research Society' },
  { kind: 'ROBOTICS', title: 'MAKO · VELYS · CUVIS', place: 'Robotic joint replacement systems' },
];

export const memberships = [
  'Indian Orthopaedic Association', 'Asia Pacific Orthopaedic Association (YSF)', 'Asia Pacific Spine Society',
  'Indian Arthroplasty Association', 'Indian Arthroscopy Society', 'Association of Spine Surgeons of India',
  'West Bengal Arthroplasty Society', 'ISKSAA', 'ISHKS', 'APKAS', 'Karnataka Orthopaedic Association', 'AOTS',
];

export const awards = [
  { year: '2022', title: 'SITS Trauma Case Hunt', note: 'Winner' },
  { year: '2017', title: 'VOSCON Quiz', note: 'Winner' },
];

export const cases = [
  { tag: 'HIP · TRAUMA', title: 'Navigating complex proximal femur fractures in patients with a fused hip and spine', url: 'https://drsiddharthguptaortho.in/navigating-complex-proximal-femur-fractures-in-patients-with-fused-hip-and-spine/' },
  { tag: 'KNEE · SPORTS', title: 'An innovative approach to a neglected patellar tendon tear', url: 'https://drsiddharthguptaortho.in/innovative-approach-to-treating-a-neglected-patella-tendon-tear-a-case-study/' },
  { tag: 'KNEE · INFECTION', title: "Advanced active Koch's knee with bone destruction: can arthroplasty be a solution?", url: 'https://drsiddharthguptaortho.in/addressing-advanced-active-kochs-knee-with-bone-destruction-can-arthroplasty-be-a-solution/' },
];

export const roboticFaqs = [
  { q: 'Does the robot do the operation?', a: 'No. Dr. Gupta performs the surgery. The robotic arm is a tool that helps carry out the pre-planned cuts accurately, within set boundaries.' },
  { q: 'Am I too old, or too young, for a replacement?', a: 'Age alone does not decide it. Your symptoms, imaging, general health and activity goals do — discussed at your consultation.' },
  { q: 'How long will I stay in hospital?', a: 'It depends on your health and the procedure. Dr. Gupta will give you a personal estimate at consultation.' }, // TODO: typical stay
  { q: 'What does it cost? Is insurance accepted?', a: 'Costs vary by hospital, implant and insurance. The clinic team will share an estimate and cashless options after your consultation.' }, // TODO: ranges
  { q: 'Can both knees be done together?', a: 'Sometimes. It depends on your overall health and is decided case by case.' },
];

export const robotSystems = [
  { name: 'MAKO', use: 'Knee & hip replacement' }, // TODO: confirm uses + which hospital has which system
  { name: 'VELYS', use: 'Knee replacement' },
  { name: 'CUVIS', use: 'Knee replacement' },
];

/** Home page copy. Plain, factual wording — no superlatives (NMC advertising norms). */
export const home = {
  hero: {
    eyebrow: 'Consultant Orthopaedic Surgeon · Kolkata & Howrah',
    /** the H1 reads as one sentence; the second part is set in the accent colour */
    title: 'Robotic knee and hip replacement,',
    titleAccent: 'and complete orthopaedic care.',
    lead: 'consultant orthopaedic surgeon for joint replacement, sports injuries, spine and trauma, consulting at seven hospitals and clinics in Kolkata & Howrah.',
    robots: 'Trained on MAKO, VELYS and CUVIS robotic systems.',
    credentials: ['MS (Orthopaedics)', 'APOA-SIAA Arthroplasty Fellowship', "King's College Hospital NHS, UK", 'MAKO · VELYS · CUVIS trained'],
  },
  services: { eyebrow: 'Areas of practice', title: 'From sports injury to joint replacement', intro: 'Choose an area to see common conditions, when to see a specialist, and the treatment options.' },
  about: {
    eyebrow: 'About Dr. Gupta',
    overlay: { k: 'Trained at', v: "King's College Hospital NHS, UK", note: 'Arthroplasty & arthroscopy' },
    questions: 'For any questions',
    title: 'Trained in India, the United Kingdom and Spain. Practising in Kolkata.',
    body: "Arthroplasty fellowship across Hyderabad, Bangalore, Chennai and Coimbatore; arthroplasty and arthroscopy at King's College Hospital NHS, UK; advanced arthroscopy in Barcelona. Today a consultant at ILS Hospitals, AMRI, Belle Vue Clinic and Kothari Medical Centre.",
  },
  /** "Approach" section. Every line is reused from copy already on the site (Robotic page, CTA band) —
   * TODO: confirm the wording with Dr. Gupta before launch. */
  approach: {
    eyebrow: 'Approach',
    title: 'Not every painful joint needs an operation.',
    intro: "Most consultations end with a plan that doesn't involve an operation.",
    items: [
      { t: 'Surgery is the last step, not the first', b: 'Replacement is considered only after medicines, physiotherapy and injections stop helping. Dr. Gupta decides after examining you and reviewing your imaging.' },
      { t: 'Planned to your anatomy', b: 'A 3D model of your joint guides implant size and position before surgery.' },
      { t: 'The surgeon stays in control', b: 'Dr. Gupta performs every step; the robotic arm keeps each cut within the planned boundary.' },
    ],
  },
  conditions: { eyebrow: 'Conditions & treatments', title: 'Conditions we treat', intro: 'Choose an area to see common conditions, when to see a specialist, and the treatment options — most of which do not involve surgery.' },
  locations: { eyebrow: 'Where to consult', title: 'Seven hospitals and clinics in Kolkata & Howrah' },
  reviews: { eyebrow: 'Patient reviews', title: 'What patients say', empty: 'Patients across Kolkata & Howrah have shared their experience of treatment with Dr. Gupta on Google.' },
  cases: { eyebrow: 'Case studies', title: 'From the operating theatre', newTab: '(opens in a new tab)' },
};

/** Inner-page copy (About, Robotic, Book, 404). Same rules as `home`: factual, no superlatives. */
export const pages = {
  about: {
    eyebrow: 'About · Consultant Orthopaedic Surgeon',
    lead: 'Consultant orthopaedic surgeon in Kolkata and Howrah — robotic joint replacement, sports injuries and arthroscopy, trauma, and spine and deformity correction.',
    photoCaption: 'MBBS, MS (Orthopaedics) · Consultant Orthopaedic Surgeon',
    training: { eyebrow: 'Training', title: 'Trained across India, the United Kingdom and Spain' },
    hospitals: { eyebrow: 'Hospitals', title: 'Consultant at' },
    memberships: { eyebrow: 'Memberships', title: 'Professional societies' },
    awards: { eyebrow: 'Recognition', title: 'Awards' },
  },
  robotic: {
    eyebrow: 'MAKO · VELYS · CUVIS trained',
    title: 'Robotic joint replacement',
    lead: 'Your knee or hip is mapped in 3D before surgery. In theatre, a robotic arm keeps every cut within that plan — while Dr. Gupta performs the operation.',
    photoCaption: 'Dr. Siddharth Gupta in the operating theatre',
    plan: [
      { t: 'Mapped to your anatomy', b: 'A 3D model of your joint guides implant size and position.' },
      { t: 'Cuts kept within the plan', b: 'The robotic arm limits each cut to the planned boundary.' },
      { t: 'Surgeon in control', b: 'Dr. Gupta performs every step; the robot adds precision.' },
      { t: 'Soft tissue spared where possible', b: 'Precise cuts aim to protect surrounding ligaments.' },
    ],
    candidate: {
      eyebrow: 'Is it right for me?',
      title: 'You may be a candidate if…',
      items: [
        'Knee or hip pain that limits walking, stairs or sleep',
        'Pain that continues despite medicines, physio or injections',
        'X-rays showing advanced arthritis or joint damage',
        'A bowed or stiff knee changing how you walk',
        'An earlier replacement that has become painful or loose',
      ],
      note: 'Replacement is considered only after medicines, physiotherapy and injections stop helping. Dr. Gupta decides after examining you and reviewing your imaging.',
    },
    systems: { eyebrow: 'Robotic systems', title: 'Three systems, one surgeon', intro: 'Which system is used depends on your joint and the hospital you choose — explained at your consultation.' },
    faq: { eyebrow: 'Questions', title: 'Before you decide' },
    cta: { title: 'Find out if robotic replacement suits you.', body: "Bring your latest X-rays. If you don't need surgery yet, you'll leave with a plan that doesn't involve one." },
  },
  book: {
    eyebrow: 'Book an appointment',
    title: "Choose where and when. We'll confirm.",
    lead: 'Pick a hospital or clinic, a day and a session. Your request opens in WhatsApp for the clinic team to confirm a time.',
  },
  notFound: {
    eyebrow: 'Error 404 · Page not found',
    title: 'This page has moved.',
    body: 'The site has a new look. Head home, or book an appointment directly.',
  },
};
