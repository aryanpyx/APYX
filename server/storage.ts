import { conversations, reminders, notes, users, type User, type InsertUser, type Conversation, type InsertConversation, type Reminder, type InsertReminder, type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(userId?: number, limit?: number): Promise<Conversation[]>;
  
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getReminders(userId?: number): Promise<Reminder[]>;
  updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  
  createNote(note: InsertNote): Promise<Note>;
  getNotes(userId?: number): Promise<Note[]>;
  updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private reminders: Map<number, Reminder>;
  private notes: Map<number, Note>;
  private currentId: number;
  private conversationId: number;
  private reminderId: number;
  private noteId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.reminders = new Map();
    this.notes = new Map();
    this.currentId = 1;
    this.conversationId = 1;
    this.reminderId = 1;
    this.noteId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      userId: insertConversation.userId || null,
      id, 
      timestamp: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversations(userId?: number, limit = 50): Promise<Conversation[]> {
    let conversations = Array.from(this.conversations.values());
    if (userId) {
      conversations = conversations.filter(conv => conv.userId === userId);
    }
    return conversations
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderId++;
    const reminder: Reminder = { 
      ...insertReminder, 
      userId: insertReminder.userId || null,
      id, 
      isCompleted: false,
      createdAt: new Date()
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async getReminders(userId?: number): Promise<Reminder[]> {
    let reminders = Array.from(this.reminders.values());
    if (userId) {
      reminders = reminders.filter(reminder => reminder.userId === userId);
    }
    return reminders.sort((a, b) => 
      (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0)
    );
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const note: Note = { 
      ...insertNote, 
      userId: insertNote.userId || null,
      id, 
      createdAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async getNotes(userId?: number): Promise<Note[]> {
    let notes = Array.from(this.notes.values());
    if (userId) {
      notes = notes.filter(note => note.userId === userId);
    }
    return notes.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...updates };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
}

export const storage = new MemStorage();
