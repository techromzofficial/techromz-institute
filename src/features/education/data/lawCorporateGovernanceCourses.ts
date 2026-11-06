import type { EducationCourse, EducationLevel, EducationWeeklyCourseSession } from '../contracts/course';

type Draft = {
  slug: string; title: string; subtitle: string; level: EducationLevel; proposedFee: string;
  summary: string; focus: string[]; project: string; imageBaseName: string; imageAlt: string;
};

const pathway = [
  { slug: 'business-company-law-kickstart', title: 'Business & Company Law', level: 'Beginner' as const },
  { slug: 'contracts-legal-documentation-kickstart', title: 'Contracts & Legal Documentation', level: 'Beginner' as const },
  { slug: 'corporate-governance-compliance-lab', title: 'Corporate Governance & Compliance', level: 'Intermediate' as const },
  { slug: 'employment-workplace-law-lab', title: 'Employment & Workplace Law', level: 'Intermediate' as const },
  { slug: 'commercial-law-dispute-resolution', title: 'Commercial Law & Dispute Resolution', level: 'Advanced' as const },
  { slug: 'international-business-law-legal-risk-strategy', title: 'International Business Law & Legal Risk Strategy', level: 'Advanced' as const },
];

const stages = ['Foundations and legal context', 'Parties, duties and authority', 'Reading and issue spotting', 'Documents and evidence', 'Risk and compliance controls', 'Communication and escalation', 'Applied scenario workshop', 'Project review and presentation'];

function weeks(draft: Draft): EducationWeeklyCourseSession[] {
  return stages.map((title, index) => ({
    title,
    objectives: [draft.focus[index % draft.focus.length], index < 2 ? 'Recognise scope, terminology and when professional legal advice is needed' : 'Apply a structured, evidence-based review to a fictional business scenario'],
    activity: `Review a fictional ${draft.level.toLowerCase()}-level business-law scenario using a guided checklist.`,
    deliverable: `Portfolio section ${index + 1}: concise issue, evidence, risk and next-step note.`,
    outcome: `Document a careful, non-advisory response to the week ${index + 1} scenario.`,
  }));
}

