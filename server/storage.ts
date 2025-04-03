import {
  users, conversations, files, systemMetrics,
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type File, type InsertFile,
  type SystemMetrics, type InsertSystemMetrics
} from "@shared/schema";
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';

// Modify the interface with all CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string | number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // File methods  
  getFile(id: number): Promise<File | undefined>;
  getFilesByPath(path: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  
  // System metrics methods
  getSystemMetrics(id: number): Promise<SystemMetrics | undefined>;
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
}

// PostgreSQL Storage Implementation
export class PgStorage implements IStorage {
  private db;
  
  constructor() {
    // Use neon with proper configuration for Drizzle
    neonConfig.fetchConnectionCache = true;
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      this.db = drizzle(neon(dbUrl));
      
      // Initialize with a default admin user if needed
      this.initDefaultUser();
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      // Fallback to memory storage if database connection fails
      console.info("Using memory storage as fallback");
    }
  }
  
  private async initDefaultUser() {
    try {
      const existingAdmin = await this.getUserByUsername('admin');
      if (!existingAdmin) {
        await this.createUser({
          username: 'admin',
          password: 'admin',
          displayName: 'Administrator',
          role: 'admin'
        });
        console.log('Created default admin user');
      }
    } catch (error) {
      console.error('Error initializing default user:', error);
    }
  }

  // User methods
  async getUser(id: string | number): Promise<User | undefined> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const result = await this.db.select().from(users).where(eq(users.id, numId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await this.db.select().from(conversations).where(eq(conversations.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getConversationsByUserId(userId: string | number): Promise<Conversation[]> {
    const numId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return await this.db.select().from(conversations).where(eq(conversations.userId, numId));
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(insertConversation).returning();
    return result[0];
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    const result = await this.db.select().from(files).where(eq(files.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getFilesByPath(path: string): Promise<File[]> {
    // Here we're implementing a simple contains search
    // For a more complex solution, use SQL LIKE or a specific path search
    return await this.db
      .select()
      .from(files)
      .where(eq(files.path, path));
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const result = await this.db.insert(files).values(insertFile).returning();
    return result[0];
  }
  
  // System metrics methods
  async getSystemMetrics(id: number): Promise<SystemMetrics | undefined> {
    const result = await this.db.select().from(systemMetrics).where(eq(systemMetrics.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    const result = await this.db
      .select()
      .from(systemMetrics)
      .orderBy(desc(systemMetrics.timestamp))
      .limit(1);
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const result = await this.db.insert(systemMetrics).values(insertMetrics).returning();
    return result[0];
  }
}

// In-memory Storage Implementation (Backup or for Testing)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private files: Map<number, File>;
  private metrics: Map<number, SystemMetrics>;
  
  private currentUserId: number;
  private currentConversationId: number;
  private currentFileId: number;
  private currentMetricsId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.files = new Map();
    this.metrics = new Map();
    
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentFileId = 1;
    this.currentMetricsId = 1;
    
    // Add a default admin user
    this.createUser({
      username: 'admin',
      password: 'admin',
      displayName: 'Administrator',
      role: 'admin'
    });
  }

  // User methods
  async getUser(id: string | number): Promise<User | undefined> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.users.get(numId);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      displayName: insertUser.displayName || null,
      role: insertUser.role || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByUserId(userId: string | number): Promise<Conversation[]> {
    const numId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === numId
    );
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const timestamp = new Date();
    const userId = insertConversation.userId ? 
      (typeof insertConversation.userId === 'string' 
        ? parseInt(insertConversation.userId, 10) 
        : insertConversation.userId) : null;
        
    const conversation: Conversation = { 
      id, 
      timestamp,
      userId,
      userMessage: insertConversation.userMessage,
      aiResponse: insertConversation.aiResponse
    };
    
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByPath(path: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.path.startsWith(path)
    );
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const createdAt = new Date();
    const modifiedAt = new Date();
    
    const ownerId = insertFile.ownerId 
      ? (typeof insertFile.ownerId === 'string' 
        ? parseInt(insertFile.ownerId, 10) 
        : insertFile.ownerId)
      : null;
      
    const file: File = { 
      id, 
      name: insertFile.name,
      path: insertFile.path,
      type: insertFile.type,
      size: insertFile.size || null,
      createdAt,
      modifiedAt,
      ownerId
    };
    
    this.files.set(id, file);
    return file;
  }
  
  // System metrics methods
  async getSystemMetrics(id: number): Promise<SystemMetrics | undefined> {
    return this.metrics.get(id);
  }
  
  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) return undefined;
    
    return allMetrics.reduce((latest, current) => {
      return latest.timestamp > current.timestamp ? latest : current;
    });
  }
  
  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = this.currentMetricsId++;
    const timestamp = new Date();
    const metrics: SystemMetrics = { 
      id,
      timestamp,
      cpuUsage: insertMetrics.cpuUsage, 
      memoryUsage: insertMetrics.memoryUsage,
      diskUsage: insertMetrics.diskUsage,
      networkSpeed: insertMetrics.networkSpeed,
      temperature: insertMetrics.temperature || null
    };
    
    this.metrics.set(id, metrics);
    return metrics;
  }
}

// Switch between PostgreSQL and in-memory storage here
// Using MemStorage for reliability until database is properly configured
export const storage = new MemStorage();
