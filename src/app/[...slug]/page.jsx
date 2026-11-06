import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PAGE_CONTENT = {
  about: {
    title: 'About SL Beauty',
    eyebrow: 'Company',
    summary:
      'SL Beauty connects international buyers with verified Sri Lankan exporters across agriculture, manufacturing, textiles, gems, and more.',
    bullets: [
      'Verified supplier network',
      'Secure payment support',
      'Dedicated RFQ matching',
      'Trade resources and export guidance',
    ],
  },
  sitemap: {
    title: 'Site Map',
    eyebrow: 'Explore',
    summary: 'Browse the main sections of the platform and jump straight to the pages you need.',
    bullets: [
      'Products and category pages',
      'Supplier and sourcing hubs',
      'Buyer tools and dashboards',
      'Help and policy pages',
    ],
  },
  careers: {
    title: 'Careers',
    eyebrow: 'Work with us',
    summary: 'Join our team to help buyers and suppliers grow across global trade channels.',
    bullets: [
      'Product and marketplace growth',
      'Customer success and support',
      'Operations and partner development',
      'Technology and data teams',
    ],
  },
  partners: {
    title: 'Partner With Us',
    eyebrow: 'Business opportunities',
    summary: 'We collaborate with logistics firms, inspection agencies, banks, and industry associations to support reliable trade.',
    bullets: [
      'Supplier onboarding programs',
      'Channel partnerships',
      'Export advisory support',
      'Marketing and campaign collaboration',
    ],
  },
  advertise: {
    title: 'Advertise on SL Beauty',
    eyebrow: 'Marketing',
    summary: 'Promote your products, brand, and sourcing services with premium campaigns and buyer-facing placements.',
    bullets: [
      'Brand spotlight opportunities',
      'Category and industry campaigns',
      'Trade show promotion packages',
      'Performance reporting',
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    eyebrow: 'Support',
    summary: 'Find quick answers about account setup, RFQs, payment options, and supplier verification.',
    bullets: [
      'How do I post an RFQ?',
      'How can I verify suppliers?',
      'What documents do I need?',
      'Can I manage multiple inquiries?',
    ],
  },
  contact: {
    title: 'Contact Us',
    eyebrow: 'Help center',
    summary: 'Reach out to our support team for account issues, business inquiries, or platform assistance.',
    bullets: [
      'Email: support@slbeauty.lk',
      'Phone: +94 11 234 5678',
      'WhatsApp: +94 77 000 0000',
      'Business hours: Mon–Sat, 8:30 AM–6:00 PM',
    ],
  },
  complaints: {
    title: 'Submit a Complaint',
    eyebrow: 'Resolution',
    summary: 'Share concerns about supplier behavior, transactions, content, or service quality so our team can review them promptly.',
    bullets: [
      'Submit your inquiry with order details',
      'Attach screenshots or documents',
      'Receive a case reference number',
      'Track updates through our support desk',
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Policies',
    summary: 'These terms explain how you can use the SL Beauty platform and the responsibilities of buyers and suppliers.',
    bullets: [
      'Accurate registration data required',
      'No misuse of buyer or supplier information',
      'Compliance with applicable trade laws',
      'Platform rights reserved',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Your information',
    summary: 'We handle your personal and business information carefully and only use it to support secure trade activity.',
    bullets: [
      'Data collected for account and inquiry processing',
      'Limited sharing with verified partners',
      'Cookie-based analytics for site improvement',
      'User control over account settings',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    eyebrow: 'Website settings',
    summary: 'We use cookies to improve performance, remember preferences, and understand how visitors use the marketplace.',
    bullets: [
      'Essential cookies for login and cart',
      'Analytics cookies for traffic insights',
      'Preference cookies for language and display settings',
      'Manage settings in your browser',
    ],
  },
  industries: {
    title: 'Industry Sites',
    eyebrow: 'Browse by sector',
    summary: 'Explore key industries and sourcing categories to discover trusted manufacturers and exporters.',
    bullets: [
      'Textiles and apparel',
      'Food and agricultural products',
      'Electronics and electrical equipment',
      'Gems, ceramics, and handicrafts',
    ],
  },
  regions: {
    title: 'Regional Channels',
    eyebrow: 'Global trade regions',
    summary: 'Discover trade opportunities across major sourcing regions and logistics corridors.',
    bullets: [
      'South Asia sourcing hubs',
      'Middle East trade routes',
      'Africa import corridors',
      'Europe and North America buyers',
    ],
  },
  custom: {
    title: 'Custom Products',
    eyebrow: 'OEM / ODM',
    summary: 'Work with manufacturing partners to build custom packaging, branding, and product specifications.',
    bullets: [
      'Logo and packaging customization',
      'Sample development support',
      'Flexible order quantities',
      'Technical specification review',
    ],
  },
  guide: {
    title: 'Business Guide',
    eyebrow: 'Trade resources',
    summary: 'Helpful tips for new buyers and suppliers looking to source or export confidently.',
    bullets: [
      'How to evaluate supplier credibility',
      'Pricing and negotiation best practices',
      'Shipping and documentation tips',
      'How to use RFQs effectively',
    ],
  },
  resources: {
    title: 'Trade Resources',
    eyebrow: 'Learning center',
    summary: 'Access insights on product trends, export procedures, and buyer requirements.',
    bullets: [
      'Market trend reports',
      'Certification guides',
      'Buyer checklists',
      'Supplier onboarding resources',
    ],
  },
  logistics: {
    title: 'Logistics Partners',
    eyebrow: 'Shipping & freight',
    summary: 'Connect with freight forwarders, customs agents, and warehousing partners for smoother global trade.',
    bullets: [
      'Sea and air freight support',
      'Customs documentation help',
      'Warehousing and consolidation',
      'Shipping insurance options',
    ],
  },
  inspection: {
    title: 'Quality Inspection',
    eyebrow: 'Verification services',
    summary: 'Use inspection and quality assurance services to confirm product standards before final shipment.',
    bullets: [
      'Factory audit support',
      'Pre-shipment inspection',
      'Product testing and sample review',
      'Certification verification',
    ],
  },
  'secured-trading': {
    title: 'Secured Trading',
    eyebrow: 'Protection',
    summary: 'Our secured trading service is designed to help buyers and suppliers transact with more confidence through safer processes and verified partners.',
    bullets: [
      'Funds security support',
      'Verified supplier matching',
      'Buyer and seller protection',
      'Dispute resolution support',
    ],
  },
  videos: {
    title: 'Video Channel',
    eyebrow: 'Product showcases',
    summary: 'Watch supplier videos, factory walkthroughs, and product demonstrations to evaluate quality before you contact a seller.',
    bullets: [
      'Factory tours',
      'Product demonstrations',
      'Supplier interviews',
      'Export and packaging walkthroughs',
    ],
  },
  trade: {
    title: 'Trade Shows',
    eyebrow: 'Events',
    summary: 'Keep up with upcoming exhibitions and trade events where buyers can meet exporters in person.',
    bullets: [
      'Global sourcing fairs',
      'Industry-specific exhibitions',
      'Networking sessions',
      'Buyer meetups',
    ],
  },
  messages: {
    title: 'Messages',
    eyebrow: 'Inbox',
    summary: 'Keep track of conversations with suppliers, buyers, and support teams all in one place.',
    bullets: [
      'Unread conversations',
      'Quote follow-ups',
      'Supplier requests',
      'Support updates',
    ],
  },
  orders: {
    title: 'My Orders',
    eyebrow: 'Purchases',
    summary: 'Review active orders, track statuses, and manage your purchasing history.',
    bullets: [
      'Pending and processing orders',
      'Shipment tracking',
      'Order history',
      'Support requests',
    ],
  },
  wishlist: {
    title: 'Wishlist',
    eyebrow: 'Saved products',
    summary: 'Keep your favorite products and suppliers saved so you can compare them later.',
    bullets: [
      'Saved supplier profiles',
      'Favorite product lists',
      'Price and availability alerts',
      'Quick RFQ creation',
    ],
  },
  settings: {
    title: 'Account Settings',
    eyebrow: 'Profile',
    summary: 'Manage your account details, preferences, notifications, and business information.',
    bullets: [
      'Profile and company details',
      'Notification settings',
      'Password and security',
      'Saved address information',
    ],
  },
  apps: {
    title: 'SL Beauty Apps',
    eyebrow: 'Mobile',
    summary: 'Mobile app distribution is being prepared. Use the responsive web marketplace for the full buyer and supplier workflow today.',
    bullets: [
      'Browse products and suppliers',
      'Manage RFQs and quotations',
      'Track orders and messages',
      'Receive account notifications',
    ],
  },
  history: {
    title: 'Browsing History',
    eyebrow: 'Account',
    summary: 'Browsing history is not currently stored. Use wishlist to save products you want to revisit.',
    bullets: [
      'Save products to wishlist',
      'Compare supplier profiles',
      'Return to recent RFQs from your dashboard',
      'Manage conversations from messages',
    ],
  },
  pricing: {
    title: 'Pricing & Membership',
    eyebrow: 'Suppliers',
    summary: 'Supplier membership options are managed through account onboarding and verification.',
    bullets: [
      'Free supplier registration',
      'Company profile setup',
      'Product listing management',
      'Verification review support',
    ],
  },
  'verified-supplier': {
    title: 'Verified Supplier Badge',
    eyebrow: 'Trust',
    summary: 'Verified supplier status is awarded after marketplace review of company details and supporting documents.',
    bullets: [
      'Complete company profile',
      'Add certificates and production details',
      'Keep product catalog accurate',
      'Respond promptly to RFQs',
    ],
  },
  'buyer-centre': {
    title: 'Buyer Centre',
    eyebrow: 'Sourcing',
    summary: 'Use buyer tools to discover products, submit RFQs, compare quotations, and create orders from accepted quotations.',
    bullets: [
      'Browse product listings',
      'Post sourcing RFQs',
      'Review supplier quotations',
      'Create orders from accepted quotations',
    ],
  },
  'trade-shows': {
    title: 'Trade Shows',
    eyebrow: 'Events',
    summary: 'Explore export-focused events and marketplace trade promotion opportunities.',
    bullets: [
      'Industry exhibitions',
      'Supplier showcases',
      'Buyer networking',
      'Export promotion programs',
    ],
  },
};

export default function GenericContentPage({ params }) {
  const slug = Array.isArray(params?.slug) ? params.slug.join('/') : params?.slug;
  const pageKey = slug?.split('/')[0];
  const content = PAGE_CONTENT[slug] || PAGE_CONTENT[pageKey];

  if (!content) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
            {content.eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="mt-3 text-gray-600">{content.summary}</p>
          <ul className="mt-6 space-y-3">
            {content.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              Go to Home
            </Link>
            <Link href="/products" className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
