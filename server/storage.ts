import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  blueprints,
  purchases,
  researchSessions,
  pdfDownloads,
  nexusResearchJobs,
  blueprintCredits,
  creditTransactions,
  generatedBlueprints,
  type Blueprint,
  type InsertBlueprint,
  type Purchase,
  type InsertPurchase,
  type ResearchSession,
  type InsertResearchSession,
  type PdfDownload,
  type InsertPdfDownload,
  type NexusResearchJob,
  type InsertNexusResearchJob,
  type NexusJobStatus,
  type BlueprintCredit,
  type CreditTransaction,
  type InsertCreditTransaction,
  type GeneratedBlueprint,
  type InsertGeneratedBlueprint,
} from "@shared/schema";

export interface IStorage {
  getBlueprints(): Promise<Blueprint[]>;
  getBlueprint(id: number): Promise<Blueprint | undefined>;
  createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint>;
  updateBlueprint(id: number, blueprint: Partial<InsertBlueprint>): Promise<Blueprint | undefined>;
  deleteBlueprint(id: number): Promise<void>;

  getPurchases(userId: string): Promise<Purchase[]>;
  getPurchasesWithBlueprints(userId: string): Promise<(Purchase & { blueprint?: Blueprint })[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchaseBySession(sessionId: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  hasPurchased(userId: string, blueprintId: number): Promise<boolean>;

  getResearchSessions(userId: string): Promise<ResearchSession[]>;
  createResearchSession(session: InsertResearchSession): Promise<ResearchSession>;
  updateResearchSession(id: number, session: Partial<InsertResearchSession>): Promise<ResearchSession | undefined>;

  createPdfDownload(download: InsertPdfDownload): Promise<PdfDownload>;
  getPdfDownloads(): Promise<(PdfDownload & { blueprint?: Blueprint })[]>;
  getPdfDownloadStats(): Promise<{ totalDownloads: number; uniqueUsers: number; byBlueprint: { blueprintId: number; title: string; count: number }[] }>;

  createNexusJob(job: InsertNexusResearchJob): Promise<NexusResearchJob>;
  getNexusJob(id: number): Promise<NexusResearchJob | undefined>;
  getNexusJobs(userId: string): Promise<NexusResearchJob[]>;
  updateNexusJob(id: number, updates: Partial<NexusResearchJob>): Promise<NexusResearchJob | undefined>;

  getCreditBalance(userId: string): Promise<BlueprintCredit | undefined>;
  addCredits(userId: string, amount: number, stripeSessionId?: string, description?: string): Promise<BlueprintCredit>;
  useCredit(userId: string, description: string): Promise<boolean>;
  getCreditTransactions(userId: string): Promise<CreditTransaction[]>;

  createGeneratedBlueprint(blueprint: InsertGeneratedBlueprint): Promise<GeneratedBlueprint>;
  getGeneratedBlueprints(userId: string): Promise<GeneratedBlueprint[]>;
  getGeneratedBlueprint(id: number, userId: string): Promise<GeneratedBlueprint | undefined>;
  updateGeneratedBlueprintAgentScript(id: number, userId: string, agentScript: string): Promise<GeneratedBlueprint | undefined>;
}

class DatabaseStorage implements IStorage {
  async getBlueprints(): Promise<Blueprint[]> {
    return db.select().from(blueprints).where(eq(blueprints.isPublished, true)).orderBy(desc(blueprints.createdAt));
  }

  async getBlueprint(id: number): Promise<Blueprint | undefined> {
    const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.id, id));
    return blueprint;
  }

  async createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint> {
    const [created] = await db.insert(blueprints).values(blueprint).returning();
    return created;
  }

  async updateBlueprint(id: number, blueprint: Partial<InsertBlueprint>): Promise<Blueprint | undefined> {
    const [updated] = await db.update(blueprints).set(blueprint).where(eq(blueprints.id, id)).returning();
    return updated;
  }

  async deleteBlueprint(id: number): Promise<void> {
    await db.delete(blueprints).where(eq(blueprints.id, id));
  }

  async getPurchases(userId: string): Promise<Purchase[]> {
    return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
  }

