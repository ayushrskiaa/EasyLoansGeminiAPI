"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/db/schema";
import { ProductCard } from "@/components/product-card";
import { BestMatchCard } from "@/components/best-match-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Dashboard() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        const response = await fetch("/api/products");
        const products: Product[] = await response.json();
        
        // Sort by APR (lower is better) and take top 5
        const sorted = products
          .sort((a, b) => parseFloat(a.rateApr) - parseFloat(b.rateApr))
          .slice(0, 5);
        
        setTopProducts(sorted);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const bestMatch = topProducts[0];
  const otherProducts = topProducts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loan Picks Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/products">
              <Button variant="outline">All Products</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Top Loan Matches</h2>
          <p className="text-muted-foreground">
            Based on your profile, here are the best loan options for you
          </p>
        </div>

        {bestMatch && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Best Match</h3>
            <BestMatchCard product={bestMatch} />
          </div>
        )}

        {otherProducts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Other Top Picks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {otherProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {topProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}

