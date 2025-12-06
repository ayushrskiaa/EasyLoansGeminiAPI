import { Product } from "./db/schema";

export interface BadgeInfo {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "outline";
}

export function getProductBadges(product: Product): BadgeInfo[] {
  const badges: BadgeInfo[] = [];

  if (parseFloat(product.rateApr) < 10) {
    badges.push({ label: "Low APR", variant: "success" });
  }

  if (product.prepaymentAllowed) {
    badges.push({ label: "No Prepayment Charges", variant: "success" });
  }

  if (product.disbursalSpeed === "instant" || product.disbursalSpeed === "fast") {
    badges.push({ label: "Fast Disbursal", variant: "default" });
  }

  const tenureRange = product.tenureMaxMonths - product.tenureMinMonths;
  if (tenureRange >= 48) {
    badges.push({ label: "Flexible Tenure", variant: "secondary" });
  }

  if (product.docsLevel === "minimal") {
    badges.push({ label: "Low Documentation", variant: "success" });
  }

  const minIncome = parseFloat(product.minIncome);
  if (minIncome <= 300000) {
    badges.push({ label: `Salary > ₹${(minIncome / 100000).toFixed(0)}L Eligible`, variant: "outline" });
  }

  if (product.minCreditScore >= 750) {
    badges.push({ label: "Credit Score ≥ 750", variant: "success" });
  } else if (product.minCreditScore >= 700) {
    badges.push({ label: `Credit Score ≥ ${product.minCreditScore}`, variant: "outline" });
  }

  if (Math.random() > 0.7) {
    badges.push({ label: "Limited-Time Offer", variant: "warning" });
  }

  if (parseFloat(product.processingFeePct) === 0) {
    badges.push({ label: "Zero Processing Fee", variant: "success" });
  }

  return badges.slice(0, 5);
}

