"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/db/schema";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bank: "",
    minApr: "",
    maxApr: "",
    minIncome: "",
    minCreditScore: "",
    type: "all",
  });
  // router not needed here; navigation handled via Link components

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.bank) params.set("bank", filters.bank);
      if (filters.minApr) params.set("minApr", filters.minApr);
      if (filters.maxApr) params.set("maxApr", filters.maxApr);
      if (filters.minIncome) params.set("minIncome", filters.minIncome);
      if (filters.minCreditScore) params.set("minCreditScore", filters.minCreditScore);
      if (filters.type && filters.type !== 'all') params.set("type", filters.type);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchProducts();
  };

  const handleClearFilters = () => {
    setFilters({
      bank: "",
      minApr: "",
      maxApr: "",
      minIncome: "",
      minCreditScore: "",
      type: "all",
    });
    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Loan Products</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
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
          <h2 className="text-3xl font-bold mb-2">Browse All Products</h2>
          <p className="text-muted-foreground">
            Filter and search through all available loan products
          </p>
        </div>

        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bank">Bank Name</Label>
              <Input
                id="bank"
                placeholder="Search bank..."
                value={filters.bank}
                onChange={(e) => handleFilterChange("bank", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="minApr">Min APR (%)</Label>
              <Input
                id="minApr"
                type="number"
                placeholder="0"
                value={filters.minApr}
                onChange={(e) => handleFilterChange("minApr", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxApr">Max APR (%)</Label>
              <Input
                id="maxApr"
                type="number"
                placeholder="100"
                value={filters.maxApr}
                onChange={(e) => handleFilterChange("maxApr", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="minIncome">Min Income (₹)</Label>
              <Input
                id="minIncome"
                type="number"
                placeholder="0"
                value={filters.minIncome}
                onChange={(e) => handleFilterChange("minIncome", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="minCreditScore">Min Credit Score</Label>
              <Input
                id="minCreditScore"
                type="number"
                placeholder="300"
                value={filters.minCreditScore}
                onChange={(e) => handleFilterChange("minCreditScore", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Loan Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="credit_line">Credit Line</SelectItem>
                  <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading products...</div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