function course(draft: Draft): EducationCourse {
  const weeklyCurriculum = weeks(draft);
  return {
    slug: draft.slug, title: draft.title, subtitle: draft.subtitle, subject: 'Law & Corporate Governance', level: draft.level,
    accent: draft.level === 'Advanced' ? 'indigo' : draft.level === 'Intermediate' ? 'cyan' : 'blue', demo: false, seoIndexable: false,
    image: `/images/institute/learning/generated/law/${draft.imageBaseName}.webp`,
    keywords: ['business law', 'corporate governance', 'legal risk', 'planned course', draft.title],
    summary: draft.summary, description: draft.summary,
    learningOutcomes: ['Identify relevant legal and governance issues in a fictional business scenario', 'Organise facts, documents, stakeholders and risks using a repeatable framework', 'Draft clear non-advisory business records and escalation notes', `Complete and explain ${draft.project}`],
    outline: weeklyCurriculum.map((week) => ({ title: week.title, topics: week.objectives })),
    detailsToConfirm: ['Academic and legal review', 'Lecturer approval', 'Intake dates and admissions', 'Public fee and payment activation'],
    plannedDetails: {
      provider: 'Techromz Institute', duration: '8 weeks', cohortCapacity: 'Maximum 30 students per intake (proposed)', prerequisites: 'Entry requirements subject to approval',
      schedule: 'One proposed 2-hour live Zoom class each week', totalLiveLearning: '16 proposed live hours', independentPractice: 'guided weekly portfolio work', finalProject: draft.project,
      certificate: 'Institute completion certificate, subject to the existing completion policy', fee: `${draft.proposedFee} proposed — not approved for payment`,
      teachingLanguage: 'Sinhala', deliveryMode: 'Live online via Zoom (proposed)', startTime: '00:00', endTime: '00:00', timeZone: 'Asia/Colombo',
      heroCopy: `${draft.summary} This planned course is awaiting academic, lecturer and publishing approval and does not provide legal advice or professional legal qualification.`,
      imageBaseName: `law/${draft.imageBaseName}`, imageAlt: draft.imageAlt, admissionFact: 'Approval pending',
      facts: [{ label: 'Duration', value: '8 weeks', icon: 'duration' }, { label: 'Level', value: draft.level, icon: 'level' }, { label: 'Maximum cohort', value: '30 proposed', icon: 'class-size' }, { label: 'Live learning', value: '16 proposed hours', icon: 'learning' }, { label: 'Status', value: 'Planned', icon: 'admission' }],
      audienceHeadline: 'Practical legal-awareness learning for business and governance contexts.',
      audiences: ['Business owners, managers and team members who need stronger legal-risk awareness.', 'Learners interested in governance, contracts, compliance or workplace responsibilities.', 'People willing to work with fictional cases and seek qualified advice for real matters.'],
      requirements: ['No professional legal qualification is assumed', 'Laptop or desktop, internet access and document tools', 'Willingness to distinguish education from legal advice'],
      requirementNote: 'This course does not qualify a learner to practise law, provide legal advice or claim professional licensing in Sri Lanka, Canada or any other jurisdiction.',
      learningHeadline: `Build ${draft.level.toLowerCase()}-level legal-awareness, documentation and escalation skills.`,
      learningNote: 'All examples are educational and fictional. Laws change and jurisdiction matters; real decisions require current sources and appropriately qualified professional advice.',
      curriculumHeadline: 'Eight practical stages from issue recognition to a documented risk response.', curriculumIntroduction: 'One proposed 2-hour live class each week is supported by guided practice.', curriculumNote: 'The outline is concise provisional content awaiting academic and legal review.',
      curriculum: [], weeklyCurriculum, projectTitle: draft.project, projectIntroduction: 'Prepare a structured portfolio for a fictional organisation, showing facts, issues, documents, controls, escalation and recommended next steps without presenting the work as legal advice.',
      projectTopics: [], projectFeatures: ['Scenario and stakeholder map', 'Issue and evidence register', 'Document checklist', 'Risk and control matrix', 'Escalation and communication plan', 'Reflective presentation'],
      projectPreview: { appName: 'Legal-risk portfolio', heading: draft.project, note: 'Fictional educational scenario', placeholder: 'Issue · evidence · risk · control · escalation', result: 'Example: record the issue, identify missing evidence, assign an internal owner and refer the matter for qualified advice.', disclaimer: 'Illustrative educational record only—not legal advice, a legal opinion or a live client file.' },
      included: ['Live Sinhala teaching via Zoom, if approved', 'Recordings for enrolled students under Institute policy', 'Guided fictional scenarios and checklists', 'Weekly portfolio activities', 'Final practical-project guidance'],
      includedNote: 'Course materials, recording access and certificate wording remain subject to approval. No licence, accreditation, university credit or professional status is claimed.',
      recognitionStatement: 'Techromz Institute is not presented as a university, accredited law school, bar admission provider or professional legal licensing authority.',
      assessment: [{ label: 'Weekly practical activities', weight: '30%' }, { label: 'Final practical project', weight: '50%' }, { label: 'Presentation and explanation', weight: '20%' }],
      completionRequirements: ['Attend at least five of eight live classes', 'Submit the mandatory final practical assessment', 'Score at least 60% in the final practical assessment', 'Explain the project, its limits and escalation decisions'],
      completionPolicyNote: 'The existing Institute model allows one free resubmission within 14 calendar days of receiving results. Its application remains subject to course approval.',
      assessmentNote: 'Assessment and certificate eligibility are planned under the existing Institute model and must be confirmed before enrolment.',
      pathwayCourses: pathway,
      scopeExclusions: ['Legal advice or representation', 'Use of real confidential client matters', 'Professional licensing or accredited legal qualification', 'Claims of Canadian or other jurisdictional licensing'],
      interestNotice: 'This course is planned. Enquiries do not reserve a seat, activate enrolment or payment, or confirm a lecturer, date, fee or admission.',
      faqs: [
        { question: 'Is this a professional law qualification?', answer: 'No. It is planned practical education in business legal awareness and does not confer a law degree, licence, bar admission, accreditation or authority to provide legal advice.' },
        { question: 'Is the course open for enrolment or payment?', answer: 'No. The course and lecturer require approval. The displayed fee is a proposal only; this page accepts enquiries but no payment or seat reservation.' },
        { question: 'How will the course be delivered?', answer: 'The proposal is eight weeks, with one two-hour Sinhala Zoom class each week. Recordings would be provided to enrolled students under Institute policy. All delivery details remain subject to approval.' },
        { question: 'What practical work is included?', answer: `Weekly fictional case activities build toward ${draft.project}. No real client information should be used.` },
        { question: 'What is required for completion?', answer: 'The proposed existing Institute policy requires attendance at five of eight classes, submission of the final practical assessment and at least 60% in it, with one free resubmission within 14 days. This must be confirmed before enrolment.' },
      ],
    },
  };
}

