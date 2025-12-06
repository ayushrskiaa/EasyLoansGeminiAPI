"use client";

import { Product } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductChat } from "@/components/product-chat";
import { useState } from "react";
import { getProductBadges } from "@/lib/badge-logic";
import { Sparkles } from "lucide-react";

interface BestMatchCardProps {
  product: Product;
}

export function BestMatchCard({ product }: BestMatchCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const badges = getProductBadges(product);

  return (
    <>
      <Card className="border-2 border-primary shadow-xl">
        <CardHeader className="bg-gradient-to-r from-white to-sky-50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="default" className="text-sm">Best Match</Badge>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">{product.summary || "No description available"}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1">{product.bank}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">APR</div>
              <div className="text-2xl font-bold text-primary">{product.rateApr}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Min Income</div>
              <div className="text-lg font-semibold">
                ₹{parseFloat(product.minIncome).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Min Credit Score</div>
              <div className="text-lg font-semibold">{product.minCreditScore}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Tenure</div>
              <div className="text-lg font-semibold">
                {product.tenureMinMonths}-{product.tenureMaxMonths} months
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant as "default" | "secondary" | "success" | "warning" | "outline"}
                className="text-sm"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setChatOpen(true)}
            aria-label={`Ask about ${product.name}`}
          >
            Ask About This Product
          </Button>
        </CardFooter>
      </Card>
      <ProductChat
        product={product}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </>
  );
}

