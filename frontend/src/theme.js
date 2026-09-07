// Per-lens visual identity. Color follows lens: fiduciary green, beneficiary violet, oversight gold.
export const LENSES = {
  fiduciary: {
    key: "fiduciary",
    name: "Fiduciary Lens",
    verb: "Govern. Verify. Communicate.",
    accent: "#19C37D",
    accent2: "#18B368",
    soft: "rgba(25,195,125,0.12)",
    ring: "rgba(25,195,125,0.5)",
    mode: "dark",
    question: "What must I do to operate this Matter correctly?",
  },
  beneficiary: {
    key: "beneficiary",
    name: "Beneficiary Lens",
    verb: "Understand. Engage. Clarify.",
    accent: "#7C3AED",
    accent2: "#8B5CF6",
    soft: "rgba(124,58,237,0.10)",
    ring: "rgba(124,58,237,0.4)",
    mode: "light",
    question: "What does the current relationship mean for me?",
  },
  oversight: {
    key: "oversight",
    name: "Oversight Lens",
    verb: "Supervise. Assure. Elevate.",
    accent: "#C69214",
    accent2: "#E3A72F",
    soft: "rgba(198,146,20,0.12)",
    ring: "rgba(198,146,20,0.5)",
    mode: "dark",
    question: "Where does human supervisory attention belong?",
  },
};

export const STATUS_COLORS = {
  VERIFIED: "#10B981", CURRENT: "#10B981", ACTIVE: "#10B981", SATISFIED: "#10B981", ON_TRACK: "#10B981", SENT: "#10B981", APPROVED: "#10B981", RELEASED: "#10B981",
  INFO: "#3B82F6", INFORMATIONAL: "#3B82F6", STANDBY: "#3B82F6", ASSIGNED: "#3B82F6", ADVISORY: "#3B82F6", UPCOMING: "#3B82F6",
  NEEDS_ATTENTION: "#F59E0B", PENDING: "#F59E0B", PENDING_VERIFICATION: "#F59E0B", OPEN: "#F59E0B", OBSERVED: "#F59E0B", PROPOSED: "#F59E0B", ACTION_REQUIRED: "#F59E0B", CONTINGENT: "#F59E0B",
  ESCALATED: "#EF4444", EXCEPTION: "#EF4444", OVERDUE: "#EF4444", RISK: "#EF4444",
  SUPERSEDED: "#6B7280", INACTIVE: "#6B7280", ARCHIVED: "#6B7280", DECEASED: "#6B7280", AS_OF: "#8B5CF6",
  DRAFT: "#8B5CF6", REQUIRES_REVIEW: "#8B5CF6", ELICITED_CONTEXT: "#8B5CF6",
};

export const statusColor = (s) => STATUS_COLORS[(s || "").toUpperCase()] || "#8FA6A0";
