import type { EducationCourse, EducationLevel, EducationWeeklyCourseSession } from '../contracts/course';

type AyurvedaCourseDraft = {
  slug: string;
  title: string;
  subtitle: string;
  level: EducationLevel;
  summary: string;
  focus: string[];
  activities: string[];
  assessment: string;
  boundaries: string;
  careerApplications: string[];
};

const approvedImages: Record<string, { baseName: string; alt: string }> = {
  'foundations-of-ayurveda-wellness': { baseName: 'foundations-of-ayurveda-wellness', alt: 'Illustrative Ayurveda foundations study workspace with herbal materials, books and traditional wellness objects' },
  'ayurveda-centre-operations-patient-care': { baseName: 'ayurveda-centre-operations-patient-care', alt: 'Illustrative Ayurveda centre reception and patient-care coordination workspace' },
  'ayurveda-therapy-assistance-safety': { baseName: 'ayurveda-therapy-assistance-safety', alt: 'Illustrative Ayurveda therapy preparation setting with an intact brass oil pot, safety materials and treatment-room equipment' },
};

const pathway = [
  { slug: 'foundations-of-ayurveda-wellness', title: 'Foundations of Ayurveda & Wellness', level: 'Beginner' as const },
  { slug: 'ayurveda-centre-operations-patient-care', title: 'Ayurveda Centre Operations & Patient Care', level: 'Beginner' as const },
  { slug: 'ayurveda-therapy-assistance-safety', title: 'Ayurveda Therapy Assistance & Safety', level: 'Intermediate' as const },
  { slug: 'medicinal-plants-herbal-materials', title: 'Medicinal Plants & Herbal Materials', level: 'Beginner' as const },
  { slug: 'ayurvedic-product-manufacturing-gmp', title: 'Ayurvedic Product Manufacturing & GMP', level: 'Intermediate' as const },
  { slug: 'ayurvedic-product-quality-regulatory-compliance', title: 'Ayurvedic Product Quality Assurance & Regulatory Compliance', level: 'Advanced' as const },
];

const publicationStatuses: Partial<Record<string, EducationCourse['publicationStatus']>> = {
  'medicinal-plants-herbal-materials': 'unpublished',
  'ayurvedic-product-manufacturing-gmp': 'unpublished',
  'ayurvedic-product-quality-regulatory-compliance': 'unpublished',
};

const sessionThemes = [
  'Scope, terminology and professional boundaries',
  'Foundational concepts and industry context',
  'Safe workplace preparation',
  'Materials, records and traceability',
  'Quality, hygiene and risk awareness',
  'Communication, coordination and escalation',
  'Applied case study and documentation',
  'Portfolio review and practical assessment',
];

function sessions(draft: AyurvedaCourseDraft): EducationWeeklyCourseSession[] {
  return sessionThemes.map((title, index) => ({
    title: `Proposed session ${index + 1}: ${title}`,
    objectives: [draft.focus[index % draft.focus.length], draft.focus[(index + 1) % draft.focus.length]],
    activity: draft.activities[index % draft.activities.length],
    deliverable: `Provisional portfolio record ${index + 1}: observation, safety check, documentation and reflection.`,
    outcome: `Apply the session concepts within an appropriate non-clinical, supervised or manufacturing-support boundary.`,
  }));
}

