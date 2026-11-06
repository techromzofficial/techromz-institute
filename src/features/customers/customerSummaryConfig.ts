export interface SummaryCardItem {
  id: string;
  seq: number;
  title: string;
  footerText: string;
  toastActionMsg: string;
  type:
    | "lifecycle"
    | "acquisition"
    | "segment"
    | "verification"
    | "purchase"
    | "returns"
    | "loyalty"
    | "privacy"
    | "risk"
    | "support"
    | "retention"
    | "activity";
}

export const CUSTOMER_SUMMARY_CARDS_CONFIG: SummaryCardItem[] = [
  {
    id: "card-1",
    seq: 1,
    title: "1. Customer Lifecycle Operations",
    footerText: "View details \u2192",
    toastActionMsg: "Opening Lifecycle Operations...",
    type: "lifecycle",
  },
  {
    id: "card-2",
    seq: 2,
    title: "2. Customer Acquisition & Activation",
    footerText: "View details +",
    toastActionMsg: "Opening Acquisition Analysis...",
    type: "acquisition",
  },
  {
    id: "card-3",
    seq: 3,
    title: "3. Customer Segment Operations",
    footerText: "View details +",
    toastActionMsg: "Opening Segment Operations...",
    type: "segment",
  },
  {
    id: "card-4",
    seq: 4,
    title: "4. Identity & Verification Summary",
    footerText: "View details \u2192",
    toastActionMsg: "Opening Verification Summary...",
    type: "verification",
  },
  {
    id: "card-5",
    seq: 5,
    title: "5. Orders & Purchase Behaviour",
    footerText: "View details \u2192",
    toastActionMsg: "Opening Purchase Behaviour Analysis...",
    type: "purchase",
  },
  {
    id: "card-6",
    seq: 6,
    title: "6. Returns, Refunds & Disputes Summary",
    footerText: "View details +",
    toastActionMsg: "Opening Returns & Disputes Summary...",
    type: "returns",
  },
  {
    id: "card-7",
    seq: 7,
    title: "7. Loyalty, Rewards & Membership",
    footerText: "View details +",
    toastActionMsg: "Opening Loyalty Analytics...",
    type: "loyalty",
  },
  {
    id: "card-8",
    seq: 8,
    title: "8. Consent, Privacy & Preferences",
    footerText: "View details +",
    toastActionMsg: "Opening Privacy Preferences...",
    type: "privacy",
  },
  {
    id: "card-9",
    seq: 9,
    title: "9. Customer Risk & Restrictions",
    footerText: "View details +",
    toastActionMsg: "Opening Risk Control Panel...",
    type: "risk",
  },
  {
    id: "card-10",
    seq: 10,
    title: "10. Customer Support & Communications",
    footerText: "View details \u2192",
    toastActionMsg: "Opening Support Analytics...",
    type: "support",
  },
  {
    id: "card-11",
    seq: 11,
    title: "11. Customer Retention & Dormancy",
    footerText: "View details +",
    toastActionMsg: "Opening Retention Dashboard...",
    type: "retention",
  },
  {
    id: "card-12",
    seq: 12,
    title: "12. Recent Customer Management Activity",
    footerText: "View all activities \u2192",
    toastActionMsg: "Opening Activity Log...",
    type: "activity",
  },
];
