export const currentState = (m) => m?.states?.find((s) => s.status === "CURRENT") || m?.states?.[m.states.length - 1];
export const priorState = (m) => {
  const superseded = m?.states?.filter((s) => s.status === "SUPERSEDED") || [];
  return superseded[superseded.length - 1];
};
export const featuredEvent = (m) => [...(m?.events || [])].reverse().find((e) => e.kind === "CONSEQUENTIAL");
export const featuredObligation = (m) => {
  const conseq = (m?.events || []).filter((e) => e.kind === "CONSEQUENTIAL").map((e) => e.id);
  return (m?.obligations || []).find((o) => conseq.includes(o.created_by) && o.status !== "SATISFIED")
    || (m?.obligations || []).find((o) => conseq.includes(o.created_by));
};
export const primaryBeneficiary = (m) =>
  (m?.people || []).find((p) => p.lens_role === "beneficiary" && p.status === "CURRENT") || { name: "Beneficiary", initials: "B" };
export const money = (n) => "$" + (n || 0).toLocaleString();