function createCourse(draft: AyurvedaCourseDraft): EducationCourse {
  const weeklyCurriculum = sessions(draft);
  const approvedImage = approvedImages[draft.slug];
  return {
    slug: draft.slug,
    publicationStatus: publicationStatuses[draft.slug] ?? 'published',
    title: draft.title,
    subtitle: draft.subtitle,
    subject: 'Ayurveda & Wellness',
    level: draft.level,
    summary: draft.summary,
    description: draft.summary,
    learningOutcomes: [
      `Explain key ${draft.title.toLowerCase()} concepts using appropriate industry terminology`,
      'Use hygiene, safety, documentation and escalation practices appropriate to the learner role',
      'Recognise professional boundaries and refer clinical or regulated decisions to appropriately qualified people',
      `Complete the proposed ${draft.assessment.toLowerCase()}`,
    ],
    outline: weeklyCurriculum.map((session) => ({ title: session.title, topics: session.objectives })),
    detailsToConfirm: ['Academic and subject-matter review', 'Delivery format and schedule', 'Entry requirements', 'Assessment and certificate policy'],
    accent: draft.level === 'Advanced' ? 'indigo' : draft.level === 'Intermediate' ? 'cyan' : 'blue',
    demo: false,
    seoIndexable: false,
    image: approvedImage ? `/images/institute/ayurveda/${approvedImage.baseName}.webp` : '/images/institute/learning/generated/collaborative-learning-960.webp',
    keywords: ['Ayurveda education', 'wellness services', 'herbal manufacturing', 'planned course', draft.title],
    plannedDetails: {
      provider: 'Techromz Institute',
      duration: 'To be approved',
      cohortCapacity: 'Capacity to be approved',
      prerequisites: 'Entry requirements to be approved',
      schedule: 'Schedule to be approved',
      totalLiveLearning: 'Learning hours to be approved',
      independentPractice: 'Guided practical and portfolio activities, subject to approval',
      finalProject: draft.assessment,
      certificate: 'Institute completion certificate, subject to course and completion-policy approval',
      teachingLanguage: 'To be announced',
      deliveryMode: 'To be announced',
      startTime: '00:00',
      endTime: '00:00',
      timeZone: 'Asia/Colombo',
      heroCopy: `${draft.summary} This is a proposed, enquiry-only programme awaiting academic and commercial approval.`,
      heroTagline: 'Professional education for responsible Ayurveda and wellness-sector practice.',
      imageBaseName: approvedImage ? `ayurveda/${approvedImage.baseName}` : 'collaborative-learning',
      imageAlt: approvedImage?.alt ?? 'Professional learning environment representing responsible Ayurveda, wellness and documented practical work',
      admissionFact: 'Approval pending',
      facts: [
        { label: 'Level', value: draft.level, icon: 'level' },
        { label: 'Status', value: 'Planned', icon: 'admission' },
        { label: 'Schedule', value: 'To be approved', icon: 'duration' },
        { label: 'Learning format', value: 'To be approved', icon: 'learning' },
      ],
      audienceHeadline: 'For learners exploring responsible non-clinical, operational or manufacturing-support roles.',
      audiences: [
        'People interested in Ayurveda and professional wellness-sector services.',
        'Team members supporting Ayurveda centres, herbal-material operations or regulated manufacturing environments.',
        'Learners who understand that clinical and regulated decisions remain with appropriately qualified professionals.',
      ],
      requirements: [
        'No prior clinical qualification is assumed unless final entry requirements state otherwise',
        'Commitment to hygiene, confidentiality, safety and accurate documentation',
        'Willingness to work within non-clinical or supervised role boundaries',
      ],
      requirementNote: draft.boundaries,
      learningHeadline: `Develop practical ${draft.level.toLowerCase()} knowledge for responsible Ayurveda and wellness-sector work.`,
      learningNote: 'The curriculum is a proposal for academic review. It does not include diagnosis, prescribing, independent clinical treatment or unsupported therapeutic claims.',
      curriculumHeadline: 'A provisional eight-session learning sequence.',
      curriculumIntroduction: 'The sessions provide a structured curriculum proposal; they do not confirm course duration, timetable or delivery mode.',
      curriculumNote: 'Session titles, activities and assessment arrangements remain subject to academic, regulatory and commercial approval.',
      curriculum: [],
      weeklyCurriculum,
      projectTitle: draft.assessment,
      projectIntroduction: `Bring the proposed learning together in a documented ${draft.assessment.toLowerCase()} using fictional, simulated or appropriately supervised scenarios.`,
      projectTopics: [],
      projectFeatures: ['Scope and role-boundary statement', 'Safety and hygiene checklist', 'Structured records and traceability evidence', 'Case-study or simulated practical activity', 'Reflection and escalation decisions'],
      practicalActivities: draft.activities,
      careerApplications: draft.careerApplications,
      included: ['Proposed guided learning sessions', 'Case studies and simulated workplace activities', 'Safety and documentation checklists', 'Portfolio and assessment guidance'],
      includedNote: 'No facility access, clinical placement, factory training, internship, employment, equipment access or industry partnership is promised.',
      recognitionStatement: 'This proposed course is not government accredited and does not confer a clinical, pharmacy, regulatory, therapist or quality-auditor licence.',
      assessment: [{ label: 'Guided practical activities', weight: 'Approach to be approved' }, { label: draft.assessment, weight: 'Requirements to be approved' }],
      completionRequirements: ['Completion rules to be approved', 'Assessment criteria to be approved', 'Certificate eligibility to be approved'],
      completionPolicyNote: 'No attendance threshold, pass mark, resubmission rule or certificate entitlement is confirmed for this planned course.',
      assessmentNote: draft.boundaries,
      pathwayCourses: pathway,
      scopeExclusions: ['Diagnosis or prescribing', 'Independent clinical treatment', 'Unsupervised medicinal preparation', 'Professional licensing or government accreditation claims'],
      interestNotice: 'This course is planned. An enquiry does not reserve a seat, activate admission or payment, or confirm a fee, date, duration, lecturer or capacity.',
      faqs: [
        { question: 'Is this course open for enrolment or payment?', answer: 'No. It is a planned, enquiry-only course. Fees, dates, duration, capacity, lecturer arrangements and admissions are not approved.' },
        { question: 'Does completion qualify me to diagnose, prescribe or practise Ayurveda independently?', answer: 'No. The proposed programme does not grant clinical authority, professional registration or permission to diagnose, prescribe or provide independent treatment.' },
        { question: 'Is the course accredited or government approved?', answer: 'No accreditation, government recognition or professional-body approval is claimed. Any future recognition statement would require documentary verification and specific authorisation.' },
        { question: 'What practical learning is proposed?', answer: `Proposed activities include ${draft.activities.join(', ').toLowerCase()}. Final facilities, supervision and delivery arrangements remain unapproved.` },
        { question: 'What certificate will be issued?', answer: 'Certificate wording and eligibility remain subject to course approval and the Institute completion policy. No professional licence or regulated status is conferred.' },
      ],
    },
  };
}

