import { BEGINNER_SESSION_ADMISSIONS, type EducationCourse, type EducationLevel, type EducationWeeklyCourseSession } from '../contracts/course';

type Draft = {
  slug: string; title: string; division: 'Creative Arts & Design' | 'Languages & Cultural Studies';
  summary: string; audience: string[]; themes: string[]; project: string; applications: string[];
  cautions?: string[]; duration?: string; level?: EducationLevel;
};

const artsImages: Record<string, { baseName: string; alt: string }> = {
  'creative-branding-packaging-design': { baseName: 'creative-branding-packaging-design', alt: 'Sapphire blue luxury packaging design concepts, brand boards and product mockups' },
  'fashion-apparel-design': { baseName: 'fashion-apparel-design', alt: 'Modern fashion studio with garment mannequins, textile swatches and clothing sketches' },
  'bags-accessories-design': { baseName: 'bags-accessories-design', alt: 'Designer handbags, accessory prototypes and materials in a contemporary studio' },
  'gem-jewellery-design': { baseName: 'gem-jewellery-design', alt: 'Sapphire jewellery pieces, gemstone samples and design sketches' },
  'fragrance-product-development': { baseName: 'fragrance-product-development', alt: 'Premium perfume bottles, packaging concepts and fragrance mood boards' },
  'fashion-production-quality-management': { baseName: 'fashion-production-quality-management', alt: 'Garment production workstation with technical specifications and quality control sheets' },
  'sinhala-language-cultural-heritage': { baseName: 'sinhala-language-cultural-heritage', alt: 'Sinhala study desk with lesson laptop, learning notebook and books' },
  'japanese-language-communication': { baseName: 'japanese-language-communication', alt: 'Japanese language learning desk with hiragana study notebook and headset' },
  'korean-language-communication': { baseName: 'korean-language-communication', alt: 'Korean language learning desk with hangul study notes and headphones' },
};

const creativePathway = [
  ['creative-branding-packaging-design', 'Creative Branding & Packaging Design'],
  ['fashion-apparel-design', 'Fashion & Apparel Design'],
  ['bags-accessories-design', 'Bags & Accessories Design'],
  ['gem-jewellery-design', 'Gem & Jewellery Design'],
  ['fragrance-product-development', 'Fragrance & Product Development'],
  ['fashion-production-quality-management', 'Fashion Production & Quality Management'],
] as const;
const languagePathway = [
  ['sinhala-language-cultural-heritage', 'Sinhala Language & Cultural Heritage'],
  ['japanese-language-communication', 'Japanese Language & Communication'],
  ['korean-language-communication', 'Korean Language & Communication'],
] as const;

const publicationStatuses: Partial<Record<string, EducationCourse['publicationStatus']>> = {
  'fashion-apparel-design': 'unpublished',
  'bags-accessories-design': 'unpublished',
  'fragrance-product-development': 'unpublished',
  'fashion-production-quality-management': 'unpublished',
};

function themeCurriculum(themes: string[], project: string): EducationWeeklyCourseSession[] {
  return themes.map((theme, index) => ({
    title: theme,
    objectives: [`Understand the essential concepts and responsible practice for ${theme.toLowerCase()}.`],
    activity: `Complete a guided ${theme.toLowerCase()} exercise for the developing course portfolio.`,
    deliverable: index === themes.length - 1 ? project : `A reviewed ${theme.toLowerCase()} portfolio item.`,
    outcome: `Apply ${theme.toLowerCase()} in a clear, practical context.`,
  }));
}