  async getPurchasesWithBlueprints(userId: string): Promise<(Purchase & { blueprint?: Blueprint })[]> {
    const userPurchases = await this.getPurchases(userId);
    const result: (Purchase & { blueprint?: Blueprint })[] = [];
    
    for (const purchase of userPurchases) {
      const blueprint = await this.getBlueprint(purchase.blueprintId);
      result.push({ ...purchase, blueprint });
    }
    
    return result;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async getPurchaseBySession(sessionId: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.stripeSessionId, sessionId));
    return purchase;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [created] = await db.insert(purchases).values(purchase).returning();
    return created;
  }

  async updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const [updated] = await db.update(purchases).set(purchase).where(eq(purchases.id, id)).returning();
    return updated;
  }

  async hasPurchased(userId: string, blueprintId: number): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.blueprintId, blueprintId), eq(purchases.status, "completed")));
    return !!purchase;
  }

  async getResearchSessions(userId: string): Promise<ResearchSession[]> {
    return db.select().from(researchSessions).where(eq(researchSessions.userId, userId)).orderBy(desc(researchSessions.createdAt));
  }

  async createResearchSession(session: InsertResearchSession): Promise<ResearchSession> {
    const [created] = await db.insert(researchSessions).values(session).returning();
    return created;
  }

  async updateResearchSession(id: number, session: Partial<InsertResearchSession>): Promise<ResearchSession | undefined> {
    const [updated] = await db.update(researchSessions).set(session).where(eq(researchSessions.id, id)).returning();
    return updated;
  }

  async createPdfDownload(download: InsertPdfDownload): Promise<PdfDownload> {
    const [created] = await db.insert(pdfDownloads).values(download).returning();
    return created;
  }

  async getPdfDownloads(): Promise<(PdfDownload & { blueprint?: Blueprint })[]> {
    const downloads = await db.select().from(pdfDownloads).orderBy(desc(pdfDownloads.createdAt)).limit(100);
    const result: (PdfDownload & { blueprint?: Blueprint })[] = [];
    
    for (const download of downloads) {
      const blueprint = await this.getBlueprint(download.blueprintId);
      result.push({ ...download, blueprint });
    }
    
    return result;
  }

  async getPdfDownloadStats(): Promise<{ totalDownloads: number; uniqueUsers: number; byBlueprint: { blueprintId: number; title: string; count: number }[] }> {
    const allDownloads = await db.select().from(pdfDownloads);
    const totalDownloads = allDownloads.length;
    
    const uniqueEmails = new Set(allDownloads.filter(d => d.userEmail).map(d => d.userEmail));
    const uniqueUsers = uniqueEmails.size;
    
    const countsByBlueprint: Record<number, number> = {};
    for (const download of allDownloads) {
      countsByBlueprint[download.blueprintId] = (countsByBlueprint[download.blueprintId] || 0) + 1;
    }
    
    const byBlueprint: { blueprintId: number; title: string; count: number }[] = [];
    for (const [blueprintId, count] of Object.entries(countsByBlueprint)) {
      const blueprint = await this.getBlueprint(parseInt(blueprintId));
      byBlueprint.push({
        blueprintId: parseInt(blueprintId),
        title: blueprint?.title || "Unknown",
        count,
      });
    }
    
    byBlueprint.sort((a, b) => b.count - a.count);
    
    return { totalDownloads, uniqueUsers, byBlueprint };
  }

  async createNexusJob(job: InsertNexusResearchJob): Promise<NexusResearchJob> {
    const [created] = await db.insert(nexusResearchJobs).values(job).returning();
    return created;
  }

  async getNexusJob(id: number): Promise<NexusResearchJob | undefined> {
    const [job] = await db.select().from(nexusResearchJobs).where(eq(nexusResearchJobs.id, id));
    return job;
  }

  async getNexusJobs(userId: string): Promise<NexusResearchJob[]> {
    return db.select().from(nexusResearchJobs).where(eq(nexusResearchJobs.userId, userId)).orderBy(desc(nexusResearchJobs.createdAt));
  }

  async updateNexusJob(id: number, updates: Partial<NexusResearchJob>): Promise<NexusResearchJob | undefined> {
    const [updated] = await db.update(nexusResearchJobs).set(updates).where(eq(nexusResearchJobs.id, id)).returning();
    return updated;
  }

  async getCreditBalance(userId: string): Promise<BlueprintCredit | undefined> {
    const [credit] = await db.select().from(blueprintCredits).where(eq(blueprintCredits.userId, userId));
    return credit;
  }

  async addCredits(userId: string, amount: number, stripeSessionId?: string, description?: string): Promise<BlueprintCredit> {
    const existing = await this.getCreditBalance(userId);
    let result: BlueprintCredit;

    if (existing) {
      const [updated] = await db.update(blueprintCredits).set({
        balance: sql`${blueprintCredits.balance} + ${amount}`,
        totalPurchased: sql`${blueprintCredits.totalPurchased} + ${amount}`,
        updatedAt: new Date(),
      }).where(eq(blueprintCredits.userId, userId)).returning();
      result = updated;
    } else {
      const [created] = await db.insert(blueprintCredits).values({
        userId,
        balance: amount,
        totalPurchased: amount,
        totalUsed: 0,
      }).returning();
      result = created;
    }

    await db.insert(creditTransactions).values({
      userId,
      amount,
      type: "purchase",
      description: description || `Purchased ${amount} blueprint credit${amount > 1 ? "s" : ""}`,
      stripeSessionId: stripeSessionId || null,
    });

    return result;
  }

  async useCredit(userId: string, description: string): Promise<boolean> {
    const existing = await this.getCreditBalance(userId);
    if (!existing || existing.balance <= 0) return false;

    await db.update(blueprintCredits).set({
      balance: sql`${blueprintCredits.balance} - 1`,
      totalUsed: sql`${blueprintCredits.totalUsed} + 1`,
      updatedAt: new Date(),
    }).where(eq(blueprintCredits.userId, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount: -1,
      type: "usage",
      description,
    });

    return true;
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt));
  }

  async createGeneratedBlueprint(blueprint: InsertGeneratedBlueprint): Promise<GeneratedBlueprint> {
    const [created] = await db.insert(generatedBlueprints).values(blueprint).returning();
    return created;
  }

  async getGeneratedBlueprints(userId: string): Promise<GeneratedBlueprint[]> {
    return db.select().from(generatedBlueprints).where(eq(generatedBlueprints.userId, userId)).orderBy(desc(generatedBlueprints.createdAt));
  }

  async getGeneratedBlueprint(id: number, userId: string): Promise<GeneratedBlueprint | undefined> {
    const [blueprint] = await db.select().from(generatedBlueprints).where(and(eq(generatedBlueprints.id, id), eq(generatedBlueprints.userId, userId)));
    return blueprint;
  }

  async updateGeneratedBlueprintAgentScript(id: number, userId: string, agentScript: string): Promise<GeneratedBlueprint | undefined> {
    const [updated] = await db.update(generatedBlueprints)
      .set({ agentScript })
      .where(and(eq(generatedBlueprints.id, id), eq(generatedBlueprints.userId, userId)))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
