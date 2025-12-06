import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { aiAskSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = aiAskSchema.parse(body);

    // Fetch product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Initialize Google AI
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey || apiKey.startsWith("your_")) {
      return NextResponse.json(
        { 
          error: "AI API key not configured.",
          answer: "I apologize, but the AI service is not configured correctly."
        },
        { status: 500 }
      );
    }

    // Use the new @google/genai client for generation.
    const ai = new GoogleGenAI({ apiKey });
    
    // Build context from product data
    const productContext = `
Product Information:
- Name: ${product.name}
- Bank: ${product.bank}
- Type: ${product.type}
- APR: ${product.rateApr}%
- Minimum Income: ₹${product.minIncome}
- Credit Score Req: ${product.minCreditScore}
- Tenure: ${product.tenureMinMonths}-${product.tenureMaxMonths} months
- Processing Fee: ${product.processingFeePct}%
- Prepayment: ${product.prepaymentAllowed ? "Yes" : "No"}
- Summary: ${product.summary || "N/A"}

FAQs:
${JSON.stringify(product.faq, null, 2)}

Terms:
${JSON.stringify(product.terms, null, 2)}
`;

    // System instruction (Native support in Gemini 1.5)
    const systemInstruction = `You are a helpful loan advisor assistant. Answer questions about the loan product based on the provided product information below.

${productContext}

You MUST use the APR value provided above when calculating EMI or monthly payments. Use the standard EMI formula:
EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
where P = principal, r = monthly interest rate (APR/12/100), n = tenure in months.

If the question cannot be answered from the provided information, politely say that you don't have that information. Be concise and helpful.`;

    console.log('[AI Route] Product APR:', product.rateApr);
    console.log('[AI Route] System instruction length:', systemInstruction.length);

    // Build candidate model list. Prefer models returned by the REST ListModels
    // call (if available). Allow overriding via `GOOGLE_AI_MODEL` env var.
    const envModelRaw = process.env.GOOGLE_AI_MODEL;
    const envModel = typeof envModelRaw === 'string' && envModelRaw.length
      ? envModelRaw.replace(/^models\//i, '')
      : undefined;

    const conversationHistory = validatedData.history || [];
    const lastUserMessage = validatedData.message;

    // Filter out system messages from history since systemInstruction already contains product context
    const userAssistantHistory = conversationHistory.filter((msg: any) => msg.role !== 'system');

    // Construct the simple prompt for generateContent and include systemInstruction
    // (Ideally, use startChat for full history, but this works for single-turn with context)
    const finalPrompt = `
${systemInstruction}

Previous Conversation:
${userAssistantHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")}

User Question: ${lastUserMessage}
`;

    // Choose model (allow env override); prefer normalized envModel if present
    const modelId = envModel ?? ((process.env.GEMINI_MODEL || 'gemini-2.5-flash').replace(/^models\//i, ''));

    try {
      const genResp: any = await ai.models.generateContent({ model: modelId, contents: finalPrompt });
      // response.text is used by some SDKs; fallback to common fields
      const answer = genResp?.text ?? genResp?.outputText ?? (Array.isArray(genResp?.result) ? genResp.result[0]?.output?.[0]?.content?.text : undefined) ?? '';

      return NextResponse.json({ answer, productId: validatedData.productId });
    } catch (err: unknown) {
      console.error('GenAI generateContent error:', err);
      return NextResponse.json({ error: 'AI generation failed', details: process.env.NODE_ENV !== 'production' ? String(err) : undefined }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in AI ask:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}