const brandingWeeks: EducationWeeklyCourseSession[] = [
  ['Introduction to Branding & Product Design', 'Choose a product and analyse competitors.'],
  ['Market Research & Customer Understanding', 'Create a customer persona and market research summary.'],
  ['Brand Strategy & Positioning', 'Develop a brand concept and creative brief.'],
  ['Visual Identity Development', 'Create logo concepts and a mood board.'],
  ['Typography, Colour & Design Systems', 'Prepare a brand identity guide.'],
  ['Packaging Design Fundamentals', 'Define packaging dimensions and select materials.'],
  ['Labels, Product Information & Design Ethics', 'Design a product label and information layout.'],
  ['Digital Design & Prototyping', 'Create a product mockup or prototype.'],
  ['Production Planning & Costing', 'Prepare a packaging cost estimate and supplier brief.'],
  ['Product Photography & Marketing Content', 'Produce promotional visuals and product imagery.'],
  ['Industry Review & Design Improvement', 'Revise designs after structured feedback.'],
  ['Final Product Presentation & Assessment', 'Complete the brand portfolio and final presentation.'],
].map(([title, activity]) => ({ title, objectives: [title], activity, deliverable: activity, outcome: `Use ${title.toLowerCase()} in the final brand and packaging portfolio.` }));

