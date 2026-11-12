import { BEGINNER_SESSION_ADMISSIONS, type EducationCourse, type EducationLevel } from '../contracts/course';

type Draft = { slug: string; title: string; level: EducationLevel; fee: string; description: string; curriculum: string[]; outcomes: string[]; assessment: string };

const pathway = [
  { slug: 'electronics-fundamentals-circuit-building', title: 'Electronics Fundamentals & Circuit Building', level: 'Beginner' as const },
  { slug: 'electronics-repair-troubleshooting', title: 'Electronics Repair & Troubleshooting', level: 'Intermediate' as const },
];

function createCourse(draft: Draft): EducationCourse {
  const isRepairCourse = draft.slug === 'electronics-repair-troubleshooting';
  const imageBaseName = isRepairCourse ? 'electronics/electronics-repair-troubleshooting' : 'practical-electronics-hero';
  const weeklyCurriculum = draft.curriculum.map((title, index) => ({
    title: `Week ${index + 1}: ${title}`,
    objectives: [`Apply the essential principles of ${title.toLowerCase()} in a safe, low-voltage setting.`],
    activity: `Complete a guided practical exercise for ${title.toLowerCase()}.`,
    deliverable: index === 7 ? 'Final practical assessment evidence and explanation.' : `Week ${index + 1} practical record.`,
    outcome: `Demonstrate safe introductory capability in ${title.toLowerCase()}.`,
  }));
  return {
    slug: draft.slug, title: draft.title, subtitle: 'Coming January 2027 · Registration opening soon', subject: 'Electronics & Engineering', level: draft.level,
    publicationStatus: 'published', availabilityStatus: 'coming-soon', summary: draft.description, description: draft.description,
    learningOutcomes: draft.outcomes, outline: draft.curriculum.map((title) => ({ title, topics: [title] })),
    detailsToConfirm: ['Exact January 2027 start date', 'Registration opening date', 'Instructor-confirmed equipment list', 'Final course approval'],
    accent: draft.level === 'Beginner' ? 'blue' : 'cyan', demo: false, seoIndexable: false,
    image: isRepairCourse ? '/images/institute/electronics/electronics-repair-troubleshooting.webp' : '/images/institute/learning/generated/practical-electronics-hero-1200.webp',
    keywords: ['electronics', 'circuits', 'multimeter', 'soldering', 'troubleshooting', 'January 2027'],
    plannedDetails: {
      provider: 'Techromz Institute of Technology', duration: '8 weeks', cohortCapacity: 'Maximum 30 students',
      admissions: { ...BEGINNER_SESSION_ADMISSIONS, capacityNotice: BEGINNER_SESSION_ADMISSIONS.capacityNotice!.replace('Maximum 20', 'Maximum 30') },
      prerequisites: draft.level === 'Beginner' ? 'No prior electronics experience required' : 'Basic electronics and circuit-building knowledge recommended',
      schedule: 'One 2-hour live Zoom session weekly; exact day and time to be confirmed', totalLiveLearning: '16 hours',
      independentPractice: 'Guided low-voltage practical work between sessions', finalProject: draft.assessment,
      certificate: 'Institute-issued digital PDF Certificate of Completion with QR verification, subject to the published completion policy',
      fee: `${draft.fee} proposed fee · pending approval`, teachingLanguage: 'Sinhala', deliveryMode: 'Live Online via Zoom',
      startTime: '00:00', endTime: '00:00', timeZone: 'Asia/Colombo', heroCopy: draft.description,
      heroTagline: 'Coming January 2027 · Registration opening soon', imageBaseName,
      imageAlt: isRepairCourse ? 'Electronics repair diagnostics workspace with a circuit board, multimeter, microscope, oscilloscope and soldering tools' : 'Safe low-voltage electronics circuit building with a breadboard, components and test equipment, with no visible faces or text',
      admissionFact: 'Registration opening soon',
      facts: [
        { label: 'Launch', value: 'January 2027', icon: 'admission' }, { label: 'Duration', value: '8 weeks', icon: 'duration' },
        { label: 'Live learning', value: '2 hours weekly · 16 hours total', icon: 'learning' }, { label: 'Class size', value: 'Maximum 30 students', icon: 'class-size' },
        { label: 'Language', value: 'Sinhala via Zoom', icon: 'level' },
      ],
      audiences: ['Learners seeking practical electronics foundations', 'Hobbyists developing safe circuit-building or troubleshooting skills', 'Students preparing for further electronics study'],
      requirements: ['A computer or mobile device with stable internet for Zoom', 'A safe workspace for low-voltage exercises', 'Components, digital multimeter, breadboard and tools as specified before registration', 'The exact student equipment list is pending instructor confirmation'],
      requirementNote: 'Practical kits are not included in the proposed fee unless separately confirmed. Learners must not work on live mains-powered appliances or dangerous voltages.',
      learningHeadline: 'Build safe, practical electronics capability through guided work.', learningNote: 'All practical activities are limited to appropriately supervised, low-voltage electronics.',
      curriculumLabel: 'Eight-week curriculum', curriculumHeadline: 'Progress from safe foundations to a final practical assessment.',
      curriculumIntroduction: 'One 2-hour live Sinhala Zoom session is planned each week, supported by guided independent practice.', curriculum: [], weeklyCurriculum,
      projectTitle: draft.assessment, projectIntroduction: 'Complete, document and explain a safe low-voltage practical task that brings together the course skills.',
      projectTopics: draft.curriculum, projectFeatures: ['Safe preparation and tool use', 'Systematic practical work', 'Testing and evidence', 'Clear explanation of results'],
      included: ['Eight live Sinhala Zoom sessions', 'Guided low-voltage practical activities', 'Instructor feedback', 'Final practical assessment', 'One free assessment resubmission when eligible'],
      includedNote: 'Components, tools and kits are not stated as included. The instructor-confirmed equipment list remains pending.',
      recognitionStatement: 'This is an Institute-issued Certificate of Completion. No external accreditation or professional licence is claimed.',
      assessment: [{ label: 'Final practical assessment', weight: 'Minimum 60%' }],
      completionRequirements: ['Attend at least 5 of 8 live sessions', 'Achieve at least 60% on the final practical assessment', 'Complete required safety and practical records'],
      completionPolicyNote: 'One free resubmission is available within 14 calendar days of receiving assessment results.',
      certificateLines: ['Digital PDF Certificate of Completion', 'QR verification through the Institute certificate service', 'No external accreditation claim'],
      pathwayCourses: pathway, practicalActivities: ['Component and circuit inspection', 'Digital multimeter measurements', 'Safe breadboard or circuit-board work', 'Practical documentation and explanation'],
      scopeExclusions: ['Live mains-powered appliance repair', 'Dangerous or high-voltage work', 'Unsupervised work beyond the learner’s competence', 'External accreditation or professional licensing'],
      interestNotice: 'Registration is not open. An enquiry does not apply, reserve a seat, allocate capacity or activate payment. Exact January 2027 dates will be published only after approval.',
      faqs: [
        { question: 'When does this course start?', answer: 'The course is planned for January 2027. The exact date, weekly class time and registration opening date are not yet final.' },
        { question: 'Can I register or pay now?', answer: 'No. Registration and payment are not open, and no seat can be reserved or allocated through this page.' },
        { question: 'Is a practical kit included?', answer: 'No kit is claimed as included in the proposed fee. The exact student equipment list is pending instructor confirmation.' },
        { question: 'Will learners repair mains-powered appliances?', answer: 'No. The course is restricted to safe introductory low-voltage electronics.' },
        { question: 'What certificate is proposed?', answer: 'Eligible learners receive an Institute-issued digital PDF Certificate of Completion with QR verification. No external accreditation is claimed.' },
      ],
    },
  };
}

