import { 
  type User, type InsertUser, 
  type ContactSubmission, type InsertContactSubmission,
  type Admin, type InsertAdmin,
  type Order, type InsertOrder,
  type Wishlist, type InsertWishlist
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getUserWishlists(userId: string): Promise<Wishlist[]>;
  deleteWishlist(id: string): Promise<void>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private admins: Map<string, Admin>;
  private orders: Map<string, Order>;
  private wishlists: Map<string, Wishlist>;
  private contactSubmissions: Map<string, ContactSubmission>;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.orders = new Map();
    this.wishlists = new Map();
    this.contactSubmissions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, email: insertUser.email ?? null, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username,
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { 
      ...insertAdmin, 
      id, 
      email: insertAdmin.email ?? null,
      role: insertAdmin.role ?? "admin",
      createdAt: new Date() 
    };
    this.admins.set(id, admin);
    return admin;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { ...insertOrder, id, status: insertOrder.status ?? "pending", createdAt: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = randomUUID();
    const wishlist: Wishlist = { ...insertWishlist, id, createdAt: new Date() };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values())
      .filter((wishlist) => wishlist.userId === userId);
  }

  async deleteWishlist(id: string): Promise<void> {
    this.wishlists.delete(id);
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const contactSubmission: ContactSubmission = {
      ...submission,
      id,
      message: submission.message ?? null,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
