import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { isAuthenticated, setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { analyzeBusinessTrends, generateBlueprintContent, discoverTrendingNeeds } from "./openai";
import { triggerPostPurchaseSequence } from "./emailService";
import { insertBlueprintSchema } from "@shared/schema";
import { z } from "zod";

// Admin email whitelist - add admin emails here
const ADMIN_EMAILS: string[] = [
  "wholefoo@gmail.com",
];

// Server-side admin authorization middleware
function isAdmin(req: any, res: Response, next: NextFunction) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const email = user?.claims?.email as string | undefined;
  const userId = user?.claims?.sub as string | undefined;
  
  console.log("[Admin Check] Email:", email, "UserId:", userId, "Claims:", JSON.stringify(user?.claims));
  
  // Check if user is an admin (via whitelist or special patterns)
  // In production, you should use a proper role field in the database
  const isAuthorized = 
    (email && ADMIN_EMAILS.includes(email)) || 
    userId === "admin" ||
    (email && email.includes("admin"));

  if (!isAuthorized) {
    console.log("[Admin Check] Not authorized. Email in whitelist:", ADMIN_EMAILS.includes(email || ""));
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (session, passport, login/logout routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Stripe webhook - MUST be before express.json()
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          console.error('Webhook body is not a Buffer');
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  // Apply JSON parsing for all other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Public routes
  app.get("/api/blueprints", async (req: Request, res: Response) => {
    try {
      const blueprints = await storage.getBlueprints();
      res.json(blueprints);
    } catch (error) {
      console.error("Error fetching blueprints:", error);
      res.status(500).json({ error: "Failed to fetch blueprints" });
    }
  });

  app.get("/api/blueprints/:id", async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam);
      const blueprint = await storage.getBlueprint(id);
      
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      
      res.json(blueprint);
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      res.status(500).json({ error: "Failed to fetch blueprint" });
    }
  });

  // Download blueprint as PDF (requires purchase)
  app.get("/api/blueprints/:id/download", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      
      const blueprint = await storage.getBlueprint(id);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      const hasPurchased = await storage.hasPurchased(userId, id);
      if (!hasPurchased) {
        return res.status(403).json({ error: "You must purchase this blueprint to download" });
      }

      // Generate PDF from markdown content
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper to add new page if needed
      const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(blueprint.title, maxWidth);
      checkPageBreak(titleLines.length * 10);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 10 + 5;

      // Tier and Category
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Tier: ${blueprint.tier.charAt(0).toUpperCase() + blueprint.tier.slice(1)} | Category: ${blueprint.category}`, margin, y);
      y += 10;
      doc.setTextColor(0, 0, 0);

      // Horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Helper to clean markdown formatting from text
      const cleanMarkdown = (text: string): string => {
        return text
          .replace(/\*\*(.*?)\*\*/g, "$1")  // Bold
          .replace(/\*(.*?)\*/g, "$1")       // Italic
          .replace(/__(.*?)__/g, "$1")       // Bold alt
          .replace(/_(.*?)_/g, "$1")         // Italic alt
          .replace(/`(.*?)`/g, "$1")         // Inline code
          .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links - keep text
          .replace(/!\[.*?\]\(.*?\)/g, "")   // Images - remove
          .replace(/~~(.*?)~~/g, "$1")       // Strikethrough
          .replace(/>\s?/g, "")              // Blockquotes
          .replace(/#{1,6}\s?/g, "");        // Any remaining headers
      };

      // Process content - convert markdown to formatted text
      const content = blueprint.content;
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          y += 4;
          continue;
        }

        // Horizontal rules
        if (/^[-*_]{3,}$/.test(trimmedLine)) {
          checkPageBreak(10);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;
          continue;
        }

        // H1 Headers
        if (trimmedLine.startsWith("# ")) {
          checkPageBreak(15);
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^# /, ""));
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, y);
          y += headerLines.length * 8 + 6;
        } 
        // H2 Headers
        else if (trimmedLine.startsWith("## ")) {
          checkPageBreak(12);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^## /, ""));
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, y);
          y += headerLines.length * 6 + 4;
        } 
        // H3 Headers
        else if (trimmedLine.startsWith("### ")) {
          checkPageBreak(10);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^### /, ""));
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, y);
          y += headerLines.length * 5 + 3;
        }
        // H4 Headers
        else if (trimmedLine.startsWith("#### ")) {
          checkPageBreak(10);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^#### /, ""));
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, y);
          y += headerLines.length * 5 + 3;
        }
        // Bullet points
        else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          const bulletText = cleanMarkdown(trimmedLine.replace(/^[-*]\s+/, ""));
          const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 8);
          checkPageBreak(bulletLines.length * 5);
          doc.text("•", margin, y);
          doc.text(bulletLines, margin + 6, y);
          y += bulletLines.length * 5 + 2;
        } 
        // Numbered lists
        else if (/^\d+[\.\)]\s/.test(trimmedLine)) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          const numMatch = trimmedLine.match(/^(\d+[\.\)])\s*(.*)/);
          if (numMatch) {
            const numberPart = numMatch[1];
            const textPart = cleanMarkdown(numMatch[2]);
            const numberedLines = doc.splitTextToSize(textPart, maxWidth - 10);
            checkPageBreak(numberedLines.length * 5);
            doc.text(numberPart, margin, y);
            doc.text(numberedLines, margin + 8, y);
            y += numberedLines.length * 5 + 2;
          }
        } 
        // Regular paragraph
        else {
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          const cleanText = cleanMarkdown(trimmedLine);
          if (cleanText.trim()) {
            const paraLines = doc.splitTextToSize(cleanText, maxWidth);
            checkPageBreak(paraLines.length * 5);
            doc.text(paraLines, margin, y);
            y += paraLines.length * 5 + 3;
          }
        }
      }

      // Footer on last page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`AI Blueprint Pulse | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${blueprint.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error downloading blueprint:", error);
      res.status(500).json({ error: "Failed to download blueprint" });
    }
  });

  // User purchases
  app.get("/api/purchases", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const purchases = await storage.getPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.get("/api/purchases/detailed", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const purchases = await storage.getPurchasesWithBlueprints(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // Stripe checkout
  app.post("/api/checkout", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const { blueprintId } = req.body;

      const blueprint = await storage.getBlueprint(blueprintId);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      const hasPurchased = await storage.hasPurchased(userId, blueprintId);
      if (hasPurchased) {
        return res.status(400).json({ error: "You already own this blueprint" });
      }

      // Handle free blueprints - no Stripe needed
      if (blueprint.price === 0) {
        await storage.createPurchase({
          userId,
          blueprintId,
          amount: 0,
          stripeSessionId: `free_${Date.now()}`,
          status: "completed",
        });
        
        // Send email for free blueprint
        const userEmail = req.user?.claims?.email;
        if (userEmail) {
          const { triggerPostPurchaseSequence } = await import("./emailService");
          triggerPostPurchaseSequence(userEmail, blueprint.title, blueprint.tier);
        }
        
        return res.json({ free: true, blueprintId });
      }

      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: blueprint.title,
                description: blueprint.description,
              },
              unit_amount: blueprint.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
        metadata: {
          blueprintId: blueprintId.toString(),
          userId: userId,
        },
      });

      // Create pending purchase
      await storage.createPurchase({
        userId,
        blueprintId,
        amount: blueprint.price,
        stripeSessionId: session.id,
        status: "pending",
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Verify payment and complete purchase
  app.post("/api/checkout/verify", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { sessionId } = req.body;
      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === "paid") {
        const purchase = await storage.getPurchaseBySession(sessionId);
        if (purchase && purchase.status !== "completed") {
          await storage.updatePurchase(purchase.id, { status: "completed" });
          
          // Trigger post-purchase email sequence
          const blueprint = await storage.getBlueprint(purchase.blueprintId);
          const userEmail = req.user?.claims?.email;
          const firstName = req.user?.claims?.first_name || req.user?.claims?.given_name || "there";
          
          if (blueprint && userEmail) {
            triggerPostPurchaseSequence(
              userEmail,
              blueprint.title,
              blueprint.tier,
              firstName
            ).catch(err => console.error("[Email] Sequence error:", err));
          }
        }
        res.json({ status: "completed" });
      } else {
        res.json({ status: session.payment_status });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Admin routes - protected with isAdmin middleware
  app.get("/api/admin/research-sessions", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessions = await storage.getResearchSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching research sessions:", error);
      res.status(500).json({ error: "Failed to fetch research sessions" });
    }
  });

  app.post("/api/admin/research", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const { topic } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      // Create research session
      const session = await storage.createResearchSession({
        userId,
        topic,
        status: "processing",
      });

      // Analyze trends using OpenAI
      const searchResults = await analyzeBusinessTrends(topic);

      // Update session with results
      await storage.updateResearchSession(session.id, {
        searchResults,
        status: "completed",
      });

      res.json({ searchResults, sessionId: session.id });
    } catch (error) {
      console.error("Error performing research:", error);
      res.status(500).json({ error: "Failed to perform research" });
    }
  });

  // Trend Discovery - find needs in online communities
  app.post("/api/admin/discover", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { category = "general" } = req.body;

      const results = await discoverTrendingNeeds(category);

      res.json({ results });
    } catch (error) {
      console.error("Error discovering trends:", error);
      res.status(500).json({ error: "Failed to discover trends" });
    }
  });

  app.post("/api/admin/generate", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { topic, research, tier = "growth" } = req.body;

      if (!topic || !research) {
        return res.status(400).json({ error: "Topic and research are required" });
      }

      // Validate tier
      const validTiers = ["starter", "growth", "enterprise"] as const;
      const selectedTier = validTiers.includes(tier) ? tier : "growth";

      const generated = await generateBlueprintContent(topic, research, selectedTier);

      res.json(generated);
    } catch (error) {
      console.error("Error generating blueprint:", error);
      res.status(500).json({ error: "Failed to generate blueprint" });
    }
  });

  app.post("/api/admin/blueprints", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const validatedData = insertBlueprintSchema.parse(req.body);
      const blueprint = await storage.createBlueprint(validatedData);
      res.status(201).json(blueprint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid blueprint data", details: error.errors });
      }
      console.error("Error creating blueprint:", error);
      res.status(500).json({ error: "Failed to create blueprint" });
    }
  });

  // Update blueprint (admin only)
  app.patch("/api/admin/blueprints/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const blueprint = await storage.updateBlueprint(id, updates);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      res.json(blueprint);
    } catch (error) {
      console.error("Error updating blueprint:", error);
      res.status(500).json({ error: "Failed to update blueprint" });
    }
  });

  return httpServer;
}
