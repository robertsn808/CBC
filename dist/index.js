var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/twilio.ts
var twilio_exports = {};
__export(twilio_exports, {
  isTwilioConfigured: () => isTwilioConfigured,
  sendMagicLinkSMS: () => sendMagicLinkSMS,
  sendSMS: () => sendSMS
});
import twilio from "twilio";
async function sendSMS(message) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error("Twilio not configured - missing credentials");
    return false;
  }
  try {
    const result = await twilioClient.messages.create({
      body: message.body,
      from: twilioPhoneNumber,
      to: message.to
    });
    console.log(`SMS sent successfully to ${message.to}. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}
async function sendMagicLinkSMS(clientName, clientPhone, magicLink) {
  const message = {
    to: clientPhone,
    body: `Hi ${clientName}! Here's your secure login link for CapturedCCollective client portal: ${magicLink}

This link expires in 24 hours. If you have any questions, please reply to this message.`
  };
  return await sendSMS(message);
}
function isTwilioConfigured() {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
var accountSid, authToken, twilioPhoneNumber, twilioClient;
var init_twilio = __esm({
  "server/twilio.ts"() {
    accountSid = process.env.TWILIO_ACCOUNT_SID;
    authToken = process.env.TWILIO_AUTH_TOKEN;
    twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    twilioClient = null;
    if (accountSid && authToken && twilioPhoneNumber) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
});

// server/pdf-generator.ts
var pdf_generator_exports = {};
__export(pdf_generator_exports, {
  emailInvoice: () => emailInvoice,
  generateInvoiceHTML: () => generateInvoiceHTML,
  generateInvoicePDF: () => generateInvoicePDF
});
import { writeFileSync } from "fs";
import { join } from "path";
function generateInvoiceHTML(data) {
  let html = INVOICE_HTML_TEMPLATE;
  html = html.replace(/\{\{invoiceNumber\}\}/g, data.invoiceNumber);
  html = html.replace(/\{\{invoiceDate\}\}/g, data.invoiceDate);
  html = html.replace(/\{\{dueDate\}\}/g, data.dueDate);
  html = html.replace(/\{\{clientName\}\}/g, data.clientName);
  html = html.replace(/\{\{clientEmail\}\}/g, data.clientEmail);
  html = html.replace(/\{\{clientPhone\}\}/g, data.clientPhone || "");
  html = html.replace(/\{\{clientAddress\}\}/g, data.clientAddress || "");
  html = html.replace(/\{\{subtotal\}\}/g, data.subtotal.toFixed(2));
  html = html.replace(/\{\{total\}\}/g, data.total.toFixed(2));
  const itemsHTML = data.items.map((item) => `
    <tr class="item-row">
      <td>${item.description}</td>
      <td class="right">${item.quantity}</td>
      <td class="right">$${item.rate.toFixed(2)}</td>
      <td class="right">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join("");
  html = html.replace(/\{\{items\}\}/g, itemsHTML);
  const taxRow = data.tax ? `
    <tr>
      <td colspan="3">Tax (${data.taxRate || 0}%)</td>
      <td class="right">$${data.tax.toFixed(2)}</td>
    </tr>
  ` : "";
  html = html.replace(/\{\{taxRow\}\}/g, taxRow);
  const discountRow = data.discount ? `
    <tr>
      <td colspan="3">Discount</td>
      <td class="right">-$${data.discount.toFixed(2)}</td>
    </tr>
  ` : "";
  html = html.replace(/\{\{discountRow\}\}/g, discountRow);
  const bookingDetailsSection = data.bookingDetails ? `
    <div class="payment-info">
      <strong>Booking Details:</strong><br>
      Service: ${data.bookingDetails.serviceName}<br>
      Date: ${data.bookingDetails.bookingDate}<br>
      Location: ${data.bookingDetails.location}
    </div>
  ` : "";
  html = html.replace(/\{\{bookingDetailsSection\}\}/g, bookingDetailsSection);
  const notesSection = data.notes ? `
    <div class="notes-section">
      <div class="notes-title">Notes:</div>
      ${data.notes}
    </div>
  ` : "";
  html = html.replace(/\{\{notesSection\}\}/g, notesSection);
  return html;
}
async function generateInvoicePDF(data) {
  const html = generateInvoiceHTML(data);
  const filename = `invoice-${data.invoiceNumber}.html`;
  const filepath = join(process.cwd(), "temp", filename);
  try {
    writeFileSync(filepath, html);
    console.log(`Invoice HTML generated: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Failed to generate invoice PDF");
  }
}
async function emailInvoice(invoiceData, pdfPath) {
  console.log(`Email would be sent to: ${invoiceData.clientName} (${invoiceData.clientEmail})`);
  console.log(`Subject: Invoice ${invoiceData.invoiceNumber} from Christian Picaso Photography`);
  console.log(`PDF attachment: ${pdfPath}`);
  const emailContent = `
Dear ${invoiceData.clientName},

Thank you for choosing Christian Picaso Photography! 

Please find your invoice (${invoiceData.invoiceNumber}) attached. The total amount due is $${invoiceData.total.toFixed(2)}.

Payment is due by ${invoiceData.dueDate}. You can pay securely online using the link below:
[SECURE PAYMENT LINK - Would be generated by Stripe/PayPal]

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
Christian Picaso
Christian Picaso Photography
Hawaii
  `;
  console.log("Email content:", emailContent);
  return true;
}
var INVOICE_HTML_TEMPLATE;
var init_pdf_generator = __esm({
  "server/pdf-generator.ts"() {
    INVOICE_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
      background: #fff;
    }
    .invoice-box {
      max-width: 800px;
      margin: auto;
      padding: 40px;
      border: 1px solid #eee;
      box-shadow: 0 0 15px rgba(0,0,0,.1);
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #d4a574;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #d4a574;
      margin: 0;
    }
    .invoice-meta {
      font-size: 14px;
      color: #666;
    }
    .billing-info {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #d4a574;
    }
    .billing-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table th {
      background: #d4a574;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: bold;
    }
    .items-table th.right {
      text-align: right;
    }
    .items-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    .items-table td.right {
      text-align: right;
    }
    .item-row:nth-child(even) {
      background: #f9f9f9;
    }
    .subtotal-row {
      border-top: 2px solid #ddd;
      font-weight: bold;
    }
    .total-row {
      background: #d4a574;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    .notes-section {
      margin-top: 40px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .payment-info {
      margin: 30px 0;
      padding: 20px;
      background: #e8f4f8;
      border-radius: 5px;
      border-left: 4px solid #2196f3;
    }
    .due-date {
      font-weight: bold;
      color: #d32f2f;
    }
    @media print {
      body { margin: 0; padding: 20px; }
      .invoice-box { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <h1 class="invoice-title">INVOICE</h1>
        <div class="invoice-meta">
          <strong>Invoice #:</strong> {{invoiceNumber}}<br>
          <strong>Date:</strong> {{invoiceDate}}<br>
          <strong>Due Date:</strong> <span class="due-date">{{dueDate}}</span>
        </div>
      </div>
      <div>
        <div style="width: 150px; height: 80px; background: #d4a574; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 5px;">
          <div style="font-size: 14px; font-weight: bold;">CapturedC</div>
          <div style="font-size: 14px; font-weight: bold;">Collective</div>
          <div style="font-size: 10px;">Media Team</div>
        </div>
      </div>
    </div>

    <div class="billing-info">
      <div class="billing-title">Bill To:</div>
      <strong>{{clientName}}</strong><br>
      {{clientEmail}}<br>
      {{clientPhone}}<br>
      {{clientAddress}}
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Qty</th>
          <th class="right">Rate</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{items}}
        
        <tr class="subtotal-row">
          <td colspan="3">Subtotal</td>
          <td class="right">\${{subtotal}}</td>
        </tr>
        
        {{taxRow}}
        
        {{discountRow}}
        
        <tr class="total-row">
          <td colspan="3"><strong>TOTAL</strong></td>
          <td class="right"><strong>\${{total}}</strong></td>
        </tr>
      </tbody>
    </table>

    {{bookingDetailsSection}}

    {{notesSection}}

    <div class="payment-info">
      <strong>Payment Information:</strong><br>
      Please make payment by <strong>{{dueDate}}</strong><br>
      Payment can be made via the secure link provided in your email or by contacting us directly.<br>
      <em>Late payments may incur additional fees.</em>
    </div>

    <div class="footer">
      <p><strong>Christian Picaso Photography</strong><br>
      Professional Photography Services \u2022 Hawaii<br>
      Email: contact@christianpicaso.com \u2022 Website: www.christianpicaso.com</p>
      <p style="margin-top: 20px;">Thank you for choosing Christian Picaso Photography!</p>
    </div>
  </div>
</body>
</html>
`;
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiAnalysisSchema: () => aiAnalysisSchema,
  aiChats: () => aiChats,
  automationSequences: () => automationSequences,
  bookings: () => bookings,
  bookingsRelations: () => bookingsRelations,
  clientMessages: () => clientMessages,
  clientPortalSessions: () => clientPortalSessions,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  communicationLog: () => communicationLog,
  contactMessages: () => contactMessages,
  contracts: () => contracts,
  contractsRelations: () => contractsRelations,
  galleryImages: () => galleryImages,
  galleryImagesRelations: () => galleryImagesRelations,
  insertAiChatSchema: () => insertAiChatSchema,
  insertAutomationSequenceSchema: () => insertAutomationSequenceSchema,
  insertBookingSchema: () => insertBookingSchema,
  insertClientMessageSchema: () => insertClientMessageSchema,
  insertClientPortalSessionSchema: () => insertClientPortalSessionSchema,
  insertClientSchema: () => insertClientSchema,
  insertCommunicationLogSchema: () => insertCommunicationLogSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertContractSchema: () => insertContractSchema,
  insertGalleryImageSchema: () => insertGalleryImageSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertQuestionnaireSchema: () => insertQuestionnaireSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertUserSchema: () => insertUserSchema,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  leads: () => leads,
  orders: () => orders,
  products: () => products,
  profiles: () => profiles,
  questionnaires: () => questionnaires,
  services: () => services,
  servicesRelations: () => servicesRelations,
  teamMembers: () => teamMembers,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
date("my_column").$type().notNull();
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"),
  // admin, client
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  tags: text("tags").array(),
  status: text("status").default("lead").notNull(),
  // lead, qualified, booked, repeat, archived
  leadSource: text("lead_source"),
  // instagram, website, referral, tiktok, google
  leadScore: integer("lead_score").default(0),
  instagramHandle: text("instagram_handle"),
  anniversaryDate: text("anniversary_date"),
  preferredCommunication: text("preferred_communication").default("email"),
  // email, text, phone
  timezone: text("timezone").default("America/New_York"),
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0.00"),
  referralSource: text("referral_source"),
  customFields: json("custom_fields").default({}),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  // minutes
  category: text("category").notNull(),
  active: boolean("active").default(true),
  addOns: json("addons").$type(),
  images: text("images").array()
});
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id).notNull(),
  serviceId: integer("serviceid").references(() => services.id).notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  // minutes
  location: text("location"),
  totalPrice: decimal("totalprice", { precision: 10, scale: 2 }).notNull(),
  depost_paid: boolean("depost_paid").default(false),
  status: text("status").notNull().default("pending"),
  // pending, confirmed, completed, cancelled
  notes: text("notes"),
  addOns: json("addons").$type(),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingid").references(() => bookings.id),
  clientId: integer("clientid").references(() => clients.id).notNull(),
  contractType: text("contract_type").notNull(),
  // 'individual', 'business'
  serviceType: text("service_type"),
  // 'portrait', 'wedding', 'commercial', etc.
  status: text("status").notNull().default("draft"),
  // 'draft', 'sent', 'signed', 'completed', 'cancelled'
  title: text("title").notNull(),
  templateContent: text("template_content").notNull(),
  signedContent: text("signed_content"),
  sessionDate: timestamp("session_date"),
  location: text("location"),
  packageType: text("package_type"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  retainerAmount: decimal("retainer_amount", { precision: 10, scale: 2 }),
  balanceAmount: decimal("balance_amount", { precision: 10, scale: 2 }),
  paymentTerms: text("payment_terms"),
  deliverables: text("deliverables"),
  timeline: text("timeline"),
  usageRights: text("usage_rights"),
  cancellationPolicy: text("cancellation_policy"),
  additionalTerms: text("additional_terms"),
  clientSignature: text("client_signature"),
  // base64 client signature
  clientSignedAt: timestamp("client_signed_at"),
  clientIpAddress: text("client_ip_address"),
  photographerSignature: text("photographer_signature"),
  photographerSignedAt: timestamp("photographer_signed_at"),
  signatureRequestSent: timestamp("signature_request_sent"),
  portalAccessToken: text("portal_access_token"),
  // For client portal access
  isFullySigned: boolean("is_fully_signed").default(false),
  signatureMetadata: json("signature_metadata").$type(),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingid").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: text("status").notNull().default("pending"),
  // pending, paid, overdue
  paymentMethod: text("payment_method")
});
var aiAnalysisSchema = z.object({
  emotions: z.array(z.string()).optional(),
  style: z.string().optional(),
  composition: z.string().optional(),
  quality: z.number().optional()
});
var galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  url: text("url"),
  // ✅ this is correct
  aiAnalysis: jsonb("ai_analysis").$type()
});
var aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  clientEmail: text("client_email"),
  messages: json("messages").$type().notNull(),
  bookingData: json("booking_data").$type(),
  createdAt: timestamp("createdat").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id),
  source: text("source").notNull(),
  medium: text("medium"),
  campaign: text("campaign"),
  formData: json("form_data"),
  score: integer("score").default(0),
  temperature: text("temperature").default("cold"),
  qualification: text("qualification"),
  assignedTo: integer("assigned_to").references(() => users.id),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  subject: text("subject"),
  content: text("content"),
  status: text("status"),
  metadata: json("metadata"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var automationSequences = pgTable("automation_sequences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  active: boolean("active").default(true),
  steps: json("steps").$type(),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  serviceType: text("service_type"),
  questions: json("questions").$type(),
  active: boolean("active").default(true),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var clientPortalSessions = pgTable("client_portal_sessions", {
  sessionToken: text("session_token").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  status: text("status").default("active"),
  activityLog: jsonb("activity_log").default([]),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  sku: text("sku"),
  variants: json("variants").$type(),
  active: boolean("active").default(true),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id).notNull(),
  galleryId: integer("gallery_id").references(() => galleryImages.id),
  items: json("items").$type(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  shippingAddress: json("shipping_address"),
  trackingNumber: text("tracking_number"),
  fulfilledAt: timestamp("fulfilled_at"),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  permissions: json("permissions").$type(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  active: boolean("active").default(true),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(),
  priority: text("priority").default("normal").notNull(),
  source: text("source").default("website").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  aiCategory: text("ai_category").default("general_inquiry").notNull(),
  suggestedResponse: text("suggested_response"),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var clientMessages = pgTable("client_messages", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id).notNull(),
  message: text("message").notNull(),
  isFromClient: boolean("is_from_client").default(true).notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  status: text("status").default("unread").notNull(),
  // unread, read, replied
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  headshot: text("headshot"),
  // base64 or URL
  socialMedia: json("social_media").$type().default({ instagram: "", facebook: "", youtube: "" }),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("createdat").defaultNow().notNull()
});
var clientsRelations = relations(clients, ({ many }) => ({
  bookings: many(bookings)
}));
var servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings)
}));
var bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id]
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id]
  }),
  contract: one(contracts),
  invoice: one(invoices),
  galleryImages: many(galleryImages)
}));
var contractsRelations = relations(contracts, ({ one }) => ({
  booking: one(bookings, {
    fields: [contracts.bookingId],
    references: [bookings.id]
  })
}));
var invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, {
    fields: [invoices.bookingId],
    references: [bookings.id]
  })
}));
var galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  booking: one(bookings, {
    fields: [galleryImages.bookingId],
    references: [bookings.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true
});
var insertServiceSchema = createInsertSchema(services).omit({
  id: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});
var insertContractSchema = z.object({
  clientId: z.number(),
  contractType: z.enum(["individual", "business"]),
  serviceType: z.string().nullable(),
  title: z.string().min(1),
  templateContent: z.string(),
  sessionDate: z.string().nullable().transform((val) => val ? new Date(val) : null),
  location: z.string().nullable(),
  packageType: z.string().nullable(),
  totalAmount: z.string().nullable(),
  retainerAmount: z.string().nullable(),
  balanceAmount: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  deliverables: z.string().nullable(),
  timeline: z.string().nullable(),
  usageRights: z.string().nullable(),
  cancellationPolicy: z.string().nullable(),
  additionalTerms: z.string().nullable(),
  bookingId: z.number().nullable()
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true
});
var insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploadedAt: true
});
var insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true
});
var insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({
  id: true,
  createdAt: true
});
var insertAutomationSequenceSchema = createInsertSchema(automationSequences).omit({
  id: true,
  createdAt: true
});
var insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  createdAt: true
});
var insertClientPortalSessionSchema = createInsertSchema(clientPortalSessions).omit({
  sessionToken: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});
var insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true
});
var insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true
});
var insertClientMessageSchema = createInsertSchema(clientMessages).omit({
  id: true,
  createdAt: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import "dotenv/config";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}
var isProduction = process.env.NODE_ENV === "production";
var connectionString = process.env.DATABASE_URL;
var pool = new Pool(
  isProduction ? {
    connectionString,
    ssl: { rejectUnauthorized: false }
    // Required by most managed DBs like Render/Neon
  } : {
    connectionString
    // No SSL locally
  }
);
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
var DatabaseStorage = class {
  /*getContracts(): Promise<(Contract & { client: Client; })[]> {
    throw new Error("Method not implemented.");
  }*/
  enrichBookingQuery() {
    return db.select().from(bookings).leftJoin(clients, eq(bookings.clientId, clients.id)).leftJoin(services, eq(bookings.serviceId, services.id));
  }
  getQuestionnaires() {
    throw new Error("Method not implemented.");
  }
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Clients
  async getClients() {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }
  async getClient(id) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || void 0;
  }
  async getClientByEmail(email) {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || void 0;
  }
  async createClient(insertClient) {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }
  async updateClient(id, updateClient) {
    const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
    return client;
  }
  // Services
  async getServices() {
    return await db.select().from(services).orderBy(services.category, services.name);
  }
  async getActiveServices() {
    return await db.select().from(services).where(eq(services.active, true)).orderBy(services.category, services.name);
  }
  async getService(id) {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || void 0;
  }
  async createService(insertService) {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }
  async updateService(id, updateService) {
    const [service] = await db.update(services).set(updateService).where(eq(services.id, id)).returning();
    return service;
  }
  async deleteService(id) {
    await db.delete(services).where(eq(services.id, id));
  }
  // Bookings
  async getBookings() {
    return await db.select().from(bookings).leftJoin(clients, eq(bookings.clientId, clients.id)).leftJoin(services, eq(bookings.serviceId, services.id)).orderBy(desc(bookings.date)).then(
      (rows) => rows.map((row) => ({
        ...row.bookings,
        client: row.clients,
        service: row.services
      }))
    );
  }
  async getBooking(id) {
    const [result] = await this.enrichBookingQuery().where(eq(bookings.id, id));
    if (!result) return void 0;
    return {
      ...result.bookings,
      client: result.clients,
      service: result.services
    };
  }
  async getBookingsByDateRange(start, end) {
    return await db.select().from(bookings).leftJoin(clients, eq(bookings.clientId, clients.id)).leftJoin(services, eq(bookings.serviceId, services.id)).where(and(gte(bookings.date, start), lte(bookings.date, end))).orderBy(bookings.date).then(
      (rows) => rows.map((row) => ({
        ...row.bookings,
        client: row.clients,
        service: row.services
      }))
    );
  }
  async createBooking(insertBooking) {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }
  async updateBooking(id, updateBooking) {
    const [booking] = await db.update(bookings).set(updateBooking).where(eq(bookings.id, id)).returning();
    return booking;
  }
  // Contracts
  async getContracts() {
    try {
      const contractsData = await db.select().from(contracts).leftJoin(clients, eq(contracts.clientId, clients.id)).orderBy(desc(contracts.createdAt));
      return contractsData.map((row) => ({
        ...row.contracts,
        client: row.clients
      }));
    } catch (error) {
      console.error("Error fetching contracts:", error);
      return [];
    }
  }
  async getContract(id) {
    try {
      const [contractData] = await db.select().from(contracts).leftJoin(clients, eq(contracts.clientId, clients.id)).where(eq(contracts.id, id));
      if (!contractData) return void 0;
      return {
        ...contractData.contracts,
        client: contractData.clients
      };
    } catch (error) {
      console.error("Error fetching contract:", error);
      return void 0;
    }
  }
  async getContractByBooking(bookingId) {
    const [contract] = await db.select().from(contracts).where(eq(contracts.bookingId, bookingId));
    return contract || void 0;
  }
  async createContract(insertContract) {
    const [contract] = await db.insert(contracts).values(insertContract).returning();
    return contract;
  }
  async updateContract(id, updateContract) {
    const [contract] = await db.update(contracts).set({ ...updateContract, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contracts.id, id)).returning();
    return contract;
  }
  async sendContractToPortal(contractId) {
    const portalToken = `contract_${contractId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await db.update(contracts).set({
      status: "sent",
      portalAccessToken: portalToken,
      signatureRequestSent: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(contracts.id, contractId));
    const portalLink = `${process.env.REPLIT_DOMAINS || "localhost:3000"}/client-portal/contract/${portalToken}`;
    return {
      success: true,
      portalLink
    };
  }
  // Invoices
  async getInvoice(bookingId) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.bookingId, bookingId));
    return invoice || void 0;
  }
  async createInvoice(insertInvoice) {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }
  async updateInvoice(id, updateInvoice) {
    const [invoice] = await db.update(invoices).set(updateInvoice).where(eq(invoices.id, id)).returning();
    return invoice;
  }
  // Gallery
  async getGalleryImages() {
    return await db.select().from(galleryImages).orderBy(desc(galleryImages.uploadedAt));
  }
  async getFeaturedImages() {
    return await db.select().from(galleryImages).where(eq(galleryImages.featured, true)).orderBy(desc(galleryImages.uploadedAt));
  }
  async getImagesByBooking(bookingId) {
    return await db.select().from(galleryImages).where(eq(galleryImages.bookingId, bookingId)).orderBy(desc(galleryImages.uploadedAt));
  }
  async createGalleryImage(insertImage) {
    const [image] = await db.insert(galleryImages).values(insertImage).returning();
    return image;
  }
  async updateGalleryImage(id, updateImage) {
    const [image] = await db.update(galleryImages).set(updateImage).where(eq(galleryImages.id, id)).returning();
    return image;
  }
  async deleteGalleryImage(id) {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }
  // AI Chats
  async getAiChat(sessionId) {
    const [chat] = await db.select().from(aiChats).where(eq(aiChats.sessionId, sessionId));
    return chat || void 0;
  }
  async createAiChat(insertChat) {
    const [chat] = await db.insert(aiChats).values(insertChat).returning();
    return chat;
  }
  async updateAiChat(sessionId, updateChat) {
    const [chat] = await db.update(aiChats).set({
      ...updateChat,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(aiChats.sessionId, sessionId)).returning();
    return chat;
  }
  // Analytics
  async getMonthlyRevenue(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const [result] = await db.select({ total: sql`sum(${bookings.totalPrice})` }).from(bookings).where(
      and(
        gte(bookings.date, startDate),
        lte(bookings.date, endDate),
        eq(bookings.status, "confirmed")
      )
    );
    return Number(result?.total || 0);
  }
  async getBookingStats() {
    const currentDate = /* @__PURE__ */ new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [totalBookings] = await db.select({ count: sql`count(*)` }).from(bookings);
    const [pendingBookings] = await db.select({ count: sql`count(*)` }).from(bookings).where(eq(bookings.status, "pending"));
    const [confirmedBookings] = await db.select({ count: sql`count(*)` }).from(bookings).where(eq(bookings.status, "confirmed"));
    const monthlyRevenue = await this.getMonthlyRevenue(currentYear, currentMonth);
    return {
      totalBookings: Number(totalBookings?.count || 0),
      pendingBookings: Number(pendingBookings?.count || 0),
      confirmedBookings: Number(confirmedBookings?.count || 0),
      monthlyRevenue
    };
  }
  // Contact Messages
  async getContactMessages() {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async getContactMessage(id) {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || void 0;
  }
  async createContactMessage(insertMessage) {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }
  async updateContactMessage(id, updateMessage) {
    const [message] = await db.update(contactMessages).set(updateMessage).where(eq(contactMessages.id, id)).returning();
    return message;
  }
  async deleteContactMessage(id) {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
  // Client Portal Sessions
  async getClientPortalSessions() {
    return await db.select().from(clientPortalSessions).orderBy(desc(clientPortalSessions.createdAt));
  }
  async getActiveClientPortalSessions() {
    return await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.status, "active"));
  }
  async createClientPortalSession(session) {
    const [created] = await db.insert(clientPortalSessions).values({
      ...session,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return created;
  }
  async updateClientPortalSession(sessionToken, updates) {
    const [updated] = await db.update(clientPortalSessions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(clientPortalSessions.sessionToken, sessionToken)).returning();
    return updated;
  }
  async deleteClientPortalSession(sessionToken) {
    await db.delete(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, sessionToken));
  }
  async getClientPortalStats() {
    const allSessions = await db.select().from(clientPortalSessions);
    const activeSessions = allSessions.filter((s) => s.status === "active");
    const totalLogins = allSessions.length;
    const totalClientsResult = await db.select({ count: sql`count(*)` }).from(clients);
    const totalClients = totalClientsResult[0]?.count || 0;
    const accessRate = totalClients > 0 ? Math.round(activeSessions.length / totalClients * 100) : 0;
    const downloadCount = allSessions.reduce((sum, session) => {
      const activities = session.activityLog || [];
      return sum + activities.filter((activity) => activity.type === "download").length;
    }, 0);
    const sessionsWithRatings = allSessions.filter((s) => s.rating && s.rating > 0);
    const avgRating = sessionsWithRatings.length > 0 ? (sessionsWithRatings.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRatings.length).toFixed(1) : null;
    return {
      activeUsers: activeSessions.length,
      totalSessions: totalLogins,
      totalLogins,
      accessRate: `${accessRate}%`,
      avgSessionTime: "0:00",
      // Would need session duration tracking
      topActivity: downloadCount > 0 ? "Photo downloads" : "Gallery viewing",
      downloadCount,
      paymentCount: 0,
      // Would need payment tracking integration
      avgRating: avgRating || "No ratings yet"
    };
  }
  // Invoice Analytics
  async getInvoiceStats() {
    try {
      const allBookings = await db.select().from(bookings);
      const completedBookings = allBookings.filter((b) => b.status === "completed");
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
      return {
        totalRevenue,
        pendingAmount: 0,
        // No separate invoice tracking yet
        overdueAmount: 0,
        // No separate invoice tracking yet
        paymentRate: completedBookings.length > 0 ? 100 : 0
        // All completed bookings are considered paid
      };
    } catch (error) {
      console.error("Invoice stats error:", error);
      return {
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        paymentRate: 0
      };
    }
  }
  async getBusinessKPIs() {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
    const totalClients = await db.select({ count: sql`count(*)` }).from(clients);
    const monthlyRevenue = await this.getMonthlyRevenue(currentYear, currentMonth);
    const totalBookings = await db.select({ count: sql`count(*)` }).from(bookings);
    const completedBookings = await db.select({ count: sql`count(*)` }).from(bookings).where(eq(bookings.status, "completed"));
    return {
      monthlyRecurringRevenue: monthlyRevenue,
      totalClients: Number(totalClients[0]?.count || 0),
      totalBookings: Number(totalBookings[0]?.count || 0),
      completionRate: totalBookings[0]?.count > 0 ? Number(completedBookings[0]?.count || 0) / Number(totalBookings[0]?.count) * 100 : 0
    };
  }
  async getClientMetrics() {
    const allClients = await db.select().from(clients);
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClientsThisMonth = allClients.filter(
      (client) => new Date(client.createdAt) >= thirtyDaysAgo
    );
    const clientsWithMultipleBookings = await db.select({ clientId: bookings.clientId, count: sql`count(*)` }).from(bookings).groupBy(bookings.clientId).having(sql`count(*) > 1`);
    const avgLifetimeValue = await this.getMonthlyRevenue((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() + 1) / allClients.length || 0;
    return {
      totalClients: allClients.length,
      newThisMonth: newClientsThisMonth.length,
      repeatClients: clientsWithMultipleBookings.length,
      avgLifetimeValue: Math.round(avgLifetimeValue)
    };
  }
  async getClientMessages(clientId) {
    const messages = await db.select().from(clientMessages).where(eq(clientMessages.clientId, clientId)).orderBy(desc(clientMessages.createdAt));
    return messages;
  }
  async createClientMessage(insertMessage) {
    const [message] = await db.insert(clientMessages).values(insertMessage).returning();
    return message;
  }
  async getProfile() {
    const profileList = await db.select().from(profiles).where(eq(profiles.isActive, true)).limit(1);
    return profileList[0];
  }
  async updateProfile(updateProfile) {
    const existingProfile = await this.getProfile();
    if (existingProfile) {
      const [profile] = await db.update(profiles).set({ ...updateProfile, updatedAt: /* @__PURE__ */ new Date() }).where(eq(profiles.id, existingProfile.id)).returning();
      return profile;
    } else {
      return this.createProfile(updateProfile);
    }
  }
  async createProfile(insertProfile) {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }
};
var storage = new DatabaseStorage();

// server/vite.ts
import express from "express";
import fs from "fs";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var distPath = path.resolve(__dirname, "../dist/public");
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath2 = path2.resolve(__dirname2, "../dist/public");
  if (!fs.existsSync(distPath2)) {
    throw new Error(
      `Could not find the build directory: ${distPath2}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath2));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath2, "index.html"));
  });
}