function course(draft: Draft): EducationCourse {
  const image = artsImages[draft.slug];
  const creative = draft.division === 'Creative Arts & Design';
  const pathway = (creative ? creativePathway : languagePathway).map(([slug, title]) => ({ slug, title, level: 'Beginner' as const }));
  const isBranding = draft.slug === 'creative-branding-packaging-design';
  const curriculum = isBranding ? brandingWeeks : themeCurriculum(draft.themes, draft.project);
  const practicalActivities = creative
    ? ['Research customers, competitors and responsible material choices', 'Develop sketches, specifications and portfolio artefacts', 'Review feasibility, quality and indicative costs', 'Present work and improve it through feedback']
    : ['Practise listening and pronunciation', 'Build guided vocabulary and sentence patterns', 'Complete reading or writing portfolio activities', 'Demonstrate communication in a supported final activity'];
  const completion = isBranding ? ['Achieve the 60% pass mark', 'Complete the compulsory final practical assessment', 'Submit the required portfolio work'] : ['Complete the proposed practical portfolio', 'Take part in the final project or skills demonstration', 'Meet the assessment requirements published before enrolment'];
  return {
    slug: draft.slug, title: draft.title, subtitle: creative ? draft.division : 'Practical beginner communication and cultural learning', publicationStatus: publicationStatuses[draft.slug] ?? 'published',
    subject: 'Arts & Languages', level: draft.level ?? 'Beginner', summary: draft.summary,
    description: draft.summary, learningOutcomes: [
      `Explain the foundations of ${draft.themes[0].toLowerCase()}`,
      `Apply guided techniques across ${draft.themes.slice(1, 3).join(' and ').toLowerCase()}`,
      'Develop practical work through research, practice and structured feedback',
      `Complete and present ${draft.project.toLowerCase()}`,
      'Recognise professional, ethical, safety and scope limitations',
    ], outline: draft.themes.map((title) => ({ title, topics: [title] })), detailsToConfirm: ['Start date', 'Delivery schedule', 'Fee', 'Teaching team'], accent: 'indigo', demo: false, seoIndexable: false,
    image: `/images/institute/arts-languages/${image.baseName}.webp`, plannedDetails: {
      provider: 'Techromz Institute of Technology', duration: draft.duration ?? 'Duration to be confirmed', cohortCapacity: 'Class size to be confirmed', prerequisites: 'No formal prior study required',
      admissions: BEGINNER_SESSION_ADMISSIONS,
      schedule: isBranding ? 'One 2-hour live class each week for 12 weeks' : 'Teaching schedule to be confirmed', totalLiveLearning: isBranding ? '24 hours' : 'To be confirmed', independentPractice: isBranding ? '24–36 proposed hours' : 'Guided independent practice to be confirmed',
      finalProject: draft.project, certificate: 'Completion recognition to be confirmed', teachingLanguage: 'Teaching language to be confirmed', deliveryMode: 'Delivery mode to be confirmed', startTime: '09:00', endTime: '11:00', timeZone: 'Asia/Colombo',
      heroCopy: draft.summary, heroTagline: creative ? 'Build a practical, presentation-ready creative portfolio.' : 'Learn through guided practice, communication and cultural context.', imageBaseName: `arts-languages/${image.baseName}`, imageAlt: image.alt,
      facts: [{ label: 'Status', value: 'Planned course', icon: 'admission' }, ...(isBranding ? [{ label: 'Duration', value: '12 weeks', icon: 'duration' as const }, { label: 'Live instruction', value: '2 hours weekly · 24 hours total', icon: 'learning' as const }] : draft.duration ? [{ label: 'Proposed duration', value: draft.duration, icon: 'duration' as const }] : []), { label: 'Division', value: draft.division, icon: 'level' }],
      audienceHeadline: 'Designed for practical, motivated learners.', audiences: draft.audience, requirements: ['Access to basic learning materials and a device for portfolio work', 'Willingness to practise independently and respond to feedback', 'Any specialist materials or facilities will be confirmed before enrolment'], requirementNote: 'Final entry, equipment and delivery requirements will be published only after academic and operational approval.',
      learningHeadline: `Develop practical capability in ${draft.title.toLowerCase()}.`, learningNote: 'The planned learning outcomes combine guided instruction, independent practice, feedback and a final portfolio or skills demonstration.',
      curriculumLabel: isBranding ? '12-week curriculum' : 'Proposed curriculum themes', curriculumHeadline: isBranding ? 'From product research to a complete brand portfolio.' : 'A practical sequence subject to final academic approval.', curriculumIntroduction: isBranding ? 'One 2-hour live class is planned each week, supported by 24–36 hours of independent practical work.' : 'These themes define the proposed learning scope; duration and weekly scheduling are not yet final.', curriculumNote: '', curriculum: [], weeklyCurriculum: curriculum,
      projectTitle: isBranding ? 'Ceylon Luxury Jewellery Collection' : draft.project, projectIntroduction: isBranding ? 'Develop premium branding and packaging for a fictional Sri Lankan gemstone jewellery collection. This is a simulated educational case study, not a launched commercial product.' : `Develop ${draft.project.toLowerCase()} through guided research, practice, review and presentation.`,
      projectTopics: draft.themes, projectFeatures: isBranding ? ['Brand research and customer profile', 'Brand identity', 'Jewellery presentation box', 'Protective insert or pouch concept', 'Product information cards and packaging specifications', 'Production costing', 'Digital mockups or physical prototype', 'Marketing visuals and final portfolio presentation'] : [draft.project, ...practicalActivities.slice(0, 3)],
      included: ['Guided teaching and practical activities', 'Structured instructor feedback', 'Portfolio or skills-demonstration guidance', 'Final presentation or demonstration'], includedNote: 'Materials, software, facilities and recognition remain subject to final approval.',
      assessment: isBranding ? [{ label: 'Market Research', weight: '15%' }, { label: 'Brand Identity', weight: '25%' }, { label: 'Packaging & Prototype', weight: '25%' }, { label: 'Costing & Feasibility', weight: '15%' }, { label: 'Final Portfolio & Presentation', weight: '20%' }] : [{ label: 'Practical activities', weight: 'Weight to be confirmed' }, { label: 'Final project or demonstration', weight: 'Weight to be confirmed' }],
      completionRequirements: completion, completionPolicyNote: isBranding ? 'Pass mark: 60%. The final practical assessment is compulsory. No attendance threshold is published because it has not been approved.' : 'Assessment weights, pass mark, attendance and resubmission rules will be confirmed before enrolment.', assessmentNote: 'This planned course does not claim accreditation, employment, examination success or professional licensing.',
      pathwayCourses: pathway, relatedCourse: { slug: pathway[0].slug, title: pathway[0].title, note: `Explore the other planned courses in ${draft.division}.` }, scopeExclusions: draft.cautions,
      division: draft.division, practicalActivities, careerApplications: draft.applications, industryProjectLearning: creative,
      interestNotice: 'This is a planned course. An enquiry does not reserve a seat, confirm enrolment or activate payment.',
      faqs: [
        { question: 'Is this course open for enrolment?', answer: 'No. This is a planned, enquiry-only course. Dates, fees, teaching team and capacity are not yet published.' },
        { question: 'What practical work is proposed?', answer: draft.project },
        { question: 'Does the course guarantee employment or commercial use of my work?', answer: 'No. Jobs, internships, product release and Brand House employment are not guaranteed. Student work remains the student’s intellectual property unless a separate future commissioning or licensing agreement is made.' },
        { question: 'How will learning be assessed?', answer: isBranding ? 'Market research 15%, brand identity 25%, packaging and prototype 25%, costing and feasibility 15%, and final portfolio and presentation 20%. The pass mark is 60% and the final practical assessment is compulsory.' : 'Practical activities and a final project or skills demonstration are proposed. Final assessment rules will be published before enrolment.' },
      ],
    },
  };
}