export const AYURVEDA_WELLNESS_COURSES: EducationCourse[] = [
  createCourse({ slug: 'foundations-of-ayurveda-wellness', title: 'Foundations of Ayurveda & Wellness', subtitle: 'Understand foundational principles, terminology and responsible wellness-sector boundaries', level: 'Beginner', summary: 'An introduction to Ayurveda, its historical foundations, modern wellness-service contexts, professional ethics, hygiene, safety and the limits of non-clinical practice.', focus: ['Introduction to Ayurveda', 'History and foundational principles', 'Ayurveda and modern wellness services', 'Professional ethics', 'Basic terminology', 'Wellness industry roles', 'Hygiene and safety awareness', 'Limits of non-clinical practice'], activities: ['Industry case studies', 'Ayurveda terminology exercises', 'Wellness service identification', 'Safety and professional-boundary exercises'], assessment: 'Foundations of Ayurveda & Wellness portfolio', boundaries: 'This course provides introductory, non-clinical education and does not qualify learners to diagnose, prescribe or independently provide treatment.', careerApplications: ['Entry-level awareness for wellness-service support roles', 'Foundation for further approved study in Ayurveda operations or herbal manufacturing', 'Improved communication and safety awareness in non-clinical settings'] }),
  createCourse({ slug: 'ayurveda-centre-operations-patient-care', title: 'Ayurveda Centre Operations & Patient Care', subtitle: 'Support safe, confidential and well-coordinated Ayurveda centre services', level: 'Beginner', summary: 'Practical education in centre organisation, reception, appointments, communication, confidentiality, records, scheduling, hygiene and support for registered healthcare professionals.', focus: ['Ayurveda centre organisation', 'Reception and appointments', 'Patient and client communication', 'Professional ethics and confidentiality', 'Record handling', 'Treatment scheduling and coordination', 'Hygiene and safety', 'Supporting registered healthcare professionals'], activities: ['Simulated reception', 'Appointment management', 'Patient-service scenarios', 'Centre documentation'], assessment: 'Ayurveda centre operations simulation', boundaries: 'Patient care means appropriate non-clinical support and coordination. This course does not qualify learners to diagnose, prescribe or independently provide clinical care.', careerApplications: ['Reception and service coordination in wellness settings', 'Administrative support under approved workplace procedures', 'Patient-record and appointment support within confidentiality requirements'] }),
  createCourse({ slug: 'ayurveda-therapy-assistance-safety', title: 'Ayurveda Therapy Assistance & Safety', subtitle: 'Prepare therapy environments and support qualified professionals safely', level: 'Intermediate', summary: 'Applied learning in treatment-room preparation, infection prevention, equipment handling, dignity, privacy, safety procedures, scheduling and reporting safety concerns.', focus: ['Ayurveda therapy environment', 'Treatment-room preparation', 'Hygiene and infection prevention', 'Equipment handling', 'Patient dignity and privacy', 'Safety procedures', 'Therapy scheduling and coordination', 'Working under appropriately qualified professionals', 'Recognition and reporting of safety concerns'], activities: ['Treatment-room preparation simulation', 'Safety checklist practice', 'Equipment-cleaning procedures', 'Supervised support-role scenarios'], assessment: 'Therapy environment preparation and safety assessment', boundaries: 'This course does not teach or authorise independent treatment, diagnosis, prescribing or a professional massage-therapy qualification. Support activities must remain under appropriately qualified supervision.', careerApplications: ['Therapy-room preparation and safety support', 'Hygiene and equipment-care assistance', 'Coordination and concern-reporting within supervised environments'] }),
  createCourse({ slug: 'medicinal-plants-herbal-materials', title: 'Medicinal Plants & Herbal Materials', subtitle: 'Handle, inspect, store and document herbal materials responsibly', level: 'Beginner', summary: 'An introduction to medicinal plants, common herbal raw materials, identification principles, responsible sourcing, receiving, inspection, drying, storage, contamination prevention and traceability.', focus: ['Introduction to medicinal plants', 'Common herbal raw materials', 'Botanical identification principles', 'Responsible sourcing', 'Raw-material receiving and inspection', 'Drying and storage fundamentals', 'Contamination prevention', 'Traceability and documentation', 'Safe handling of herbal materials'], activities: ['Herbal-material identification exercises', 'Storage simulations', 'Raw-material inspection records', 'Material-traceability exercises'], assessment: 'Herbal material handling and documentation portfolio', boundaries: 'The course does not make therapeutic-efficacy claims or encourage unsupervised medicinal preparation. Identification and handling exercises require appropriate controls and supervision.', careerApplications: ['Herbal raw-material receiving and stores support', 'Traceability and documentation assistance', 'Responsible sourcing and contamination-prevention awareness'] }),
  createCourse({ slug: 'ayurvedic-product-manufacturing-gmp', title: 'Ayurvedic Product Manufacturing & GMP', subtitle: 'Understand documented production workflows and Good Manufacturing Practices', level: 'Intermediate', summary: 'Applied education in Ayurvedic manufacturing workflow, GMP principles, facility and equipment hygiene, raw-material handling, batch documentation, packaging, labelling, traceability and workplace safety.', focus: ['Ayurvedic manufacturing processes', 'Production workflow', 'Good Manufacturing Practices', 'Facility and equipment hygiene', 'Raw-material handling', 'Batch documentation', 'Packaging and labelling', 'Production traceability', 'Workplace safety', 'Quality responsibilities'], activities: ['Manufacturing-workflow simulation', 'Batch-record preparation', 'Packaging inspection', 'Production-hygiene assessment'], assessment: 'Documented Ayurvedic manufacturing process project', boundaries: 'Studying GMP does not provide GMP certification and does not mean a learner, product or associated business is GMP-certified. Regulated work remains subject to applicable approvals and qualified oversight.', careerApplications: ['Production documentation and workflow support', 'Packaging and labelling inspection assistance', 'Manufacturing hygiene and traceability awareness'] }),
  createCourse({ slug: 'ayurvedic-product-quality-regulatory-compliance', title: 'Ayurvedic Product Quality Assurance & Regulatory Compliance', subtitle: 'Build advanced awareness of product quality systems and Sri Lankan regulatory processes', level: 'Advanced', summary: 'Advanced proposed learning in quality systems, specifications, batch records, deviations, corrective actions, traceability, label review, Sri Lankan regulatory awareness, registration processes and compliance responsibilities.', focus: ['Quality assurance systems', 'Quality control fundamentals', 'Raw-material and finished-product specifications', 'Batch records', 'Documentation systems', 'Deviations and corrective actions', 'Product traceability', 'Label review', 'Regulatory awareness in Sri Lanka', 'Product registration processes', 'Manufacturing compliance responsibilities'], activities: ['Quality-documentation exercises', 'Batch-review simulations', 'Product-label evaluation', 'Compliance case studies', 'Mock quality audit'], assessment: 'Herbal product quality and compliance portfolio', boundaries: 'Course completion does not authorise a learner to act as a registered regulatory professional, pharmacist, medical practitioner or certified quality auditor. Current official requirements and qualified advice remain essential.', careerApplications: ['Quality documentation and batch-review support', 'Label and traceability review assistance', 'Compliance coordination under authorised quality and regulatory leadership'] }),
];
