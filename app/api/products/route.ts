import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { productFilterSchema } from "@/lib/validations";
import { and, gte, lte, ilike, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      bank: searchParams.get("bank") || undefined,
      minApr: searchParams.get("minApr") || undefined,
      maxApr: searchParams.get("maxApr") || undefined,
      minIncome: searchParams.get("minIncome") || undefined,
      minCreditScore: searchParams.get("minCreditScore") || undefined,
      type: searchParams.get("type") || undefined,
    };

    const validatedFilters = productFilterSchema.parse(filters);

    let query = db.select().from(products);

    const conditions = [];

    if (validatedFilters.bank) {
      conditions.push(ilike(products.bank, `%${validatedFilters.bank}%`));
    }

    if (validatedFilters.minApr !== undefined) {
      conditions.push(gte(products.rateApr, validatedFilters.minApr.toString()));
    }

    if (validatedFilters.maxApr !== undefined) {
      conditions.push(lte(products.rateApr, validatedFilters.maxApr.toString()));
    }

    if (validatedFilters.minIncome !== undefined) {
      conditions.push(gte(products.minIncome, validatedFilters.minIncome.toString()));
    }

    if (validatedFilters.minCreditScore !== undefined) {
      conditions.push(gte(products.minCreditScore, validatedFilters.minCreditScore));
    }

    if (validatedFilters.type) {
      conditions.push(eq(products.type, validatedFilters.type));
    }

    if (conditions.length > 0) {
      query = db.select().from(products).where(and(...conditions));
    }

    const allProducts = await query;

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

