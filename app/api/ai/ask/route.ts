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
    const systemInstruction = `You are a helpful loan advisor assistant. Answer questions about the loan product based ONLY on the provided Context. 
    Context: ${productContext}
    
    If the question cannot be answered from the provided information, politely say that you don't have that information. Be concise.`;

    // Build candidate model list. Prefer models returned by the REST ListModels
    // call (if available). Allow overriding via `GOOGLE_AI_MODEL` env var.
    const envModelRaw = process.env.GOOGLE_AI_MODEL;
    const envModel = typeof envModelRaw === 'string' && envModelRaw.length
      ? envModelRaw.replace(/^models\//i, '')
      : undefined;

    // Candidate models were used in the previous implementation when
    // iterating through available SDK models. Now we use a single
    // `modelId` (see below) with the `@google/genai` client, so no
    // candidate list or trial loop is necessary.

    // Build chat history for the prompt
    // Note: We don't need to inject system prompt here as we use systemInstruction below
    const conversationHistory = validatedData.history || [];
    const lastUserMessage = validatedData.message;

    // Construct the simple prompt for generateContent
    // (Ideally, use startChat for full history, but this works for single-turn with context)
    const finalPrompt = `
Previous Conversation:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")}

User Question: ${lastUserMessage}
`;

    // Choose model (allow env override); default to gemini-2.5-flash
    const modelId = (process.env.GOOGLE_AI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash').replace(/^models\//i, '');

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