"use client";

import { Product } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductChat } from "@/components/product-chat";
import { useState } from "react";
import { getProductBadges } from "@/lib/badge-logic";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const badges = getProductBadges(product);



  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">{product.summary || "No description available"}</CardDescription>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary">{product.bank}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">APR</span>
              <span className="text-lg font-semibold">{product.rateApr}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Min Income</span>
              <span className="text-sm">₹{parseFloat(product.minIncome).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Min Credit Score</span>
              <span className="text-sm">{product.minCreditScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tenure</span>
              <span className="text-sm">
                {product.tenureMinMonths}-{product.tenureMaxMonths} months
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {badges.slice(0, 3).map((badge, index) => (
                <Badge key={index} variant={badge.variant as "default" | "secondary" | "success" | "warning" | "outline"}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setChatOpen(true)}
            aria-label={`Ask about ${product.name}`}
          >
            Ask About Product
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