export const ARTS_LANGUAGES_COURSES: EducationCourse[] = [
  course({ slug: 'creative-branding-packaging-design', title: 'Creative Branding & Packaging Design', division: 'Creative Arts & Design', duration: '12 weeks', summary: 'Research, design, cost and present a brand identity and physical product-packaging concept for a realistic simulated brief.', audience: ['Entrepreneurs developing product ideas', 'Future creative-industry professionals', 'Learners building a branding and packaging portfolio'], themes: ['Branding and product design', 'Market and customer research', 'Brand strategy and visual identity', 'Packaging, labels and design ethics', 'Prototyping, production planning and costing', 'Photography, review and presentation'], project: 'A complete brand identity, packaging prototype and presentation portfolio', applications: ['Freelance branding and packaging work', 'Small-product-business development', 'Junior creative and production-support roles'] }),
  course({ slug: 'fashion-apparel-design', title: 'Fashion & Apparel Design', division: 'Creative Arts & Design', summary: 'Develop fashion concepts from illustration and textile selection through technical detail, costing and collection presentation.', audience: ['Aspiring fashion designers', 'Creative entrepreneurs', 'Learners building an apparel portfolio'], themes: ['Fashion design principles', 'Fashion illustration', 'Textile and fabric selection', 'Colour and style development', 'Body measurements and sizing', 'Garment construction fundamentals', 'Collection development', 'Costing and product presentation'], project: 'A small fashion collection with sketches, fabric specifications, technical details and production cost estimates', applications: ['Fashion design support', 'Collection planning', 'Small apparel business development'], cautions: ['No commercial manufacturing or product release is promised'] }),
  course({ slug: 'bags-accessories-design', title: 'Bags & Accessories Design', division: 'Creative Arts & Design', summary: 'Design a coherent accessory range using customer evidence, technical drawings, material decisions, prototyping and costing.', audience: ['Aspiring accessory designers', 'Product entrepreneurs', 'Portfolio-building creative learners'], themes: ['Accessory design fundamentals', 'Customer and market research', 'Materials and hardware', 'Handbag illustration', 'Pattern development', 'Prototyping', 'Product costing', 'Quality and presentation'], project: 'A handbag or accessory collection with technical drawings, material specifications, costing and an appropriate prototype', applications: ['Accessory design support', 'Product development', 'Small accessories businesses'] }),
  course({ slug: 'gem-jewellery-design', title: 'Gem & Jewellery Design', division: 'Creative Arts & Design', summary: 'Build an introductory jewellery-design portfolio combining drawing, feasibility, digital concepts and ethical sourcing awareness.', audience: ['Aspiring jewellery designers', 'Creative entrepreneurs', 'Learners interested in responsible product design'], themes: ['Jewellery design principles', 'Introductory gemstone knowledge', 'Jewellery illustration', 'Materials and design feasibility', 'Jewellery CAD concepts', 'Collection development', 'Product presentation', 'Ethical sourcing awareness'], project: 'A jewellery collection concept supported by drawings, specifications and digital mockups', applications: ['Jewellery design support', 'Collection concept development', 'Creative entrepreneurship'], cautions: ['This is not a professional gemmology qualification or official gemstone certification', 'Hands-on fabrication requires appropriately qualified trainers and facilities'] }),
  course({ slug: 'fragrance-product-development', title: 'Fragrance & Product Development', division: 'Creative Arts & Design', summary: 'Shape a responsible fragrance product concept through research, positioning, packaging, branding, costing and supplier requirements.', audience: ['Product entrepreneurs', 'Brand and packaging learners', 'Creative product-development learners'], themes: ['Introduction to fragrance products', 'Customer research', 'Product positioning', 'Fragrance families and terminology', 'Packaging and bottle concepts', 'Product branding', 'Costing and supplier requirements', 'Responsible product development'], project: 'A fragrance brand concept, product brief, packaging mockup and launch presentation', applications: ['Brand concept development', 'Product briefs and supplier communication', 'Small-business planning'], cautions: ['No unsafe chemical formulation exercises are included', 'The course does not authorise cosmetic manufacturing', 'Commercial manufacturing and labelling require applicable safety and regulatory review'] }),
  course({ slug: 'fashion-production-quality-management', title: 'Fashion Production & Quality Management', division: 'Creative Arts & Design', summary: 'Plan apparel production, specifications and quality controls while considering materials, suppliers, costs and efficiency.', audience: ['Future apparel production staff', 'Fashion entrepreneurs', 'Learners interested in quality management'], themes: ['Introduction to apparel manufacturing', 'Production workflow', 'Fabric and material quality', 'Garment measurements', 'Production planning', 'Supplier coordination', 'Quality inspection', 'Cost and efficiency management'], project: 'A production plan, technical specification and quality-control checklist for a small apparel collection', applications: ['Apparel production support', 'Quality-control roles', 'Supplier and small-business coordination'], cautions: ['Enrolment requires production expertise and appropriate practical resources to be confirmed first'] }),
  course({ slug: 'sinhala-language-cultural-heritage', title: 'Sinhala Language & Cultural Heritage', division: 'Languages & Cultural Studies', duration: '4 months, subject to final confirmation', summary: 'A proposed bilingual-supported heritage-language course helping overseas learners build family communication and introductory Sinhala literacy.', audience: ['Sri Lankan heritage learners living overseas', 'Children learning Sinhala as a family or heritage language', 'Families seeking guided cultural communication'], themes: ['Sinhala greetings and introductions', 'Family vocabulary', 'Everyday conversations', 'Pronunciation and listening', 'Sinhala letters', 'Elementary reading and writing', 'Sri Lankan cultural stories', 'Communication with relatives'], project: 'An end-of-course language demonstration with simple conversation, reading, writing and family-communication activities', applications: ['Family and heritage communication', 'Continued Sinhala study', 'Cultural participation'], cautions: ['The course does not promise fluency within four months', 'Instructor identities will be published only after approval'] }),
  course({ slug: 'japanese-language-communication', title: 'Japanese Language & Communication', division: 'Languages & Cultural Studies', summary: 'Build beginner pronunciation, scripts, expressions and culturally aware communication through guided practice.', audience: ['Beginner Japanese language learners', 'Learners interested in everyday communication', 'Students planning further structured Japanese study'], themes: ['Japanese pronunciation', 'Hiragana and Katakana', 'Basic expressions', 'Introductions and greetings', 'Numbers, time and everyday vocabulary', 'Basic grammar', 'Listening and conversation', 'Japanese cultural communication'], project: 'A guided Japanese conversation and short reading and writing portfolio', applications: ['Everyday international communication', 'Foundation for continued Japanese study', 'Cross-cultural awareness'], cautions: ['The plan may draw on JLPT N5 foundations but has no official affiliation and does not guarantee examination success'] }),
  course({ slug: 'korean-language-communication', title: 'Korean Language & Communication', division: 'Languages & Cultural Studies', summary: 'Learn Hangul, beginner grammar and practical conversation while developing culturally aware communication habits.', audience: ['Beginner Korean language learners', 'Learners interested in everyday communication', 'Students planning further structured Korean study'], themes: ['Hangul', 'Pronunciation', 'Everyday vocabulary', 'Introductions and greetings', 'Basic grammar', 'Listening practice', 'Practical conversation', 'Korean cultural communication'], project: 'A beginner Korean-language portfolio and guided spoken demonstration', applications: ['Everyday international communication', 'Foundation for continued Korean study', 'Cross-cultural awareness'], cautions: ['This is not an approved EPS-TOPIK or TOPIK preparation course', 'Examination-specific courses may be planned separately'] }),
];
