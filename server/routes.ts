import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import passport from "passport";
import { isAuthenticated, setupAuth, getSession, registerAuthRoutes } from "./replit_integrations/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { analyzeBusinessTrends, generateBlueprintContent, discoverTrendingNeeds, generateAgentScript, businessInsiderIntelligence, generateBlogPost } from "./openai";
import { multiModelAnalyze, multiModelBlueprintResearch } from "./multiModelService";
import { triggerPostPurchaseSequence } from "./emailService";
import { submitNexusResearch, handleNexusCallback, getNexusJobStatus, getUserNexusJobs } from "./nexusResearchService";
import { extractVideoId, getVideoInfo, fetchComments, analyzePainPoints, searchVideos } from "./youtubeScraperService";
import { generateYouTubeGuide, generateAgenticWorkflowGuide } from "./pdfGuideService";
import { insertBlueprintSchema, insertBlogPostSchema, nexusJobStatuses } from "@shared/schema";
import type { NexusJobStatus } from "@shared/schema";
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
  
  try {
    await setupAuth(app);
  } catch (error) {
    console.error("[Auth] Failed to setup auth on startup (OIDC may be unavailable):", error instanceof Error ? error.message : error);
    console.log("[Auth] Server will start without auth. Auth routes will return 503 until OIDC recovers.");
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user: Express.User, cb: any) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb: any) => cb(null, user));
  }
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

  const SITE_URL = "https://aiblueprintpulse.com";

  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /profile