export const ELECTRONICS_TECHNOLOGY_COURSES: EducationCourse[] = [
  createCourse({ slug: 'electronics-fundamentals-circuit-building', title: 'Electronics Fundamentals & Circuit Building', level: 'Beginner', fee: 'LKR 10,000', description: 'Learn the fundamentals of electronics through practical circuit building, electronic component identification, basic measurements, breadboarding, and introductory soldering skills.', curriculum: ['Introduction to Electronics and Electrical Safety', 'Electronic Components and Circuit Symbols', "Voltage, Current, Resistance and Ohm's Law", 'Breadboards and Basic Circuit Construction', 'Diodes, LEDs, Transistors and Their Applications', 'Soldering Fundamentals and Safe Practical Techniques', 'Building a Small Electronics Project', 'Final Practical Circuit-Building Assessment'], outcomes: ['Identify common electronic components', 'Understand basic electronic circuit principles', 'Use a digital multimeter for fundamental measurements', 'Construct simple low-voltage electronic circuits', 'Complete and explain a practical electronics project'], assessment: 'Final practical circuit-building assessment' }),
  createCourse({ slug: 'electronics-repair-troubleshooting', title: 'Electronics Repair & Troubleshooting', level: 'Intermediate', fee: 'LKR 20,000', description: 'Develop practical skills in diagnosing electronic faults, testing components, inspecting circuit boards, identifying common failures, and conducting introductory low-voltage electronics repairs.', curriculum: ['Electronics Repair Tools and Workshop Safety', 'Multimeter Testing and Diagnostic Techniques', 'Identifying Common Electronic Faults', 'Printed Circuit Board Inspection and Fault Identification', 'Component Testing and Failure Analysis', 'Basic Soldering and Component Replacement', 'Practical Low-Voltage Device Troubleshooting', 'Final Fault-Diagnosis and Repair Assessment'], outcomes: ['Recognize common electronic faults', 'Use basic electronic diagnostic equipment', 'Test selected electronic components', 'Inspect circuit boards systematically', 'Perform safe introductory low-voltage repairs', 'Document and explain troubleshooting results'], assessment: 'Final fault-diagnosis and repair assessment' }),
];