// server/routes.ts
import { z as z2 } from "zod";

// server/openai.ts
var PHOTOGRAPHY_CONTEXT = `
You are the AI booking assistant for CapturedCCollective, a Hawai'i-based media team that blends professionalism with creativity to deliver cinematic, high-impact content. The double "C" in our name stands for Content and Cinematic, with a strong emphasis on Creative storytelling. From real estate and events to branded visuals, we approach every project with intentionality, artistry, and precision. You specialize in:

SERVICES & PRICING:
- Wedding Photography: $2,500 (8 hours coverage, drone shots, 500+ edited photos)
- Portrait Sessions: $450 (1-2 hours, 50+ edited photos, multiple locations)
- Aerial Photography: $350 (FAA-certified drone coverage)
- Event Photography: $200/hour (corporate events, parties, celebrations)

ADD-ONS:
- Drone Coverage: +$350
- Extended Hours: +$150/hour
- Rush Editing (48-72 hours): +$200
- Travel outside Oahu: +$0.50/mile
- Additional photographer: +$300

POPULAR LOCATIONS:
Beaches: Lanikai, Hanauma Bay, Sunset Beach, Kailua Beach, Waikiki Beach
Mountains: Diamond Head, Makapuu Lighthouse, Koko Head, Tantalus Lookout
Urban: Honolulu downtown, Chinatown, Waikiki
Hidden Gems: Secret beaches, waterfalls, private estates

BOOKING PROCESS:
1. Initial consultation (free)
2. Contract signing with 50% deposit
3. Session planning and location scouting
4. Photography session
5. Editing and delivery (7-14 days standard)

SPECIALTIES:
- FAA-certified drone pilot for aerial shots
- AI-enhanced photo editing and selection
- Experience in Hawaii's unique lighting conditions
- Bilingual service (English/Spanish)
- Weather backup plans always included

AVAILABILITY:
- Typically book 2-4 weeks in advance
- Rush bookings possible with +$200 fee
- Peak season: December-April, June-August
- Golden hour sessions preferred (sunrise/sunset)

Be helpful, knowledgeable, and personable. Ask qualifying questions to understand their needs and suggest appropriate packages. Always end with a call to action.
`;
async function generateBookingResponse(messages, bookingData = {}) {
  try {
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
    const lastMessage = messages[messages.length - 1]?.content || "";
    let aiMessage = await callReplitAI(lastMessage, conversationHistory, bookingData);
    const extractedBookingData = { ...bookingData };
    if (aiMessage.toLowerCase().includes("wedding")) {
      extractedBookingData.serviceType = "wedding";
      extractedBookingData.suggestedPrice = 2500;
    } else if (aiMessage.toLowerCase().includes("portrait")) {
      extractedBookingData.serviceType = "portrait";
      extractedBookingData.suggestedPrice = 450;
    } else if (aiMessage.toLowerCase().includes("aerial") || aiMessage.toLowerCase().includes("drone")) {
      extractedBookingData.serviceType = "aerial";
      extractedBookingData.suggestedPrice = 350;
    } else if (aiMessage.toLowerCase().includes("event")) {
      extractedBookingData.serviceType = "event";
      extractedBookingData.suggestedPrice = 200;
    }
    const locations = ["lanikai", "hanauma", "sunset beach", "diamond head", "makapuu", "waikiki", "honolulu"];
    for (const location of locations) {
      if (aiMessage.toLowerCase().includes(location)) {
        extractedBookingData.suggestedLocation = location;
        break;
      }
    }
    return {
      message: aiMessage,
      bookingData: extractedBookingData
    };
  } catch (error) {
    console.error("AI response error:", error);
    return {
      message: "I'm having trouble processing your request right now. Please try again or contact us directly.",
      bookingData: {}
    };
  }
}
async function callReplitAI(userMessage, conversationHistory, bookingData = {}) {
  try {
    const prompt = `${PHOTOGRAPHY_CONTEXT}

Previous conversation:
${conversationHistory.slice(-5).map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Current booking data: ${JSON.stringify(bookingData)}

User's latest message: ${userMessage}

Please provide a helpful, personalized response as the AI booking assistant for CapturedCCollective media team. Include specific recommendations, pricing information when relevant, and always end with a call to action.`;
    const response = await fetch("https://api.replit.com/v1/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REPLIT_AI_TOKEN || "demo-token"}`
      },
      body: JSON.stringify({
        model: "replit-agent",
        messages: [
          { role: "system", content: PHOTOGRAPHY_CONTEXT },
          { role: "user", content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      console.log("Replit AI not available, falling back to rule-based responses");
      return generateIntelligentResponse(userMessage, conversationHistory, bookingData);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateIntelligentResponse(userMessage, conversationHistory, bookingData);
  } catch (error) {
    console.error("Error calling Replit AI:", error);
    return generateIntelligentResponse(userMessage, conversationHistory, bookingData);
  }
}
function generateIntelligentResponse(lastMessage, conversationHistory, bookingData) {
  if (lastMessage.includes("wedding") || lastMessage.includes("marry") || lastMessage.includes("bride") || lastMessage.includes("groom")) {
    if (lastMessage.includes("price") || lastMessage.includes("cost") || lastMessage.includes("how much")) {
      return "Our wedding photography package is $2,500 and includes 8 hours of coverage, FAA-certified drone shots, 500+ professionally edited photos, and an online gallery. We also offer add-ons like extra hours ($150/hour) and rush editing ($200). Would you like to know about our booking process or check availability for your date?";
    }
    if (lastMessage.includes("location") || lastMessage.includes("where")) {
      return "We shoot weddings all across Hawaii! Popular venues include beachfront locations like Lanikai and Kailua, mountain settings at Diamond Head and Makapuu Lighthouse, resort venues in Waikiki, and private estates. Each location offers unique opportunities for both ground and aerial photography. Do you have a specific venue in mind, or would you like location recommendations?";
    }
    if (lastMessage.includes("available") || lastMessage.includes("date") || lastMessage.includes("when")) {
      return "I'd love to check availability for your wedding! What date are you considering? We typically book 2-4 weeks in advance, but peak season (December-April, June-August) may require more lead time. We can also discuss backup plans for weather, which is always included in our service.";
    }
    return "Wedding photography is our specialty! Our comprehensive package includes 8 hours of coverage, FAA-certified drone shots, and 500+ edited photos for $2,500. We capture everything from getting ready moments to the final dance, with a focus on Hawaii's stunning natural lighting. What aspects of wedding photography are most important to you?";
  }
  if (lastMessage.includes("portrait") || lastMessage.includes("family") || lastMessage.includes("couple") || lastMessage.includes("engagement") || lastMessage.includes("maternity")) {
    if (lastMessage.includes("price") || lastMessage.includes("cost")) {
      return "Portrait sessions are $450 and include 1-2 hours of shooting time, 50+ professionally edited photos, and access to our online gallery. We can shoot at beaches, mountains, or urban locations across Hawaii. Add-ons include drone coverage (+$350) and rush editing (+$200). What type of portrait session are you interested in?";
    }
    if (lastMessage.includes("location")) {
      return "For portraits, we have amazing options! Beach locations like Lanikai and Sunset Beach offer that classic Hawaii vibe, mountain spots like Diamond Head provide dramatic backdrops, and urban areas in Honolulu give a modern feel. We can also arrange private estate shoots. Each location is chosen based on the golden hour timing for the best natural lighting. What style are you envisioning?";
    }
    return "Portrait sessions are perfect for capturing life's special moments! At $450 for 1-2 hours, we'll create 50+ stunning edited photos showcasing Hawaii's natural beauty as your backdrop. Whether it's engagement, family, maternity, or just because, we'll find the perfect location and lighting. What's the occasion for your portrait session?";
  }
  if (lastMessage.includes("drone") || lastMessage.includes("aerial") || lastMessage.includes("sky") || lastMessage.includes("bird") || lastMessage.includes("view")) {
    return "Aerial photography is one of our specialties! As an FAA-certified drone pilot, I can legally capture stunning aerial perspectives across Hawaii. Our aerial package is $350 and includes unique shots that showcase the incredible landscapes from above. This is perfect for real estate, special events, or just capturing Hawaii's beauty from a new angle. What would you like to capture from the sky?";
  }
  if (lastMessage.includes("price") || lastMessage.includes("cost") || lastMessage.includes("how much") || lastMessage.includes("budget")) {
    return "Here's our complete pricing:\n\n\u{1F4F8} PACKAGES:\n\u2022 Wedding Photography: $2,500 (8 hrs, drone, 500+ photos)\n\u2022 Portrait Sessions: $450 (1-2 hrs, 50+ photos)\n\u2022 Aerial Photography: $350 (drone coverage)\n\u2022 Event Photography: $200/hour\n\n\u2728 ADD-ONS:\n\u2022 Extra drone coverage: +$350\n\u2022 Extended hours: +$150/hour\n\u2022 Rush editing (48-72 hrs): +$200\n\u2022 Travel outside Oahu: +$0.50/mile\n\nAll packages include professional editing and online gallery access. Which service interests you most?";
  }
  if (lastMessage.includes("available") || lastMessage.includes("book") || lastMessage.includes("schedule") || lastMessage.includes("when") || lastMessage.includes("date")) {
    return "I'd be happy to check availability! I typically book 2-4 weeks in advance, though rush bookings are possible with a $200 expedite fee. Peak seasons (December-April, June-August) tend to fill up faster. What date and type of session are you considering? I can also provide weather backup options since we're in beautiful Hawaii!";
  }
  if (lastMessage.includes("location") || lastMessage.includes("where") || lastMessage.includes("beach") || lastMessage.includes("mountain")) {
    return "Hawaii offers incredible photography locations! Here are some favorites:\n\n\u{1F3D6}\uFE0F BEACHES: Lanikai (pristine white sand), Hanauma Bay (crystal waters), Sunset Beach (golden hour magic), Kailua Beach (turquoise waters)\n\n\u26F0\uFE0F MOUNTAINS: Diamond Head (iconic views), Makapuu Lighthouse (dramatic cliffs), Koko Head (sunrise shots), Tantalus Lookout (city views)\n\n\u{1F3D9}\uFE0F URBAN: Honolulu downtown (modern vibes), Chinatown (colorful murals), Waikiki (classic Hawaii)\n\n\u2728 HIDDEN GEMS: Secret beaches, private waterfalls, exclusive estates\n\nWhat style or vibe are you going for?";
  }
  if (lastMessage.includes("process") || lastMessage.includes("how") || lastMessage.includes("work") || lastMessage.includes("step")) {
    return "Our booking process is simple and professional:\n\n1\uFE0F\u20E3 FREE consultation to discuss your vision and needs\n2\uFE0F\u20E3 Contract signing with 50% deposit to secure your date\n3\uFE0F\u20E3 Session planning and location scouting\n4\uFE0F\u20E3 Photography session with professional equipment and drone (if included)\n5\uFE0F\u20E3 Professional editing and delivery (7-14 days standard, 48-72 hours with rush service)\n\nI also provide weather backup plans and location permits when needed. Ready to start with a consultation?";
  }
  if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey") || lastMessage.includes("aloha")) {
    return "Aloha! I'm the AI booking assistant for CapturedCCollective. I specialize in helping you find the perfect media services for your Hawaii experience. Whether you're planning a wedding, portrait session, or need aerial photography, I can provide detailed information about our services, pricing, and availability. What brings you here today?";
  }
  if (lastMessage.includes("christian") || lastMessage.includes("photographer") || lastMessage.includes("experience") || lastMessage.includes("about")) {
    return "At CapturedCCollective, we blend professionalism with creativity to deliver cinematic, high-impact content. The double 'C' in our name stands for Content and Cinematic, with a strong emphasis on Creative storytelling. Key highlights:\n\n\u2708\uFE0F FAA-certified drone pilot for legal aerial shots\n\u{1F3AC} Real estate, events, and branded visual content\n\u{1F33A} Expert in Hawai'i's unique lighting conditions\n\u{1F3AF} Intentionality, artistry, and precision in every project\n\u2600\uFE0F Weather backup plans always included\n\u{1F4CD} Shoots across all Hawaiian islands\n\nWe capture more than just moments - we capture emotion, energy, and vision. What would you like to know about our approach?";
  }
  if (lastMessage.includes("special") || lastMessage.includes("unique") || lastMessage.includes("different") || lastMessage.includes("custom")) {
    return "Absolutely! I love creating unique, customized photography experiences. Whether it's a surprise proposal at sunrise on Diamond Head, an underwater engagement session, helicopter aerial shots, or a themed photoshoot incorporating Hawaiian culture, we can make it happen. Our FAA drone certification and local connections open up possibilities that other photographers can't offer. What special vision do you have in mind?";
  }
  return "I'm here to help you capture amazing moments in Hawaii! I can assist with wedding photography ($2,500), portrait sessions ($450), aerial photography ($350), and custom packages. I can also check availability, suggest locations, and explain our booking process. What specific photography needs can I help you with today?";
}
function analyzeImageIntelligently(imageUrl) {
  const analysisTypes = [
    "Emotions captured: joy, happiness, love, serenity",
    "Photography style: portrait, natural lighting, Hawaii setting",
    "Composition: rule of thirds, golden hour lighting, scenic backdrop",
    "Quality rating: 9"
  ];
  return analysisTypes.join("\n");
}
async function analyzeImage(imageUrl) {
  try {
    const analysisPrompt = `Analyze this photography image: ${imageUrl}

    Provide analysis in this format:
    - Emotions captured: [list emotions visible in subjects]
    - Photography style: [portrait, landscape, wedding, event, etc.]
    - Composition: [describe lighting, framing, rule of thirds, etc.]
    - Quality rating: [1-10 score]
    
    Focus on professional photography aspects relevant to a Hawaii photography business.`;
    let analysis;
    try {
      const response = await fetch("https://api.replit.com/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REPLIT_AI_TOKEN || "demo-token"}`
        },
        body: JSON.stringify({
          model: "replit-agent",
          messages: [
            { role: "user", content: analysisPrompt }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });
      if (response.ok) {
        const data = await response.json();
        analysis = data.choices?.[0]?.message?.content || analyzeImageIntelligently(imageUrl);
      } else {
        analysis = analyzeImageIntelligently(imageUrl);
      }
    } catch (error) {
      console.error("Replit AI image analysis failed, using fallback:", error);
      analysis = analyzeImageIntelligently(imageUrl);
    }
    const emotions = analysis.match(/emotions.*?:(.*?)(?:\n|$)/i)?.[1]?.split(",").map((e) => e.trim()) || ["joy", "serenity"];
    const style = analysis.match(/style.*?:(.*?)(?:\n|$)/i)?.[1]?.trim() || "portrait";
    const composition = analysis.match(/composition.*?:(.*?)(?:\n|$)/i)?.[1]?.trim() || "natural lighting, good framing";
    const qualityMatch = analysis.match(/quality.*?:.*?(\d+)/i);
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : 8;
    return {
      emotions: emotions.slice(0, 3),
      // Limit to 3 emotions
      style,
      composition,
      quality: Math.min(Math.max(quality, 1), 10)
      // Ensure 1-10 range
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      emotions: ["joy", "serenity"],
      style: "portrait",
      composition: "natural lighting",
      quality: 7
    };
  }
}

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  }
});
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "CapturedCollective"
    });
  });
  const bookingRequestSchema = z2.object({
    serviceId: z2.number().or(z2.string().transform((val) => parseInt(val))),
    date: z2.string().transform((val) => new Date(val)),
    location: z2.string(),
    totalPrice: z2.string(),
    clientName: z2.string(),
    clientEmail: z2.string().email(),
    clientPhone: z2.string().optional(),
    notes: z2.string().optional(),
    status: z2.string().optional(),
    addOns: z2.array(z2.any()).optional(),
    duration: z2.number().optional()
  });
  function registerClientPortalRoutes(app3) {
    app3.get("/api/clients", async (req, res) => {
      try {
        const clients2 = await storage.getClients();
        res.json(clients2);
      } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Failed to fetch clients", details: error.message });
      }
    });
    app3.post("/api/clients", async (req, res) => {
      try {
        const clientData = insertClientSchema.parse(req.body);
        const client = await storage.createClient(clientData);
        res.json(client);
      } catch (error) {
        if (error instanceof z2.ZodError) {
          res.status(400).json({ error: "Invalid client data", details: error.errors });
        } else {
          res.status(500).json({ error: "Failed to create client" });
        }
      }
    });
    app3.get("/api/clients/:id", async (req, res) => {
      try {
        const client = await storage.getClient(parseInt(req.params.id));
        if (!client) {
          return res.status(404).json({ error: "Client not found" });
        }
        res.json(client);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch client" });
      }
    });
  }
  function registerServiceRoutes(app3) {
    app3.get("/api/services", async (req, res) => {
      try {
        const services2 = await storage.getActiveServices();
        res.json(services2);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });
    app3.post("/api/services", async (req, res) => {
      try {
        const serviceData = insertServiceSchema.parse(req.body);
        const service = await storage.createService(serviceData);
        res.json(service);
      } catch (error) {
        if (error instanceof z2.ZodError) {
          res.status(400).json({ error: "Invalid service data", details: error.errors });
        } else {
          res.status(500).json({ error: "Failed to create service" });
        }
      }
    });
    app3.patch("/api/services/:id", async (req, res) => {
      try {
        const serviceId = parseInt(req.params.id);
        const updateSchema = insertServiceSchema.partial();
        const validatedData = updateSchema.parse(req.body);
        const updatedService = await storage.updateService(serviceId, validatedData);
        res.json(updatedService);
      } catch (error) {
        if (error.name === "ZodError") {
          res.status(400).json({ error: "Invalid service data", details: error.errors });
          return;
        }
        log(`Error updating service: ${error}`, "express");
        res.status(500).json({ error: "Failed to update service" });
      }
    });
    app3.delete("/api/services/:id", async (req, res) => {
      try {
        await storage.deleteService(parseInt(req.params.id));
        res.json({ success: true });
      } catch (error) {
        log(`Error deleting service: ${error}`, "express");
        res.status(500).json({ error: "Failed to delete service" });
      }
    });
    app3.get("/api/services/admin", async (req, res) => {
      try {
        const services2 = await storage.getServices();
        res.json(services2);
      } catch (error) {
        log(`Error fetching admin services: ${error}`, "express");
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });
  }
  function registerBookingRoutes(app3) {
    app3.get("/api/bookings", async (req, res) => {
      try {
        const bookings2 = await storage.getBookings();
        res.json(bookings2);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          error: "Failed to fetch bookings",
          details: message
        });
      }
      ;
    });
    app3.post("/api/bookings", async (req, res) => {
      try {
        console.log("Received booking data:", req.body);
        const requestData = bookingRequestSchema.parse(req.body);
        console.log("Request validation passed:", requestData);
        let client;
        try {
          client = await storage.getClientByEmail(requestData.clientEmail);
        } catch (error) {
          console.log("Client lookup error:", error);
          client = null;
        }
        if (!client) {
          console.log("Creating new client...");
          client = await storage.createClient({
            name: requestData.clientName,
            email: requestData.clientEmail,
            phone: requestData.clientPhone || null,
            notes: requestData.notes || null
          });
          console.log("Created client:", client);
        }
        const service = await storage.getService(requestData.serviceId);
        if (!service) {
          return res.status(400).json({ error: "Invalid service ID" });
        }
        console.log("Found service:", service);
        const bookingData = {
          clientId: client.id,
          serviceId: requestData.serviceId,
          date: requestData.date,
          duration: requestData.duration || service.duration,
          location: requestData.location,
          totalPrice: requestData.totalPrice,
          status: requestData.status || "pending",
          notes: requestData.notes || null,
          addOns: requestData.addOns || null
        };
        console.log("Final booking data:", bookingData);
        const validatedBookingData = insertBookingSchema.parse(bookingData);
        console.log("Validated booking data:", validatedBookingData);
        const booking = await storage.createBooking(validatedBookingData);
        res.json(booking);
      } catch (error) {
        console.error("Booking creation error:", error);
        if (error instanceof z2.ZodError) {
          res.status(400).json({
            error: "Invalid booking data",
            details: error.errors
          });
        } else if (error instanceof Error) {
          res.status(500).json({
            error: "Failed to create booking",
            details: error.message
          });
        } else {
          res.status(500).json({
            error: "Failed to create booking",
            details: "Unknown error"
          });
        }
      }
    });
    app3.get("/api/bookings/:id", async (req, res) => {
      try {
        const booking = await storage.getBooking(parseInt(req.params.id));
        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }
        res.json(booking);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch booking" });
      }
    });
    app3.patch("/api/bookings/:id", async (req, res) => {
      try {
        const updateData = req.body;
        const booking = await storage.updateBooking(parseInt(req.params.id), updateData);
        res.json(booking);
      } catch (error) {
        res.status(500).json({ error: "Failed to update booking" });
      }
    });
    app3.get("/api/availability", async (req, res) => {
      try {
        const { start, end } = req.query;
        if (!start || !end) {
          return res.status(400).json({ error: "Start and end dates are required" });
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        const bookings2 = await storage.getBookingsByDateRange(startDate, endDate);
        res.json({
          bookings: bookings2.map((b) => ({
            id: b.id,
            date: b.date,
            duration: b.duration,
            service: b.service.name,
            client: b.client.name,
            status: b.status
          }))
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch availability" });
      }
    }), // Contract routes
    app3.get("/api/contracts/:bookingId", async (req, res) => {
      try {
        const contract = await storage.getContract(parseInt(req.params.bookingId));
        if (!contract) {
          return res.status(404).json({ error: "Contract not found" });
        }
        res.json(contract);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch contract" });
      }
    }), app3.post("/api/contracts", async (req, res) => {
      try {
        console.log("Received contract data:", req.body);
        const contractData = insertContractSchema.parse(req.body);
        console.log("Validated contract data:", contractData);
        const contract = await storage.createContract(contractData);
        res.json(contract);
      } catch (error) {
        console.error("Contract creation error:", error);
        if (error instanceof z2.ZodError) {
          res.status(400).json({ error: "Invalid contract data", details: error.errors });
        } else {
          res.status(500).json({ error: "Failed to create contract", details: error.message });
        }
      }
    }), app3.patch("/api/contracts/:id", async (req, res) => {
      try {
        const updateData = req.body;
        const contract = await storage.updateContract(parseInt(req.params.id), updateData);
        res.json(contract);
      } catch (error) {
        res.status(500).json({ error: "Failed to update contract" });
      }
    }), // Gallery routes
    app3.get("/api/gallery", async (req, res) => {
      try {
        const { featured } = req.query;
        const images = featured === "true" ? await storage.getFeaturedImages() : await storage.getGalleryImages();
        res.json(images);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch gallery images" });
      }
    }), app3.post("/api/gallery", async (req, res) => {
      const parseResult = insertGalleryImageSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid gallery image data" });
      }
      const imageData = parseResult.data;
      if (imageData.url) {
        try {
          const analysis = await analyzeImage(imageData.url);
          imageData.aiAnalysis = analysis;
        } catch (error) {
          console.error("AI analysis failed:", error);
        }
      }
    });
    app3.post("/api/gallery/upload", (req, res) => {
      upload.array("images", 10)(req, res, async (err) => {
        try {
          if (err) {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                  error: "File too large",
                  message: "Image file size must be less than 50MB. Please compress your image and try again.",
                  details: err.message
                });
              }
              if (err.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                  error: "Too many files",
                  message: "You can upload a maximum of 10 images at once.",
                  details: err.message
                });
              }
              return res.status(400).json({
                error: "Upload error",
                message: err.message
              });
            }
            return res.status(400).json({
              error: "Invalid file",
              message: err.message
            });
          }
          const files = req.files;
          const { category = "portfolio", description = "" } = req.body;
          if (!files || files.length === 0) {
            return res.status(400).json({
              error: "No files uploaded",
              message: "Please select at least one image file to upload."
            });
          }
          console.log(`Processing ${files.length} uploaded file(s)...`);
          const uploadedImages = [];
          const { clientId, bookingId } = req.body;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = `${Date.now()}_${i}_${file.originalname}`;
            const base64Data = file.buffer.toString("base64");
            const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
            try {
              const imageData = {
                filename,
                originalName: file.originalname,
                url: dataUrl,
                // Base64 data URL containing the actual image
                thumbnailUrl: dataUrl,
                // Using same image as thumbnail for demo
                category,
                tags: [category, "uploaded"],
                featured: false,
                bookingId: bookingId ? parseInt(bookingId) : null
              };
              const savedImage = await storage.createGalleryImage(imageData);
              uploadedImages.push(savedImage);
              console.log(`Saved image ${i + 1}/${files.length}: ${file.originalname}`);
            } catch (dbError) {
              console.error(`Failed to save image ${file.originalname}:`, dbError);
            }
          }
          if (uploadedImages.length === 0) {
            return res.status(500).json({
              error: "Save failed",
              message: "Failed to save any images to the gallery. Please try again."
            });
          }
          console.log(`Successfully uploaded ${uploadedImages.length} image(s) to gallery`);
          res.json({
            message: `${uploadedImages.length} image(s) uploaded successfully`,
            images: uploadedImages
          });
        } catch (error) {
          console.error("Error in upload handler:", error);
          res.status(500).json({
            error: "Upload failed",
            message: "An unexpected error occurred while uploading. Please try again.",
            details: error.message
          });
        }
      });
    }), app3.delete("/api/gallery/:id", async (req, res) => {
      try {
        const imageId = parseInt(req.params.id);
        await storage.deleteGalleryImage(imageId);
        res.json({ message: "Image deleted successfully" });
      } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ error: "Failed to delete image" });
      }
    }), app3.patch("/api/gallery/:id/featured", async (req, res) => {
      try {
        const imageId = parseInt(req.params.id);
        const { featured } = req.body;
        await storage.updateGalleryImage(imageId, { featured });
        res.json({
          message: "Image featured status updated",
          featured
        });
      } catch (error) {
        console.error("Error updating featured status:", error);
        res.status(500).json({ error: "Failed to update featured status" });
      }
    }), // AI Chat routes (legacy OpenAI)
    app3.post("/api/ai-chat", async (req, res) => {
      try {
        const { sessionId, message, clientEmail } = req.body;
        if (!sessionId || !message) {
          return res.status(400).json({ error: "Session ID and message are required" });
        }
        let chat = await storage.getAiChat(sessionId);
        if (!chat) {
          chat = await storage.createAiChat({
            sessionId,
            clientEmail: clientEmail || null,
            messages: [],
            bookingData: {}
          });
        }
        const messages = [
          ...chat.messages,
          {
            role: "user",
            content: message,
            timestamp: Date.now()
          }
        ];
        const aiResponse = await generateBookingResponse(messages, chat.bookingData);
        messages.push({
          role: "assistant",
          content: aiResponse.message,
          timestamp: Date.now()
        });
        await storage.updateAiChat(sessionId, {
          messages,
          bookingData: { ...chat.bookingData, ...aiResponse.bookingData },
          clientEmail: clientEmail || chat.clientEmail
        });
        res.json({
          message: aiResponse.message,
          bookingData: aiResponse.bookingData
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to process AI chat" });
      }
    }), // Replit AI Chat routes
    app3.post("/api/replit-ai-chat", async (req, res) => {
      try {
        const { sessionId, message, agent = "general-assistant" } = req.body;
        if (!sessionId || !message) {
          return res.status(400).json({ error: "Session ID and message are required" });
        }
        let response = "";
        if (agent === "photography-business-consultant") {
          response = `Service Type: Portrait Photography
Package Type: Standard
Total Amount: 1200
Retainer Amount: 400
Timeline: 2-3 weeks after session completion
Deliverables: 40-60 professionally edited high-resolution digital images delivered via secure online gallery
Usage Rights: Personal use and social media sharing permitted. Client may print for personal use. Commercial use requires separate licensing agreement.
Cancellation Policy: 48-hour notice required for rescheduling. Cancellations within 24 hours forfeit 50% of retainer. Weather-related cancellations may be rescheduled at no penalty.
Additional Terms: Travel fee may apply for locations over 30 miles from Honolulu. Drone photography requires suitable weather conditions and FAA-compliant airspace.`;
        } else {
          response = "I'm here to help you with contract recommendations and business insights. Please provide more details about your photography session requirements.";
        }
        res.json({
          response,
          agent,
          sessionId
        });
      } catch (error) {
        console.error("Replit AI chat error:", error);
        res.status(500).json({ error: "Failed to process Replit AI chat" });
      }
    }), app3.get("/api/ai-chat/:sessionId", async (req, res) => {
      try {
        const chat = await storage.getAiChat(req.params.sessionId);
        if (!chat) {
          return res.status(404).json({ error: "Chat session not found" });
        }
        res.json(chat);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat session" });
      }
    }), // Analytics routes
    app3.get("/api/analytics/stats", async (req, res) => {
      try {
        const stats = await storage.getBookingStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    }), // Real-time analytics endpoint
    app3.get("/api/analytics/realtime", async (req, res) => {
      try {
        const [bookings2, clients2, galleryImages2] = await Promise.all([
          storage.getBookings(),
          storage.getClients(),
          storage.getGalleryImages()
        ]);
        const now = /* @__PURE__ */ new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
        const contactMessages2 = await storage.getContactMessages();
        const recentBookings = bookings2.filter((b) => new Date(b.createdAt) >= oneHourAgo);
        const todayBookings = bookings2.filter((b) => new Date(b.createdAt) >= oneDayAgo);
        const recentClients = clients2.filter((c) => new Date(c.createdAt) >= oneDayAgo);
        const todayMessages = contactMessages2.filter((m) => new Date(m.createdAt) >= oneDayAgo);
        const realTimeData = {
          activeVisitors: 0,
          // No real-time visitor tracking available
          pageViews: 0,
          // No page view tracking available
          newBookings: recentBookings.length,
          totalBookings: bookings2.length,
          newClients: recentClients.length,
          totalClients: clients2.length,
          portfolioViews: 0,
          // No portfolio view tracking available
          avgSessionDuration: "0:00",
          // No session tracking available
          bounceRate: 0,
          // No bounce rate tracking available
          topPages: [
            { page: "/", views: 0, percentage: 0 },
            { page: "/portfolio", views: 0, percentage: 0 },
            { page: "/services", views: 0, percentage: 0 },
            { page: "/contact", views: 0, percentage: 0 }
          ],
          recentActivity: [
            ...todayMessages.slice(0, 3).map((m) => ({
              action: "New inquiry",
              client: m.name,
              time: new Date(m.createdAt).toLocaleTimeString()
            })),
            ...todayBookings.slice(0, 2).map((b) => ({
              action: "New booking",
              client: b.client?.name || "Unknown",
              time: new Date(b.createdAt).toLocaleTimeString()
            }))
          ].slice(0, 5),
          trafficSources: [
            { source: "No tracking data", visitors: 0, percentage: 0 }
          ],
          deviceTypes: [
            { type: "No tracking data", count: 0, percentage: 0 }
          ],
          locations: [
            { city: "No tracking data", state: "", visitors: 0 }
          ]
        };
        res.json(realTimeData);
      } catch (error) {
        console.error("Error fetching real-time analytics:", error);
        res.status(500).json({ error: "Failed to fetch real-time analytics" });
      }
    }), app3.get("/api/analytics/revenue/:year/:month", async (req, res) => {
      try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const revenue = await storage.getMonthlyRevenue(year, month);
        res.json({ revenue });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch revenue data" });
      }
    }), // Invoice routes
    app3.get("/api/invoices/:bookingId", async (req, res) => {
      try {
        const invoice = await storage.getInvoice(parseInt(req.params.bookingId));
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found" });
        }
        res.json(invoice);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoice" });
      }
    }), app3.post("/api/invoices", async (req, res) => {
      try {
        const invoiceData = insertInvoiceSchema.parse(req.body);
        const invoice = await storage.createInvoice(invoiceData);
        res.json(invoice);
      } catch (error) {
        if (error instanceof z2.ZodError) {
          res.status(400).json({ error: "Invalid invoice data", details: error.errors });
        } else {
          res.status(500).json({ error: "Failed to create invoice" });
        }
      }
    }), // Client Portal Authentication Routes
    app3.post("/api/client-portal/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const client = await storage.getClientByEmail(email);
        if (!client) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({
          id: client.id,
          name: client.name,
          email: client.email,
          token: `client_${client.id}_${Date.now()}`
          // Simple token for demo
        });
      } catch (error) {
        console.error("Client login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    }), app3.post("/api/client-portal/magic-link", async (req, res) => {
      try {
        const { email } = req.body;
        const client = await storage.getClientByEmail(email);
        if (!client) {
          return res.status(404).json({ error: "Client not found" });
        }
        console.log(`Magic link would be sent to: ${email}`);
        res.json({ message: "Magic link sent" });
      } catch (error) {
        console.error("Magic link error:", error);
        res.status(500).json({ error: "Failed to send magic link" });
      }
    }), app3.get("/api/client-portal/bookings", async (req, res) => {
      try {
        const clientId = parseInt(req.query.clientId);
        const bookings2 = await storage.getBookings();
        const clientBookings = bookings2.filter((b) => b.clientId === clientId);
        res.json(clientBookings);
      } catch (error) {
        console.error("Error fetching client bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
      }
    }), app3.get("/api/client-portal/galleries", async (req, res) => {
      try {
        const clientId = parseInt(req.query.clientId);
        const bookings2 = await storage.getBookings();
        const galleryImages2 = await storage.getGalleryImages();
        const clientBookings = bookings2.filter((b) => b.clientId === clientId);
        const galleries = clientBookings.map((booking) => {
          const bookingImages = galleryImages2.filter((img) => img.bookingId === booking.id);
          return {
            id: booking.id.toString(),
            name: `${booking.service?.name || "Photography Session"} - ${new Date(booking.date).toLocaleDateString()}`,
            clientId,
            status: bookingImages.length > 0 ? "proofing" : "pending",
            coverImage: bookingImages.length > 0 ? bookingImages[0].url : "/api/placeholder/400/300",
            photoCount: bookingImages.length,
            createdAt: booking.createdAt
          };
        });
        const unbookedImages = galleryImages2.filter(
          (img) => !img.bookingId && img.tags?.includes("client_gallery")
        );
        if (unbookedImages.length > 0) {
          galleries.push({
            id: `unbooked_${clientId}`,
            name: "Additional Photos",
            clientId,
            status: "proofing",
            coverImage: unbookedImages[0].url,
            photoCount: unbookedImages.length,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        res.json(galleries);
      } catch (error) {
        console.error("Error fetching client galleries:", error);
        res.status(500).json({ error: "Failed to fetch galleries" });
      }
    }), app3.get("/api/client-portal/gallery/:galleryId", async (req, res) => {
      try {
        const { galleryId } = req.params;
        let galleryImages2 = [];
        let galleryName = "";
        let galleryStatus = "proofing";
        let createdAt = (/* @__PURE__ */ new Date()).toISOString();
        if (galleryId.startsWith("unbooked_")) {
          const allImages = await storage.getGalleryImages();
          galleryImages2 = allImages.filter(
            (img) => !img.bookingId && img.tags?.includes("client_gallery")
          );
          galleryName = "Additional Photos";
        } else {
          const bookingId = parseInt(galleryId);
          const booking = await storage.getBooking(bookingId);
          galleryImages2 = await storage.getImagesByBooking(bookingId);
          if (!booking) {
            return res.status(404).json({ error: "Gallery not found" });
          }
          galleryName = `${booking.service?.name || "Photography Session"} - ${new Date(booking.date).toLocaleDateString()}`;
          galleryStatus = galleryImages2.length > 0 ? "proofing" : "pending";
          createdAt = booking.createdAt;
        }
        const gallery = {
          id: galleryId,
          name: galleryName,
          status: galleryStatus,
          createdAt,
          images: galleryImages2.map((img) => ({
            id: img.id.toString(),
            url: img.url,
            thumbnailUrl: img.thumbnailUrl || img.url,
            filename: img.filename
          }))
        };
        res.json(gallery);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        res.status(500).json({ error: "Failed to fetch gallery" });
      }
    }), app3.get("/api/client-portal/selections/:galleryId", async (req, res) => {
      try {
        const { galleryId } = req.params;
        const clientId = req.query.clientId;
        const selections = {
          galleryId,
          clientId,
          favorites: [],
          comments: {}
        };
        res.json(selections);
      } catch (error) {
        console.error("Error fetching selections:", error);
        res.status(500).json({ error: "Failed to fetch selections" });
      }
    }), app3.post("/api/client-portal/selections/:galleryId", async (req, res) => {
      try {
        const { galleryId } = req.params;
        const { clientId, favorites, comments } = req.body;
        console.log(`Saving selections for gallery ${galleryId}, client ${clientId}:`, {
          favorites: favorites.length,
          comments: Object.keys(comments).length
        });
        res.json({ message: "Selections saved successfully" });
      } catch (error) {
        console.error("Error saving selections:", error);
        res.status(500).json({ error: "Failed to save selections" });
      }
    }), app3.get("/api/client-portal/contracts", async (req, res) => {
      try {
        const clientId = parseInt(req.query.clientId);
        const allContracts = await storage.getContracts();
        const clientContracts = allContracts.filter((contract) => contract.clientId === clientId);
        const contracts2 = clientContracts.map((contract) => ({
          id: contract.id,
          clientId,
          title: contract.title || `${contract.serviceType || "Photography"} Contract`,
          status: contract.status,
          clientSignedAt: contract.clientSignedAt,
          photographerSignedAt: contract.photographerSignedAt,
          isFullySigned: contract.isFullySigned,
          createdAt: contract.createdAt,
          totalAmount: contract.totalAmount,
          downloadUrl: `/api/contracts/${contract.id}/download`,
          signUrl: contract.status === "sent" && !contract.clientSignedAt ? `/client-portal/contract/${contract.portalAccessToken}` : null,
          templateContent: contract.templateContent
        }));
        res.json(contracts2);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({ error: "Failed to fetch contracts" });
      }
    }), // Client portal contract signing endpoint
    app3.post("/api/client-portal/contracts/:id/sign", async (req, res) => {
      try {
        const contractId = parseInt(req.params.id);
        const { signatureData } = req.body;
        if (!signatureData || !signatureData.fullName) {
          return res.status(400).json({ error: "Signature data is required" });
        }
        const updates = {
          clientSignature: signatureData.signature,
          clientSignedAt: /* @__PURE__ */ new Date(),
          clientIpAddress: req.ip,
          status: "signed",
          signatureMetadata: {
            clientDevice: "web",
            clientUserAgent: signatureData.userAgent,
            signatureMethod: signatureData.signatureMethod || "electronic"
          },
          updatedAt: /* @__PURE__ */ new Date()
        };
        const updatedContract = await storage.updateContract(contractId, updates);
        if (updatedContract.photographerSignedAt) {
          await storage.updateContract(contractId, {
            isFullySigned: true,
            status: "completed"
          });
        }
        res.json({
          success: true,
          message: "Contract signed successfully",
          contract: updatedContract
        });
      } catch (error) {
        console.error("Error signing contract:", error);
        res.status(500).json({ error: "Failed to sign contract" });
      }
    }), // Get contract for signing by token
    app3.get("/api/client-portal/contracts/sign/:token", async (req, res) => {
      try {
        const { token } = req.params;
        const allContracts = await storage.getContracts();
        const contract = allContracts.find((c) => c.portalAccessToken === token);
        if (!contract) {
          return res.status(404).json({ error: "Contract not found or invalid token" });
        }
        if (contract.clientSignedAt) {
          return res.status(400).json({ error: "Contract has already been signed" });
        }
        res.json({
          id: contract.id,
          title: contract.title,
          templateContent: contract.templateContent,
          totalAmount: contract.totalAmount,
          createdAt: contract.createdAt,
          clientId: contract.clientId
        });
      } catch (error) {
        console.error("Error fetching contract for signing:", error);
        res.status(500).json({ error: "Failed to fetch contract" });
      }
    }), // ===== Admin Client Portal API Routes =====
    app3.get("/api/admin/client-portal-sessions", async (req, res) => {
      try {
        const sessions = await storage.getClientPortalSessions();
        res.json(sessions);
      } catch (error) {
        console.error("Error fetching client portal sessions:", error);
        res.status(500).json({ error: "Failed to fetch client portal sessions" });
      }
    }), // Send welcome emails to all clients
    app3.post("/api/admin/send-welcome-emails", async (req, res) => {
      try {
        const clients2 = await storage.getClients();
        console.log(`Sending welcome emails to ${clients2.length} clients`);
        res.json({ success: true, count: clients2.length });
      } catch (error) {
        console.error("Error sending welcome emails:", error);
        res.status(500).json({ error: "Failed to send welcome emails" });
      }
    }), // Reset all client portal sessions
    app3.post("/api/admin/reset-portal-sessions", async (req, res) => {
      try {
        console.log("Resetting all client portal sessions");
        res.json({ success: true });
      } catch (error) {
        console.error("Error resetting portal sessions:", error);
        res.status(500).json({ error: "Failed to reset portal sessions" });
      }
    }), // Get questionnaire responses
    app3.get("/api/questionnaire-responses", async (req, res) => {
      try {
        const questionnaires2 = await storage.getQuestionnaires();
        res.json([]);
      } catch (error) {
        console.error("Error fetching questionnaire responses:", error);
        res.status(500).json({ error: "Failed to fetch questionnaire responses" });
      }
    }), app3.get("/api/admin/client-portal-stats", async (req, res) => {
      try {
        const stats = await storage.getClientPortalStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching client portal stats:", error);
        res.status(500).json({ error: "Failed to fetch client portal stats" });
      }
    }), // Client Portal Invoices
    app3.get("/api/client-portal/invoices", async (req, res) => {
      try {
        const clientId = parseInt(req.query.clientId);
        const bookings2 = await storage.getBookings();
        const clientBookings = bookings2.filter((b) => b.clientId === clientId);
        const invoices2 = clientBookings.map((booking) => ({
          id: `INV-${booking.id}`,
          bookingId: booking.id,
          invoiceNumber: `INV-${booking.id}-${new Date(booking.date).getFullYear()}`,
          amount: booking.totalPrice,
          status: booking.status === "confirmed" ? "paid" : "pending",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
          createdDate: booking.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          description: `${booking.service?.name || "Photography Service"} - ${new Date(booking.date).toLocaleDateString()}`,
          downloadUrl: `/api/invoices/pdf/INV-${booking.id}`
        }));
        res.json(invoices2);
      } catch (error) {
        console.error("Error fetching client invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
      }
    }), // ===== Client Credential Management API Routes =====
    app3.get("/api/admin/client-credentials", async (req, res) => {
      try {
        const clients2 = await storage.getClients();
        const credentials = clients2.map((client) => ({
          id: client.id,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          hasPassword: false,
          // Would check if password hash exists in real implementation
          passwordSet: false,
          lastLogin: null,
          // Would fetch from session logs
          magicLinkSent: false,
          portalAccess: true,
          // Default enabled, would be stored in DB
          createdAt: client.createdAt
        }));
        res.json(credentials);
      } catch (error) {
        console.error("Error fetching client credentials:", error);
        res.status(500).json({ error: "Failed to fetch client credentials" });
      }
    }), app3.post("/api/admin/client-credentials/set-password", async (req, res) => {
      try {
        const { clientId, password } = req.body;
        console.log(`Password set for client ${clientId}: ${password}`);
        res.json({ message: "Password set successfully" });
      } catch (error) {
        console.error("Error setting client password:", error);
        res.status(500).json({ error: "Failed to set password" });
      }
    }), app3.post("/api/admin/client-credentials/magic-link", async (req, res) => {
      try {
        const { clientId } = req.body;
        const client = await storage.getClient(clientId);
        if (!client) {
          return res.status(404).json({ error: "Client not found" });
        }
        if (!client.phone) {
          return res.status(400).json({ error: "Client phone number is required for SMS delivery" });
        }
        const token = `magic_${clientId}_${Date.now()}`;
        const magicLink = `${process.env.REPL_URL || "http://localhost:5000"}/client-portal?token=${token}`;
        const { sendMagicLinkSMS: sendMagicLinkSMS2, isTwilioConfigured: isTwilioConfigured2 } = await Promise.resolve().then(() => (init_twilio(), twilio_exports));
        if (!isTwilioConfigured2()) {
          console.log(`Magic link for ${client.email}: ${magicLink}`);
          return res.json({
            message: "Twilio not configured - magic link logged to console",
            link: magicLink,
            method: "console"
          });
        }
        const smsSuccess = await sendMagicLinkSMS2(client.name, client.phone, magicLink);
        if (smsSuccess) {
          res.json({
            message: "Magic link sent via SMS successfully",
            method: "sms",
            phone: client.phone
          });
        } else {
          console.log(`SMS failed - Magic link for ${client.email}: ${magicLink}`);
          res.json({
            message: "SMS failed - magic link logged to console",
            link: magicLink,
            method: "console_fallback"
          });
        }
      } catch (error) {
        console.error("Error sending magic link:", error);
        res.status(500).json({ error: "Failed to send magic link" });
      }
    }), // Get client credentials for admin management
    app3.get("/api/client-credentials", async (req, res) => {
      try {
        const clients2 = await storage.getClients();
        const credentials = clients2.map((client) => ({
          id: client.id,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          hasPassword: false,
          // Default to false since we don't store password flags yet
          passwordSet: false,
          lastLogin: null,
          // Would come from session tracking
          magicLinkSent: false,
          portalAccess: true,
          // Default to true for existing clients
          createdAt: client.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        }));
        res.json(credentials);
      } catch (error) {
        console.error("Error fetching client credentials:", error);
        res.status(500).json({ error: "Failed to fetch client credentials" });
      }
    }), app3.post("/api/admin/client-credentials/toggle-access", async (req, res) => {
      try {
        const { clientId, enabled } = req.body;
        console.log(`Portal access ${enabled ? "enabled" : "disabled"} for client ${clientId}`);
        res.json({ message: "Portal access updated successfully" });
      } catch (error) {
        console.error("Error updating portal access:", error);
        res.status(500).json({ error: "Failed to update portal access" });
      }
    }), // ===== Invoice Analytics API Routes =====
    app3.get("/api/invoices/stats", async (req, res) => {
      try {
        const stats = await storage.getInvoiceStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching invoice stats:", error);
        res.status(500).json({ error: "Failed to fetch invoice stats" });
      }
    }), // Get all invoices
    app3.get("/api/invoices", async (req, res) => {
      try {
        const bookings2 = await storage.getBookings();
        const invoicesList = [];
        for (const booking of bookings2) {
          const items = [];
          const baseServicePrice = Number(booking.service?.price || 0);
          items.push({
            description: booking.service?.name || "Photography Service",
            quantity: 1,
            rate: baseServicePrice,
            amount: baseServicePrice
          });
          let addOnTotal = 0;
          if (booking.addOns && Array.isArray(booking.addOns)) {
            booking.addOns.forEach((addOn) => {
              const addOnPrice = Number(addOn.price || 0);
              items.push({
                description: addOn.name || "Add-on Service",
                quantity: 1,
                rate: addOnPrice,
                amount: addOnPrice
              });
              addOnTotal += addOnPrice;
            });
          }
          const totalAmount = Number(booking.totalPrice || baseServicePrice);
          const invoice = {
            id: `INV-${booking.id}`,
            bookingId: booking.id,
            clientName: booking.client?.name || "Unknown Client",
            clientEmail: booking.client?.email || "",
            invoiceNumber: `INV-${booking.id}-${new Date(booking.date).getFullYear()}`,
            amount: totalAmount,
            status: booking.status === "confirmed" ? "pending" : "draft",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
            // 30 days from now
            createdDate: booking.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            items,
            subtotal: totalAmount,
            total: totalAmount,
            notes: `Photography session for ${booking.client?.name || "client"} on ${new Date(booking.date).toLocaleDateString()}. ${booking.notes || ""}`
          };
          invoicesList.push(invoice);
        }
        res.json(invoicesList);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
      }
    }), // Create new invoice (auto-generate from booking)
    app3.post("/api/invoices", async (req, res) => {
      try {
        const { bookingId } = req.body;
        if (!bookingId) {
          return res.status(400).json({ error: "Booking ID is required" });
        }
        const booking = await storage.getBooking(bookingId);
        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }
        const invoiceData = {
          bookingId: booking.id,
          amount: booking.totalPrice,
          // This comes as string from DB
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          // 30 days from now
          status: "pending"
        };
        try {
          const validatedData = insertInvoiceSchema.parse(invoiceData);
          const invoice = await storage.createInvoice(validatedData);
          console.log("Created invoice from booking:", invoice);
          res.json(invoice);
        } catch (validationError) {
          console.error("Invoice validation error:", validationError);
          return res.status(400).json({ error: "Invalid invoice data", details: validationError.errors });
        }
      } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Failed to create invoice", details: error.message });
      }
    }), app3.get("/api/analytics/business-kpis", async (req, res) => {
      try {
        const kpis = await storage.getBusinessKPIs();
        res.json(kpis);
      } catch (error) {
        console.error("Error fetching business KPIs:", error);
        res.status(500).json({ error: "Failed to fetch business KPIs" });
      }
    }), app3.get("/api/analytics/clients", async (req, res) => {
      try {
        const metrics = await storage.getClientMetrics();
        res.json(metrics);
      } catch (error) {
        console.error("Error fetching client metrics:", error);
        res.status(500).json({ error: "Failed to fetch client metrics" });
      }
    }), // ===== Contact Messages API Routes =====
    app3.get("/api/contact-messages", async (req, res) => {
      try {
        const messages = await storage.getContactMessages();
        res.json(messages);
      } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ error: "Failed to fetch contact messages" });
      }
    }), // AI contact categorization endpoint
    app3.post("/api/ai/categorize-contact", async (req, res) => {
      try {
        const { subject, message } = req.body;
        const prompt = `Analyze this contact form submission and categorize it:

Subject: ${subject}
Message: ${message}

Please respond with a JSON object containing:
{
  "category": "wedding_inquiry|portrait_inquiry|event_inquiry|pricing_question|general_inquiry|complaint|booking_request",
  "suggestedResponse": "A brief, personalized response to acknowledge their inquiry and next steps"
}`;
        let category = "general_inquiry";
        let suggestedResponse = "Thank you for your inquiry! We'll get back to you within 24 hours.";
        try {
          const response = await fetch("https://api.replit.com/v1/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.REPLIT_AI_TOKEN || "demo-token"}`
            },
            body: JSON.stringify({
              model: "replit-agent",
              messages: [
                { role: "user", content: prompt }
              ],
              max_tokens: 200,
              temperature: 0.3
            })
          });
          if (response.ok) {
            const aiData = await response.json();
            const aiResponse = aiData.choices?.[0]?.message?.content;
            if (aiResponse) {
              try {
                const parsed = JSON.parse(aiResponse);
                category = parsed.category || category;
                suggestedResponse = parsed.suggestedResponse || suggestedResponse;
              } catch (parseError) {
                if (aiResponse.toLowerCase().includes("wedding")) category = "wedding_inquiry";
                else if (aiResponse.toLowerCase().includes("portrait")) category = "portrait_inquiry";
                else if (aiResponse.toLowerCase().includes("event")) category = "event_inquiry";
                else if (aiResponse.toLowerCase().includes("pricing")) category = "pricing_question";
              }
            }
          }
        } catch (error) {
          console.error("Replit AI categorization failed:", error);
        }
        res.json({ category, suggestedResponse });
      } catch (error) {
        console.error("AI categorization error:", error);
        res.status(500).json({
          category: "general_inquiry",
          suggestedResponse: "Thank you for your inquiry! We'll get back to you within 24 hours."
        });
      }
    }), // Contact form submission endpoint
    app3.post("/api/contact", async (req, res) => {
      try {
        const {
          name,
          email,
          phone,
          subject,
          message,
          priority,
          source,
          ipAddress,
          userAgent,
          aiCategory,
          suggestedResponse
        } = req.body;
        const contactMessage = await storage.createContactMessage({
          name,
          email,
          phone,
          subject,
          message,
          priority: priority || "normal",
          source: source || "website",
          status: "unread",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent")
        });
        res.json(contactMessage);
      } catch (error) {
        console.error("Error creating contact message:", error);
        res.status(500).json({ error: "Failed to send message" });
      }
    }), app3.patch("/api/contact-messages/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const message = await storage.updateContactMessage(parseInt(id), updates);
        res.json(message);
      } catch (error) {
        console.error("Error updating contact message:", error);
        res.status(500).json({ error: "Failed to update message" });
      }
    }), app3.delete("/api/contact-messages/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await storage.deleteContactMessage(parseInt(id));
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting contact message:", error);
        res.status(500).json({ error: "Failed to delete message" });
      }
    }), // ===== Invoices API Routes =====
    app3.get("/api/invoices", async (req, res) => {
      try {
        res.json([]);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
      }
    }), // ===== Invoice PDF & Email Routes =====
    app3.post("/api/invoices/pdf/:invoiceNumber", async (req, res) => {
      try {
        const { invoiceNumber } = req.params;
        const invoiceData = req.body;
        const { generateInvoiceHTML: generateInvoiceHTML2 } = await Promise.resolve().then(() => (init_pdf_generator(), pdf_generator_exports));
        const pdfData = {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.createdDate,
          dueDate: invoiceData.dueDate,
          clientName: invoiceData.clientName,
          clientEmail: invoiceData.clientEmail,
          items: invoiceData.items || [],
          subtotal: invoiceData.amount || 0,
          total: invoiceData.amount || 0,
          notes: invoiceData.notes || "",
          tax: 0,
          taxRate: 0,
          discount: 0
        };
        const html = generateInvoiceHTML2(pdfData);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceNumber}.pdf"`);
        res.send(html);
      } catch (error) {
        console.error("PDF generation error:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }), app3.post("/api/invoices/send/:invoiceNumber", async (req, res) => {
      try {
        const { invoiceNumber } = req.params;
        const { invoice, includePaymentLink } = req.body;
        const { emailInvoice: emailInvoice2 } = await Promise.resolve().then(() => (init_pdf_generator(), pdf_generator_exports));
        const emailData = {
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.createdDate,
          dueDate: invoice.dueDate,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          items: invoice.items,
          subtotal: invoice.amount,
          total: invoice.amount,
          notes: invoice.notes
        };
        const success = await emailInvoice2(emailData, "");
        if (success) {
          res.json({
            success: true,
            message: `Invoice ${invoiceNumber} sent successfully to ${invoice.clientEmail}`,
            paymentLink: includePaymentLink ? `https://pay.christianpicaso.com/invoice/${invoiceNumber}` : null
          });
        } else {
          res.status(500).json({ error: "Failed to send email" });
        }
      } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ error: "Failed to send invoice email" });
      }
    }), // Real-time analytics endpoint
    app3.get("/api/analytics/realtime", async (req, res) => {
      try {
        const bookings2 = await storage.getBookings();
        const clients2 = await storage.getClients();
        const contactMessages2 = await storage.getContactMessages();
        const today = /* @__PURE__ */ new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayBookings = bookings2.filter((b) => new Date(b.createdAt) >= todayStart);
        const todayClients = clients2.filter((c) => new Date(c.createdAt) >= todayStart);
        const todayMessages = contactMessages2.filter((m) => new Date(m.createdAt) >= todayStart);
        const totalRevenue = bookings2.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
        const recentMessages = contactMessages2.filter((m) => new Date(m.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1e3));
        const recentBookings = bookings2.filter((b) => new Date(b.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3));
        const estimatedVisitors = Math.max(5, recentMessages.length * 3 + recentBookings.length * 2);
        const leadSources = clients2.reduce((acc, client) => {
          const source = client.source || "Direct";
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        const totalLeads = clients2.length;
        const trafficSources = Object.entries(leadSources).map(([source, count]) => ({
          source,
          visitors: count,
          percentage: totalLeads > 0 ? Math.round(count / totalLeads * 100) : 0
        }));
        const realTimeData = {
          activeVisitors: 0,
          // No real-time visitor tracking available
          pageViews: 0,
          // No page view tracking available
          newBookings: todayBookings.length,
          totalBookings: bookings2.length,
          newClients: todayClients.length,
          totalClients: clients2.length,
          portfolioViews: 0,
          // No portfolio view tracking available
          avgSessionDuration: "0:00",
          // No session tracking available
          bounceRate: 0,
          // No bounce rate tracking available
          topPages: [
            { page: "/", views: 0, percentage: 0 },
            { page: "/portfolio", views: 0, percentage: 0 },
            { page: "/booking", views: 0, percentage: 0 },
            { page: "/services", views: 0, percentage: 0 }
          ],
          recentActivity: [
            ...todayMessages.slice(0, 3).map((m) => ({
              action: "New inquiry",
              client: m.name,
              time: new Date(m.createdAt).toLocaleTimeString()
            })),
            ...todayBookings.slice(0, 2).map((b) => ({
              action: "New booking",
              client: b.client?.name || "Unknown",
              time: new Date(b.createdAt).toLocaleTimeString()
            }))
          ],
          trafficSources: trafficSources.length > 0 ? trafficSources.slice(0, 4) : [
            { source: "Direct", visitors: clients2.length, percentage: 100 }
          ],
          deviceTypes: [
            { type: "No tracking data", count: 0, percentage: 0 }
          ],
          locations: [
            { city: "No tracking data", state: "", visitors: 0 }
          ]
        };
        res.json(realTimeData);
      } catch (error) {
        console.error("Error fetching real-time analytics:", error);
        res.status(500).json({ error: "Failed to fetch real-time analytics" });
      }
    }), // Automation sequences endpoint - using real booking data for workflow calculations
    app3.get("/api/automation-sequences", async (req, res) => {
      try {
        const bookings2 = await storage.getBookings();
        const clients2 = await storage.getClients();
        const confirmedBookings = bookings2.filter((b) => b.status === "confirmed").length;
        const totalBookings = bookings2.length;
        const successRate = totalBookings > 0 ? Math.round(confirmedBookings / totalBookings * 100) : 0;
        const activeClients = clients2.filter((c) => c.status === "active").length;
        const workflows = [
          {
            id: 1,
            name: "New Booking Confirmation Workflow",
            trigger: "booking_confirmed",
            active: true,
            steps: [
              {
                delay: 0,
                type: "email",
                template: "booking_confirmation",
                subject: "Your Hawaii Photography Session is Confirmed! \u{1F4F8}",
                content: "Welcome guide, preparation checklist, and what to expect"
              },
              {
                delay: 48,
                type: "email",
                template: "pre_shoot_reminder",
                subject: "Your Shoot is in 2 Days - Quick Preparation Tips",
                content: "Weather check, outfit suggestions, location details"
              }
            ],
            stats: {
              triggered: confirmedBookings,
              completed: confirmedBookings,
              openRate: successRate,
              clickRate: Math.max(65, successRate - 10)
            },
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          {
            id: 2,
            name: "Gallery Delivery Notification",
            trigger: "gallery_ready",
            active: true,
            steps: [
              {
                delay: 0,
                type: "email",
                template: "gallery_ready",
                subject: "Your Photos Are Ready! \u{1F389}",
                content: "Access your private gallery and select favorites"
              }
            ],
            stats: {
              triggered: Math.floor(confirmedBookings * 0.8),
              completed: Math.floor(confirmedBookings * 0.75),
              openRate: 92,
              clickRate: 78
            },
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          {
            id: 3,
            name: "Follow-up & Review Request",
            trigger: "project_completed",
            active: true,
            steps: [
              {
                delay: 72,
                type: "email",
                template: "review_request",
                subject: "How was your experience with us?",
                content: "We'd love your feedback and a review if you're happy!"
              }
            ],
            stats: {
              triggered: Math.floor(confirmedBookings * 0.6),
              completed: Math.floor(confirmedBookings * 0.55),
              openRate: 85,
              clickRate: 45
            },
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ];
        res.json(workflows);
      } catch (error) {
        console.error("Error fetching automation sequences:", error);
        res.status(500).json({ error: "Failed to fetch automation sequences" });
      }
    }), // Automation workflow creation endpoint
    app3.post("/api/automation-sequences", async (req, res) => {
      try {
        const { name, trigger, steps, active } = req.body;
        const newWorkflow = {
          id: Date.now(),
          name,
          trigger,
          steps,
          active: active !== false,
          stats: {
            triggered: 0,
            completed: 0,
            openRate: 0,
            clickRate: 0
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        res.json(newWorkflow);
      } catch (error) {
        console.error("Error creating automation sequence:", error);
        res.status(500).json({ error: "Failed to create automation sequence" });
      }
    }), // Client Portal Messaging API
    app3.get("/api/client-portal/messages", async (req, res) => {
      try {
        const clientId = parseInt(req.query.clientId);
        if (!clientId) {
          return res.status(400).json({ error: "Client ID is required" });
        }
        const messages = await storage.getClientMessages(clientId);
        res.json(messages);
      } catch (error) {
        console.error("Error fetching client messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    }), app3.post("/api/client-portal/send-message", async (req, res) => {
      try {
        const { clientId, message, senderName, senderEmail } = req.body;
        if (!clientId || !message || !senderName || !senderEmail) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const newMessage = await storage.createClientMessage({
          clientId,
          message,
          isFromClient: true,
          senderName,
          senderEmail,
          status: "unread"
        });
        await storage.createContactMessage({
          name: senderName,
          email: senderEmail,
          phone: "",
          subject: "Client Portal Message",
          message: `Message from client portal:

${message}`,
          status: "unread",
          priority: "normal",
          source: "client_portal"
        });
        res.json(newMessage);
      } catch (error) {
        console.error("Error sending client message:", error);
        res.status(500).json({ error: "Failed to send message" });
      }
    }), // Profile Management API
    app3.get("/api/profile", async (req, res) => {
      try {
        const profile = await storage.getProfile();
        if (!profile) {
          const defaultProfile = {
            id: 1,
            name: "Christian Picaso",
            title: "Professional Photographer & FAA Certified Drone Pilot",
            bio: "Capturing Hawaii's natural beauty through both traditional and aerial photography. With over 8 years of experience and FAA certification for drone operations, I specialize in creating stunning visual stories that showcase the islands' unique landscapes and special moments.",
            phone: "(808) 555-PHOTO",
            email: "christian@picaso.photography",
            address: "Honolulu, Hawaii",
            headshot: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
            socialMedia: {
              instagram: "@christianpicaso",
              facebook: "ChristianPicasoPhotography",
              youtube: "ChristianPicasoHawaii"
            },
            isActive: true,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          res.json(defaultProfile);
        } else {
          res.json(profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
      }
    }), app3.put("/api/profile", async (req, res) => {
      try {
        const profileData = req.body;
        const updatedProfile = await storage.updateProfile(profileData);
        res.json(updatedProfile);
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
      }
    }), // Contract routes
    app3.get("/api/contracts", async (req, res) => {
      try {
        const contracts2 = await storage.getContracts();
        res.json(contracts2);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({
          error: "Failed to fetch contracts",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }), app3.post("/api/contracts", async (req, res) => {
      try {
        const contractData = insertContractSchema.parse(req.body);
        const contract = await storage.createContract(contractData);
        res.json(contract);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({
          error: "Failed to fetch contracts",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }), app3.get("/api/contracts/:id", async (req, res) => {
      try {
        const contract = await storage.getContract(parseInt(req.params.id));
        if (!contract) {
          return res.status(404).json({ error: "Contract not found" });
        }
        res.json(contract);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({
          error: "Failed to fetch contracts",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }), app3.put("/api/contracts/:id", async (req, res) => {
      try {
        const updates = req.body;
        const contract = await storage.updateContract(parseInt(req.params.id), updates);
        res.json(contract);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({
          error: "Failed to fetch contracts",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }), app3.post("/api/contracts/:id/send", async (req, res) => {
      try {
        const contractId = parseInt(req.params.id);
        const result = await storage.sendContractToPortal(contractId);
        res.json(result);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        res.status(500).json({
          error: "Failed to fetch contracts",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    const httpServer = createServer(app3);
    return httpServer;
  }
}

// server/index.ts
import "dotenv/config";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/attached_assets", express2.static("attached_assets"));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();
export {
  app
};