Disallow: /checkout/*
Disallow: /api/

# AI Crawlers
User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: Anthropic-AI
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: PerplexityBot
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const blogPosts = await storage.getPublishedBlogPosts();
      const blueprints = await storage.getBlueprints();
      const now = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/marketplace</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/studio</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

      for (const post of blogPosts) {
        const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split("T")[0] : now;
        xml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
      }

      for (const bp of blueprints) {
        xml += `
  <url>
    <loc>${SITE_URL}/blueprint/${bp.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }

      xml += `
</urlset>`;

      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

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

      // Log the download
      try {
        await storage.createPdfDownload({
          blueprintId: id,
          userId: userId,
          userEmail: req.user?.claims?.email || null,
          ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || null,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (logError) {
        console.error("Failed to log download:", logError);
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
          .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // Bold+Italic
          .replace(/\*\*(.*?)\*\*/g, "$1")     // Bold
          .replace(/\*(.*?)\*/g, "$1")         // Italic
          .replace(/___(.*?)___/g, "$1")       // Bold+Italic alt
          .replace(/__(.*?)__/g, "$1")         // Bold alt
          .replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1") // Italic alt (word boundaries)
          .replace(/```[\s\S]*?```/g, "")      // Code blocks
          .replace(/`([^`]+)`/g, "$1")         // Inline code
          .replace(/\[(.*?)\]\([^)]*\)/g, "$1") // Links - keep text
          .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // Images - remove
          .replace(/~~(.*?)~~/g, "$1")         // Strikethrough
          .replace(/^>\s?/gm, "")              // Blockquotes
          .replace(/^#{1,6}\s+/gm, "")         // Headers at line start
          .replace(/\|/g, " ")                 // Table pipes
          .replace(/^[-:]+$/gm, "")            // Table separator lines
          .replace(/\s{2,}/g, " ")             // Multiple spaces to single
          .trim();
      };

      // Process content - convert markdown to formatted text
      // First, clean multi-line markdown elements from entire content
      let content = blueprint.content
        .replace(/```[\s\S]*?```/g, "")           // Remove code blocks
        .replace(/\|[^\n]+\|/g, (match) => match.replace(/\|/g, " ")) // Clean table rows
        .replace(/^[-:|]+$/gm, "")                // Remove table separators
        .replace(/!'/g, "→")                      // Convert !' to arrow
        .replace(/->/g, "→")                      // Convert -> to arrow
        .replace(/=>/g, "→");                     // Convert => to arrow
      
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
        // H5 Headers
        else if (trimmedLine.startsWith("##### ")) {
          checkPageBreak(10);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^##### /, ""));
          const headerLines = doc.splitTextToSize(headerText, maxWidth);
          doc.text(headerLines, margin, y);
          y += headerLines.length * 5 + 3;
        }
        // H6 Headers
        else if (trimmedLine.startsWith("###### ")) {
          checkPageBreak(10);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          const headerText = cleanMarkdown(trimmedLine.replace(/^###### /, ""));
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

  app.post("/api/admin/business-intelligence", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { industry, focusArea = "general" } = req.body;
      if (!industry) {
        return res.status(400).json({ error: "Industry is required" });
      }
      const results = await businessInsiderIntelligence(industry, focusArea);
      res.json({ results });
    } catch (error) {
      console.error("Error generating business intelligence:", error);
      res.status(500).json({ error: "Failed to generate intelligence briefing" });
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

  // Admin download tracking
  app.get("/api/admin/downloads", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const downloads = await storage.getPdfDownloads();
      res.json(downloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });

  app.get("/api/admin/downloads/stats", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const stats = await storage.getPdfDownloadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching download stats:", error);
      res.status(500).json({ error: "Failed to fetch download stats" });
    }
  });

  // N8N Blueprint Research Integration (legacy)
  app.post("/api/admin/n8n/trigger-research", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { orderId, customerEmail, targetBusinessSector } = req.body;

      if (!orderId || !customerEmail || !targetBusinessSector) {
        return res.status(400).json({ error: "orderId, customerEmail, and targetBusinessSector are required" });
      }

      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      const apiKey = process.env.N8N_API_KEY;

      if (!webhookUrl) {
        return res.status(500).json({ error: "N8N webhook URL not configured" });
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          orderId,
          customerEmail,
          targetBusinessSector,
        }),
      });

      if (response.ok) {
        res.json({ success: true, message: "Research Started!" });
      } else {
        const errorText = await response.text();
        console.error("N8N webhook failed:", response.status, errorText);
        res.status(502).json({ 
          error: "Failed to trigger research workflow. Please contact support.",
        });
      }
    } catch (error) {
      console.error("Error triggering N8N research:", error);
      res.status(500).json({ 
        error: "Failed to connect to research service. Please contact support.",
      });
    }
  });

  // ===== Nexus Research Service API =====

  app.post("/api/nexus/research", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { businessIdea, sector } = req.body;

      if (!businessIdea || typeof businessIdea !== "string" || businessIdea.trim().length < 3) {
        return res.status(400).json({ error: "A business idea with at least 3 characters is required" });
      }

      const userId = req.user?.claims?.sub;
      const job = await submitNexusResearch(userId, businessIdea.trim(), sector?.trim());
      res.status(201).json(job);
    } catch (error) {
      console.error("[Nexus] Error submitting research:", error);
      res.status(500).json({ error: "Failed to submit research job" });
    }
  });

  app.get("/api/nexus/research", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const jobs = await getUserNexusJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("[Nexus] Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch research jobs" });
    }
  });

  app.get("/api/nexus/research/:jobId", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const jobId = parseInt(req.params.jobId);
      if (isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const job = await getNexusJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("[Nexus] Error fetching job status:", error);
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  });

  const nexusCallbackSchema = z.object({
    jobId: z.union([z.number(), z.string().transform(Number)]),
    status: z.enum(nexusJobStatuses),
    data: z.union([z.string(), z.record(z.unknown()), z.null()]).optional(),
  });

  app.post("/api/nexus/callback", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.N8N_API_KEY;
      const incomingKey = req.headers["x-api-key"];

      if (apiKey && incomingKey !== apiKey) {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        console.warn(`[Nexus] Unauthorized callback attempt from IP: ${ip}`);
        return res.status(401).json({ error: "Invalid API key" });
      }

      const parsed = nexusCallbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid callback payload",
          details: parsed.error.errors.map(e => e.message),
        });
      }

      const { jobId, status, data } = parsed.data;
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      console.log(`[Nexus] Callback received: job=${jobId}, status=${status}, from=${ip}`);

      const updated = await handleNexusCallback(
        jobId,
        status,
        data == null ? undefined : typeof data === "string" ? data : JSON.stringify(data)
      );

      if (!updated) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({ success: true, job: updated });
    } catch (error) {
      console.error("[Nexus] Callback error:", error);
      res.status(500).json({ error: "Callback processing failed" });
    }
  });

  // ===== CLIENT BLUEPRINT STUDIO ROUTES =====

  const CREDIT_PACKAGES = [
    { id: "single", credits: 1, price: 1000, label: "1 Blueprint" },
    { id: "five", credits: 5, price: 4000, label: "5 Blueprints" },
    { id: "ten", credits: 10, price: 7500, label: "10 Blueprints" },
  ];

  app.get("/api/credits", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const credit = await storage.getCreditBalance(userId);
      res.json({ balance: credit?.balance || 0, totalPurchased: credit?.totalPurchased || 0, totalUsed: credit?.totalUsed || 0 });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  app.get("/api/credits/packages", (req: Request, res: Response) => {
    res.json({ packages: CREDIT_PACKAGES });
  });

  app.post("/api/credits/purchase", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const { packageId } = req.body;

      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!pkg) {
        return res.status(400).json({ error: "Invalid package" });
      }

      const stripe = await getUncachableStripeClient();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Blueprint Credits - ${pkg.label}`,
                description: `${pkg.credits} blueprint credit${pkg.credits > 1 ? "s" : ""} for the Blueprint Studio. Includes full resale rights on generated blueprints.`,
              },
              unit_amount: pkg.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/studio?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/studio?purchase=cancelled`,
        metadata: {
          type: "blueprint_credits",
          packageId: pkg.id,
          credits: pkg.credits.toString(),
          userId,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating credit checkout:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/credits/verify", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const { sessionId } = req.body;

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const metadataUserId = session.metadata?.userId;
        if (metadataUserId !== userId) {
          return res.status(403).json({ error: "Session does not belong to this user" });
        }

        const credits = parseInt(session.metadata?.credits || "0");
        const packageId = session.metadata?.packageId || "";

        if (credits > 0) {
          const existingTx = await storage.getCreditTransactions(userId);
          const alreadyCredited = existingTx.some(tx => tx.stripeSessionId === sessionId);

          if (!alreadyCredited) {
            await storage.addCredits(userId, credits, sessionId, `Purchased ${credits} credit${credits > 1 ? "s" : ""} (${packageId} package)`);
          }
        }

        const balance = await storage.getCreditBalance(userId);
        res.json({ status: "completed", balance: balance?.balance || 0 });
      } else {
        res.json({ status: session.payment_status });
      }
    } catch (error) {
      console.error("Error verifying credit purchase:", error);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  app.get("/api/credits/transactions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await storage.getCreditTransactions(userId);
      res.json({ transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/studio/blueprints", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const blueprintsList = await storage.getGeneratedBlueprints(userId);
      res.json({ blueprints: blueprintsList });
    } catch (error) {
      console.error("Error fetching generated blueprints:", error);
      res.status(500).json({ error: "Failed to fetch blueprints" });
    }
  });

  app.post("/api/studio/generate", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const { topic, tier, category } = req.body;

      if (!topic || !tier || !category) {
        return res.status(400).json({ error: "Topic, tier, and category are required" });
      }

      const credit = await storage.getCreditBalance(userId);
      if (!credit || credit.balance <= 0) {
        return res.status(403).json({ error: "No blueprint credits remaining. Please purchase a credit package." });
      }

      const used = await storage.useCredit(userId, `Generated blueprint: ${topic}`);
      if (!used) {
        return res.status(403).json({ error: "Failed to use credit" });
      }

      let result;
      try {
        const multiModelResearch = await multiModelBlueprintResearch(topic, tier);
        const research = `${multiModelResearch}\n\nUser requested a ${tier} tier blueprint about: ${topic}. Category: ${category}. Generate a comprehensive, actionable business blueprint.`;
        result = await generateBlueprintContent(topic, research, tier as any);
      } catch (genError) {
        await storage.addCredits(userId, 1, undefined, `Refund: generation failed for "${topic}"`);
        console.error("Blueprint generation failed, credit refunded:", genError);
        return res.status(500).json({ error: "Blueprint generation failed. Your credit has been refunded." });
      }

      const generated = await storage.createGeneratedBlueprint({
        userId,
        title: result.title,
        description: result.description,
        content: result.content,
        tier,
        category,
        topic,
        status: "completed",
      });

      res.json({ blueprint: generated });
    } catch (error) {
      console.error("Error generating blueprint:", error);
      res.status(500).json({ error: "Failed to generate blueprint" });
    }
  });

  app.get("/api/studio/blueprints/:id/download", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const id = parseInt(req.params.id);
      const blueprint = await storage.getGeneratedBlueprint(id, userId);

      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      const { generateDocx } = await import("./docxService");
      const docxBuffer = await generateDocx(blueprint.title, blueprint.content, blueprint.tier);

      const filename = blueprint.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + ".docx";

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(docxBuffer);
    } catch (error) {
      console.error("Error downloading blueprint:", error);
      res.status(500).json({ error: "Failed to download blueprint" });
    }
  });

  app.post("/api/studio/blueprints/:id/agent-script", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const id = parseInt(req.params.id);
      const blueprint = await storage.getGeneratedBlueprint(id, userId);

      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      if (blueprint.agentScript) {
        return res.json({ agentScript: blueprint.agentScript });
      }

      const script = await generateAgentScript(blueprint.title, blueprint.content, blueprint.topic, blueprint.tier);
      const updated = await storage.updateGeneratedBlueprintAgentScript(id, userId, script);

      res.json({ agentScript: updated?.agentScript || script });
    } catch (error) {
      console.error("Error generating agent script:", error);
      res.status(500).json({ error: "Failed to generate agent script" });
    }
  });

  app.get("/api/studio/blueprints/:id/agent-script/download", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      const id = parseInt(req.params.id);
      const blueprint = await storage.getGeneratedBlueprint(id, userId);

      if (!blueprint || !blueprint.agentScript) {
        return res.status(404).json({ error: "Agent script not found" });
      }

      const { generateDocx } = await import("./docxService");
      const docxBuffer = await generateDocx(
        `Agent Script: ${blueprint.title}`,
        blueprint.agentScript,
        blueprint.tier
      );

      const filename = `Agent_Script_${blueprint.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.docx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(docxBuffer);
    } catch (error) {
      console.error("Error downloading agent script:", error);
      res.status(500).json({ error: "Failed to download agent script" });
    }
  });

  // ===== CLIENT RESEARCH ROUTES (reuse admin research logic) =====

  app.post("/api/studio/discover", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { category } = req.body;
      const result = await discoverTrendingNeeds(category || "general");
      res.json({ result });
    } catch (error) {
      console.error("Error discovering trends:", error);
      res.status(500).json({ error: "Failed to discover trends" });
    }
  });

  app.post("/api/studio/analyze", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      const analysis = await analyzeBusinessTrends(topic);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing trends:", error);
      res.status(500).json({ error: "Failed to analyze trends" });
    }
  });

  app.post("/api/studio/multi-analyze", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { topic } = req.body;
      if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
        return res.status(400).json({ error: "Please provide a topic with at least 3 characters." });
      }
      const result = await multiModelAnalyze(topic.trim());
      res.json(result);
    } catch (error) {
      console.error("Error in multi-model analysis:", error);
      res.status(500).json({ error: "Failed to run multi-model analysis" });
    }
  });

  // YouTube Pain Point Discovery routes
  app.post("/api/youtube/search", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { query, maxResults } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      const results = await searchVideos(query, maxResults || 5);
      res.json({ results });
    } catch (error: any) {
      console.error("[YouTube] Search error:", error);
      res.status(500).json({ error: error.message || "Failed to search YouTube" });
    }
  });

  app.post("/api/youtube/analyze", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { videoUrl, sector, maxComments } = req.body;
      if (!videoUrl || typeof videoUrl !== "string") {
        return res.status(400).json({ error: "Video URL is required" });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL or video ID" });
      }

      const videoInfo = await getVideoInfo(videoId);
      const comments = await fetchComments(videoId, maxComments || 200);

      if (comments.length === 0) {
        return res.status(400).json({ error: "No comments found for this video. Comments may be disabled." });
      }

      const analysis = await analyzePainPoints(comments, videoInfo, sector);
      res.json(analysis);
    } catch (error: any) {
      console.error("[YouTube] Analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze video comments" });
    }
  });

  app.post("/api/youtube/comments", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { videoUrl, maxComments } = req.body;
      if (!videoUrl || typeof videoUrl !== "string") {
        return res.status(400).json({ error: "Video URL is required" });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL or video ID" });
      }

      const videoInfo = await getVideoInfo(videoId);
      const comments = await fetchComments(videoId, maxComments || 100);

      res.json({ videoInfo, comments, totalFetched: comments.length });
    } catch (error: any) {
      console.error("[YouTube] Comments fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch comments" });
    }
  });

  // ==========================================
  // Public Blog Routes
  // ==========================================
  app.get("/api/blog", async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post || !post.isPublished) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // ==========================================
  // Admin Blog Routes
  // ==========================================
  app.get("/api/admin/blog", isAuthenticated, isAdmin, async (_req: any, res: Response) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog/generate", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { topic, category } = req.body;
      if (!topic || !category) {
        return res.status(400).json({ error: "Topic and category are required" });
      }
      const result = await generateBlogPost(topic, category);
      res.json(result);
    } catch (error) {
      console.error("Error generating blog post:", error);
      res.status(500).json({ error: "Failed to generate blog post" });
    }
  });

  app.post("/api/admin/blog", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { title, slug, excerpt, content, category, coverImageUrl, authorName, isPublished } = req.body;
      if (!title || !slug || !excerpt || !content || !category) {
        return res.status(400).json({ error: "Title, slug, excerpt, content, and category are required" });
      }
      const post = await storage.createBlogPost({
        title,
        slug,
        excerpt,
        content,
        category,
        coverImageUrl: coverImageUrl || null,
        authorName: authorName || "AI Blueprint Pulse",
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      });
      res.status(201).json(post);
    } catch (error: any) {
      if (error?.code === "23505") {
        return res.status(409).json({ error: "A blog post with this slug already exists" });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/admin/blog/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { publishedAt, ...updates } = req.body;
      if (updates.isPublished === true) {
        updates.publishedAt = new Date();
      } else if (updates.isPublished === false) {
        updates.publishedAt = null;
      }
      const post = await storage.updateBlogPost(id, updates);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      if (error?.code === "23505") {
        return res.status(409).json({ error: "A blog post with this slug already exists" });
      }
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  let cachedYouTubeGuide: Buffer | null = null;
  let cachedAgenticGuide: Buffer | null = null;

  app.get("/api/resources/youtube-guide", async (_req: Request, res: Response) => {
    try {
      if (!cachedYouTubeGuide) {
        cachedYouTubeGuide = await generateYouTubeGuide();
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="AI-Blueprint-Pulse-YouTube-Success-Guide.pdf"');
      res.setHeader("Content-Length", cachedYouTubeGuide.length.toString());
      res.send(cachedYouTubeGuide);
    } catch (error) {
      console.error("Error generating YouTube guide:", error);
      res.status(500).json({ error: "Failed to generate guide" });
    }
  });

  app.get("/api/resources/agentic-workflow-guide", async (_req: Request, res: Response) => {
    try {
      if (!cachedAgenticGuide) {
        cachedAgenticGuide = await generateAgenticWorkflowGuide();
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="AI-Blueprint-Pulse-Agentic-Workflow-Guide.pdf"');
      res.setHeader("Content-Length", cachedAgenticGuide.length.toString());
      res.send(cachedAgenticGuide);
    } catch (error) {
      console.error("Error generating Agentic Workflow guide:", error);
      res.status(500).json({ error: "Failed to generate guide" });
    }
  });

  app.get("/api/resources", (_req: Request, res: Response) => {
    res.json([
      {
        id: "youtube-success-guide",
        title: "AI Blueprint Pulse YouTube Success Guide",
        description: "A comprehensive guide covering everything you need to build a profitable YouTube channel — from channel setup and content strategy to AI-powered growth tools and monetization. Includes a 90-day launch plan with actionable checklists.",
        category: "Growth",
        format: "PDF",
        downloadUrl: "/api/resources/youtube-guide",
        topics: ["Channel Setup", "Content Strategy", "YouTube SEO", "Video Production", "Monetization", "AI Tools", "Analytics", "90-Day Launch Plan"],
      },
      {
        id: "agentic-workflow-guide",
        title: "AI Agentic Workflow Guide",
        description: "A comprehensive guide to building autonomous AI agent systems for business automation. Covers agent architecture, tool design, multi-agent orchestration, prompt engineering, production deployment, and a 30-day implementation roadmap with checklists.",
        category: "AI & Automation",
        format: "PDF",
        downloadUrl: "/api/resources/agentic-workflow-guide",
        topics: ["Agent Architecture", "Tool Design", "Multi-Agent Systems", "Prompt Engineering", "Production Deployment", "RAG & Function Calling", "Industry Use Cases", "30-Day Roadmap"],
      }
    ]);
  });

  return httpServer;
}