export const LAW_CORPORATE_GOVERNANCE_COURSES: EducationCourse[] = [
  course({ slug: 'business-company-law-kickstart', title: 'Business & Company Law', subtitle: 'Build practical awareness of business structures, duties and legal risk', level: 'Beginner', proposedFee: 'LKR 10,000', summary: 'A provisional introduction to legal concepts that shape everyday business and company decisions.', focus: ['Business structures and legal identity', 'Authority, responsibility and director awareness', 'Records, decisions and escalation'], project: 'Business Law Awareness Portfolio', imageBaseName: 'business-company-law', imageAlt: 'Business and company law workspace with company documents and legal reference materials' }),
  course({ slug: 'contracts-legal-documentation-kickstart', title: 'Contracts & Legal Documentation', subtitle: 'Read, organise and communicate around common commercial documents', level: 'Beginner', proposedFee: 'LKR 10,000', summary: 'A provisional course in contract awareness, clear documentation and responsible escalation.', focus: ['Contract formation and commercial purpose', 'Common clauses and obligations', 'Document control and evidence'], project: 'Contract Review and Documentation Portfolio', imageBaseName: 'contracts-legal-documentation', imageAlt: 'Contracts and legal documentation workspace with organised agreements and review materials' }),
  course({ slug: 'corporate-governance-compliance-lab', title: 'Corporate Governance & Compliance', subtitle: 'Connect governance responsibilities with practical compliance controls', level: 'Intermediate', proposedFee: 'LKR 20,000', summary: 'A provisional applied course in governance roles, policies, records and compliance monitoring.', focus: ['Boards, management and accountability', 'Policies, registers and reporting', 'Compliance controls and monitoring'], project: 'Governance and Compliance Control Pack', imageBaseName: 'corporate-governance-compliance', imageAlt: 'Corporate governance and compliance workspace with board records and control checklists' }),
  course({ slug: 'employment-workplace-law-lab', title: 'Employment & Workplace Law', subtitle: 'Develop responsible workplace documentation and escalation practices', level: 'Intermediate', proposedFee: 'LKR 20,000', summary: 'A provisional applied course in workplace-law awareness, fair processes and careful records.', focus: ['Employment relationships and workplace duties', 'Policies, performance and fair process', 'Grievances, evidence and escalation'], project: 'Workplace Process and Risk Portfolio', imageBaseName: 'employment-workplace-law', imageAlt: 'Employment and workplace law setting with professional workplace records and policy documents' }),
  course({ slug: 'commercial-law-dispute-resolution', title: 'Commercial Law & Dispute Resolution', subtitle: 'Analyse commercial disputes and design evidence-led response pathways', level: 'Advanced', proposedFee: 'LKR 30,000', summary: 'A provisional advanced course in commercial obligations, dispute prevention and structured resolution planning.', focus: ['Commercial obligations and breach analysis', 'Evidence, remedies and negotiation', 'Dispute-resolution pathways and controls'], project: 'Commercial Dispute Strategy Dossier', imageBaseName: 'commercial-law-dispute-resolution', imageAlt: 'Commercial law and dispute resolution meeting with evidence and negotiation documents' }),
  course({ slug: 'international-business-law-legal-risk-strategy', title: 'International Business Law & Legal Risk Strategy', subtitle: 'Map cross-border legal risk without overstating jurisdictional expertise', level: 'Advanced', proposedFee: 'LKR 30,000', summary: 'A provisional advanced course in cross-border contracting, jurisdictional risk and governance strategy.', focus: ['Cross-border contracts and jurisdiction', 'Trade, data and third-party risk', 'Legal-risk governance and professional referral'], project: 'International Legal Risk Strategy Portfolio', imageBaseName: 'international-business-law-legal-risk-strategy', imageAlt: 'International business law and legal risk strategy workspace with cross-border documents and a world map' }),
];
