import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { analyzeBusinessTrends, generateBlueprintContent } from "./openai";
import { insertBlueprintSchema } from "@shared/schema";
import { z } from "zod";

// Admin email whitelist - add admin emails here
const ADMIN_EMAILS = new Set([
  // Add authorized admin emails
]);

// Server-side admin authorization middleware
function isAdmin(req: any, res: Response, next: NextFunction) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const email = user?.claims?.email;
  const userId = user?.claims?.sub;
  
  // Check if user is an admin (via whitelist or special patterns)
  // In production, you should use a proper role field in the database
  const isAuthorized = 
    ADMIN_EMAILS.has(email) || 
    userId === "admin" ||
    (email && typeof email === "string" && email.includes("admin"));

  if (!isAuthorized) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
      const id = parseInt(req.params.id);
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

  // Download blueprint (requires purchase or public preview)
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

      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="${blueprint.title.replace(/[^a-z0-9]/gi, '_')}.md"`);
      res.send(blueprint.content);
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

  app.post("/api/admin/generate", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const { topic, research } = req.body;

      if (!topic || !research) {
        return res.status(400).json({ error: "Topic and research are required" });
      }

      const generated = await generateBlueprintContent(topic, research);

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

  return httpServer;
}
