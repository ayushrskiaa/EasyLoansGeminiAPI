"use client";

import { Product } from "@/lib/db/schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductChatProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Build a concise product context to send as a system message and to the API
function buildProductContext(product: Product) {
  return `Product Information:\n- Name: ${product.name}\n- Bank: ${product.bank}\n- Type: ${product.type}\n- APR: ${product.rateApr}%\n- Minimum Income: ₹${product.minIncome}\n- Minimum Credit Score: ${product.minCreditScore}\n- Tenure: ${product.tenureMinMonths}-${product.tenureMaxMonths} months\n- Processing Fee: ${product.processingFeePct}%\n- Prepayment Allowed: ${product.prepaymentAllowed ? "Yes" : "No"}\n- Summary: ${product.summary || "N/A"}`;
}


function renderAssistantContent(text: string) {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const parseInline = (s: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = boldRegex.exec(s)) !== null) {
      const before = s.slice(lastIndex, match.index);
      if (before) parts.push(escape(before));
      parts.push(<strong key={`b-${lastIndex}`}>{escape(match[1])}</strong>);
      lastIndex = match.index + match[0].length;
    }
    const rest = s.slice(lastIndex);
    if (rest) parts.push(escape(rest));
    return parts;
  };

  const lines = text.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] | null = null;

  const flushList = () => {
    if (listBuffer && listBuffer.length) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="ml-4 list-disc space-y-1">
          {listBuffer.map((li, i) => (
            <li key={`li-${i}`}>{parseInline(li)}</li>
          ))}
        </ul>
      );
    }
    listBuffer = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    const listMatch = line.match(/^[\-*]\s+(.*)$/);
    if (listMatch) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push(listMatch[1]);
    } else {
      flushList();
      if (line === "") {
        nodes.push(<div key={`br-${idx}`} className="h-2" />);
      } else {
        nodes.push(
          <p key={`p-${idx}`} className="text-sm leading-6">
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  flushList();
  return nodes;
}

export function ProductChat({ product, open, onOpenChange }: ProductChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          message: input,
          history: newMessages,
          productContext: buildProductContext(product),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Seed the conversation with a system message containing product context
      const sys = { role: "system" as const, content: buildProductContext(product) };
      setMessages([sys]);
      setInput("");
      setError(null);
    }
  }, [open, product]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {product.name}
            <Badge variant="secondary">{product.bank}</Badge>
          </SheetTitle>
          <SheetDescription>
            APR: {product.rateApr}% | Min Credit Score: {product.minCreditScore}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>Ask me anything about this loan product!</p>
              <p className="text-sm mt-2">Try asking about interest rates, eligibility, or terms.</p>
            </div>
          )}

          {messages.map((message, index) => {
            if (message.role === "system") {
              return (
                <div key={index} className="flex justify-center">
                  <div className="max-w-[90%] rounded-xl px-5 py-4 bg-sky-50 border border-sky-100 shadow-sm text-slate-700 font-mono italic text-sm">
                    <pre className="whitespace-pre-wrap leading-relaxed">{message.content}</pre>
                  </div>
                </div>
              );
            }

            // user message (right)
            if (message.role === "user") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            }

            // assistant (left) with card UI
            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-5 py-4 bg-sky-50 border border-sky-100 shadow-sm text-slate-900">
                  <div className="mb-2 text-xs text-sky-600 font-semibold">Assistant</div>
                  <div className="prose-sm prose-slate">{renderAssistantContent(message.content)}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this product..."
            disabled={loading}
            aria-label="Chat input"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

