import { db } from "./index";
import { products } from "./schema";

const seedProducts = [
  {
    name: "Instant Personal Loan",
    bank: "HDFC Bank",
    type: "personal" as const,
    rateApr: "10.5",
    minIncome: "300000",
    minCreditScore: 750,
    tenureMinMonths: 12,
    tenureMaxMonths: 60,
    processingFeePct: "2.5",
    prepaymentAllowed: true,
    disbursalSpeed: "instant",
    docsLevel: "minimal",
    summary: "Get instant approval on personal loans with competitive interest rates. Perfect for urgent financial needs.",
    faq: [
      { question: "What is the maximum loan amount?", answer: "Up to ₹40 lakhs based on your income and credit score." },
      { question: "How fast is the disbursal?", answer: "Funds are disbursed within 24 hours of approval." },
      { question: "Are there any prepayment charges?", answer: "No prepayment charges after 12 months." }
    ],
    terms: {
      "eligibility": "Salaried individuals with minimum 2 years of work experience",
      "documents": "PAN, Aadhaar, Salary slips, Bank statements"
    }
  },
  {
    name: "Education Loan Pro",
    bank: "SBI",
    type: "education" as const,
    rateApr: "8.5",
    minIncome: "200000",
    minCreditScore: 700,
    tenureMinMonths: 12,
    tenureMaxMonths: 120,
    processingFeePct: "1.0",
    prepaymentAllowed: true,
    disbursalSpeed: "standard",
    docsLevel: "standard",
    summary: "Comprehensive education loan for higher studies in India and abroad. Moratorium period available.",
    faq: [
      { question: "What courses are covered?", answer: "All professional courses including engineering, medicine, MBA, and international programs." },
      { question: "Is there a moratorium period?", answer: "Yes, moratorium period of course duration + 1 year." },
      { question: "What is the maximum loan amount?", answer: "Up to ₹1.5 crores for international studies." }
    ],
    terms: {
      "eligibility": "Students with admission to recognized institutions",
      "co-applicant": "Parent or guardian required as co-applicant"
    }
  },
  {
    name: "Home Loan Advantage",
    bank: "ICICI Bank",
    type: "home" as const,
    rateApr: "8.75",
    minIncome: "500000",
    minCreditScore: 750,
    tenureMinMonths: 60,
    tenureMaxMonths: 360,
    processingFeePct: "0.5",
    prepaymentAllowed: true,
    disbursalSpeed: "standard",
    docsLevel: "comprehensive",
    summary: "Buy your dream home with flexible repayment options and attractive interest rates. Special rates for women borrowers.",
    faq: [
      { question: "What is the maximum loan amount?", answer: "Up to ₹5 crores based on property value and income." },
      { question: "What is the loan-to-value ratio?", answer: "Up to 90% for properties valued below ₹30 lakhs, 80% for others." },
      { question: "Are there any tax benefits?", answer: "Yes, tax benefits under Section 24(b) and Section 80C." }
    ],
    terms: {
      "eligibility": "Salaried or self-employed individuals",
      "property": "Ready-to-move or under-construction properties"
    }
  },
  {
    name: "Car Loan Express",
    bank: "Axis Bank",
    type: "vehicle" as const,
    rateApr: "9.25",
    minIncome: "250000",
    minCreditScore: 700,
    tenureMinMonths: 12,
    tenureMaxMonths: 84,
    processingFeePct: "1.5",
    prepaymentAllowed: true,
    disbursalSpeed: "fast",
    docsLevel: "minimal",
    summary: "Drive away with your favorite car. Quick approval and competitive rates for new and used vehicles.",
    faq: [
      { question: "What vehicles are covered?", answer: "New and used cars, SUVs, and two-wheelers." },
      { question: "What is the maximum loan amount?", answer: "Up to 100% of on-road price for new cars." },
      { question: "How fast is the approval?", answer: "Approval within 2 hours, disbursal within 24 hours." }
    ],
    terms: {
      "eligibility": "Salaried individuals with minimum 1 year experience",
      "age": "21-65 years"
    }
  },
  {
    name: "Credit Line Flex",
    bank: "Kotak Mahindra Bank",
    type: "credit_line" as const,
    rateApr: "12.0",
    minIncome: "400000",
    minCreditScore: 750,
    tenureMinMonths: 1,
    tenureMaxMonths: 60,
    processingFeePct: "0",
    prepaymentAllowed: true,
    disbursalSpeed: "instant",
    docsLevel: "minimal",
    summary: "Flexible credit line that you can use anytime. Pay interest only on the amount you use.",
    faq: [
      { question: "How does a credit line work?", answer: "You get a pre-approved credit limit. Use it anytime and pay interest only on the utilized amount." },
      { question: "What is the minimum withdrawal?", answer: "Minimum withdrawal of ₹10,000." },
      { question: "Is there an annual fee?", answer: "No annual fee, only interest on utilized amount." }
    ],
    terms: {
      "eligibility": "Salaried professionals with high credit score",
      "usage": "Can be used for any personal expenses"
    }
  },
  {
    name: "Debt Consolidation Plus",
    bank: "Bajaj Finserv",
    type: "debt_consolidation" as const,
    rateApr: "11.5",
    minIncome: "350000",
    minCreditScore: 720,
    tenureMinMonths: 12,
    tenureMaxMonths: 60,
    processingFeePct: "2.0",
    prepaymentAllowed: true,
    disbursalSpeed: "fast",
    docsLevel: "standard",
    summary: "Consolidate all your debts into one easy-to-manage loan. Lower your EMI and simplify repayments.",
    faq: [
      { question: "What debts can be consolidated?", answer: "Credit card dues, personal loans, and other unsecured debts." },
      { question: "Will this improve my credit score?", answer: "Yes, timely repayments can help improve your credit score." },
      { question: "What is the maximum loan amount?", answer: "Up to ₹25 lakhs based on existing debt and income." }
    ],
    terms: {
      "eligibility": "Individuals with existing debts",
      "purpose": "Must be used to pay off existing debts"
    }
  },
  {
    name: "Personal Loan Prime",
    bank: "IDFC First Bank",
    type: "personal" as const,
    rateApr: "10.0",
    minIncome: "300000",
    minCreditScore: 750,
    tenureMinMonths: 12,
    tenureMaxMonths: 60,
    processingFeePct: "2.0",
    prepaymentAllowed: true,
    disbursalSpeed: "fast",
    docsLevel: "minimal",
    summary: "Premium personal loan with lowest interest rates for high credit score customers. Zero prepayment charges.",
    faq: [
      { question: "What makes this loan special?", answer: "Lowest interest rates for customers with credit score above 750." },
      { question: "Are there prepayment charges?", answer: "No prepayment charges after 6 months." },
      { question: "What is the processing time?", answer: "Approval within 30 minutes, disbursal within 4 hours." }
    ],
    terms: {
      "eligibility": "Minimum credit score of 750 required",
      "prepayment": "No charges after 6 months"
    }
  },
  {
    name: "Study Abroad Loan",
    bank: "Axis Bank",
    type: "education" as const,
    rateApr: "9.0",
    minIncome: "300000",
    minCreditScore: 700,
    tenureMinMonths: 12,
    tenureMaxMonths: 120,
    processingFeePct: "1.5",
    prepaymentAllowed: true,
    disbursalSpeed: "standard",
    docsLevel: "comprehensive",
    summary: "Specialized loan for international education. Covers tuition, living expenses, and travel costs.",
    faq: [
      { question: "Which countries are covered?", answer: "All countries with recognized universities." },
      { question: "What expenses are covered?", answer: "Tuition fees, living expenses, travel, and other related costs." },
      { question: "Is collateral required?", answer: "Collateral required for loans above ₹7.5 lakhs." }
    ],
    terms: {
      "eligibility": "Admission to recognized international universities",
      "co-applicant": "Parent or guardian as co-applicant mandatory"
    }
  },
  {
    name: "Home Loan Smart",
    bank: "HDFC Bank",
    type: "home" as const,
    rateApr: "8.5",
    minIncome: "600000",
    minCreditScore: 750,
    tenureMinMonths: 60,
    tenureMaxMonths: 360,
    processingFeePct: "0.5",
    prepaymentAllowed: true,
    disbursalSpeed: "standard",
    docsLevel: "comprehensive",
    summary: "Smart home loan with flexible EMI options. Balance transfer facility available.",
    faq: [
      { question: "Can I transfer my existing home loan?", answer: "Yes, balance transfer facility available with top-up option." },
      { question: "What are the EMI options?", answer: "Fixed, floating, or hybrid EMI options available." },
      { question: "Is there a top-up facility?", answer: "Yes, top-up loan available up to 80% of property value." }
    ],
    terms: {
      "eligibility": "Salaried or self-employed with stable income",
      "property": "Residential properties only"
    }
  },
  {
    name: "Two-Wheeler Loan",
    bank: "Hero FinCorp",
    type: "vehicle" as const,
    rateApr: "12.5",
    minIncome: "150000",
    minCreditScore: 650,
    tenureMinMonths: 12,
    tenureMaxMonths: 60,
    processingFeePct: "2.0",
    prepaymentAllowed: true,
    disbursalSpeed: "fast",
    docsLevel: "minimal",
    summary: "Easy two-wheeler financing with minimal documentation. Quick approval for bikes and scooters.",
    faq: [
      { question: "What is the maximum loan amount?", answer: "Up to 90% of on-road price." },
      { question: "What documents are needed?", answer: "Minimal documents - PAN, Aadhaar, and income proof." },
      { question: "How fast is the approval?", answer: "Approval within 1 hour, disbursal same day." }
    ],
    terms: {
      "eligibility": "Salaried or self-employed individuals",
      "age": "18-65 years"
    }
  },
  {
    name: "Personal Loan Lite",
    bank: "Yes Bank",
    type: "personal" as const,
    rateApr: "11.0",
    minIncome: "250000",
    minCreditScore: 700,
    tenureMinMonths: 6,
    tenureMaxMonths: 48,
    processingFeePct: "2.5",
    prepaymentAllowed: false,
    disbursalSpeed: "standard",
    docsLevel: "standard",
    summary: "Light personal loan with flexible tenure options. Ideal for short-term financial needs.",
    faq: [
      { question: "What is the minimum loan amount?", answer: "Minimum loan amount is ₹50,000." },
      { question: "Are there prepayment charges?", answer: "Yes, 2% prepayment charges apply." },
      { question: "What is the maximum loan amount?", answer: "Up to ₹20 lakhs based on income." }
    ],
    terms: {
      "eligibility": "Salaried individuals with minimum 1 year experience",
      "prepayment": "2% charges on prepayment"
    }
  },
  {
    name: "Education Loan Scholar",
    bank: "PNB",
    type: "education" as const,
    rateApr: "8.75",
    minIncome: "200000",
    minCreditScore: 680,
    tenureMinMonths: 12,
    tenureMaxMonths: 120,
    processingFeePct: "1.0",
    prepaymentAllowed: true,
    disbursalSpeed: "standard",
    docsLevel: "standard",
    summary: "Comprehensive education loan for Indian institutions. Special rates for meritorious students.",
    faq: [
      { question: "What is the interest rate for meritorious students?", answer: "0.5% concession for students with 80%+ marks." },
      { question: "Is collateral required?", answer: "Collateral required for loans above ₹7.5 lakhs." },
      { question: "What is the moratorium period?", answer: "Course duration + 6 months after course completion." }
    ],
    terms: {
      "eligibility": "Admission to recognized Indian institutions",
      "merit": "Interest concession for high-performing students"
    }
  }
];

export async function seedDatabase() {
  try {
    console.log("Seeding database...");
    await db.insert(products).values(seedProducts);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

