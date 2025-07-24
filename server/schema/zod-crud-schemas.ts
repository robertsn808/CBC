import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  users,
  clients,
  services,
  bookings,
  contracts,
  invoices,
  galleryImages,
  aiChats,
  leads,
  communicationLog,
  automationSequences,
  questionnaires,
  clientPortalSessions,
  products,
  orders,
  teamMembers,
  contactMessages,
  clientMessages,
  profiles,
} from './schema';

// ---- users ----
export const insertUsersSchema = createInsertSchema(users).omit({id: true, createdAt: true});
export const selectUsersSchema = createSelectSchema(users);
export const updateUsersSchema = insertUsersSchema.partial();

// ---- clients ----
export const insertClientsSchema = createInsertSchema(clients).omit({id: true, createdAt: true});
export const selectClientsSchema = createSelectSchema(clients);
export const updateClientsSchema = insertClientsSchema.partial();

// ---- services ----
export const insertServicesSchema = createInsertSchema(services).omit({id: true});
export const selectServicesSchema = createSelectSchema(services);
export const updateServicesSchema = insertServicesSchema.partial();

// ---- bookings ----
export const insertBookingsSchema = createInsertSchema(bookings).omit({id: true, createdAt: true});
export const selectBookingsSchema = createSelectSchema(bookings);
export const updateBookingsSchema = insertBookingsSchema.partial();

// ---- contracts ----
export const insertContractsSchema = createInsertSchema(contracts).omit({});
export const selectContractsSchema = createSelectSchema(contracts);
export const updateContractsSchema = insertContractsSchema.partial();

// ---- invoices ----
export const insertInvoicesSchema = createInsertSchema(invoices).omit({id: true});
export const selectInvoicesSchema = createSelectSchema(invoices);
export const updateInvoicesSchema = insertInvoicesSchema.partial();

// ---- galleryImages ----
export const insertGalleryImagesSchema = createInsertSchema(galleryImages).omit({id: true, uploadedAt: true});
export const selectGalleryImagesSchema = createSelectSchema(galleryImages);
export const updateGalleryImagesSchema = insertGalleryImagesSchema.partial();

// ---- aiChats ----
export const insertAiChatsSchema = createInsertSchema(aiChats).omit({id: true, createdAt: true, updatedAt: true});
export const selectAiChatsSchema = createSelectSchema(aiChats);
export const updateAiChatsSchema = insertAiChatsSchema.partial();

// ---- leads ----
export const insertLeadsSchema = createInsertSchema(leads).omit({id: true, createdAt: true});
export const selectLeadsSchema = createSelectSchema(leads);
export const updateLeadsSchema = insertLeadsSchema.partial();

// ---- communicationLog ----
export const insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({id: true, createdAt: true});
export const selectCommunicationLogSchema = createSelectSchema(communicationLog);
export const updateCommunicationLogSchema = insertCommunicationLogSchema.partial();

// ---- automationSequences ----
export const insertAutomationSequencesSchema = createInsertSchema(automationSequences).omit({id: true, createdAt: true});
export const selectAutomationSequencesSchema = createSelectSchema(automationSequences);
export const updateAutomationSequencesSchema = insertAutomationSequencesSchema.partial();

// ---- questionnaires ----
export const insertQuestionnairesSchema = createInsertSchema(questionnaires).omit({id: true, createdAt: true});
export const selectQuestionnairesSchema = createSelectSchema(questionnaires);
export const updateQuestionnairesSchema = insertQuestionnairesSchema.partial();

// ---- clientPortalSessions ----
export const insertClientPortalSessionsSchema = createInsertSchema(clientPortalSessions).omit({sessionToken: true, createdAt: true});
export const selectClientPortalSessionsSchema = createSelectSchema(clientPortalSessions);
export const updateClientPortalSessionsSchema = insertClientPortalSessionsSchema.partial();

// ---- products ----
export const insertProductsSchema = createInsertSchema(products).omit({id: true, createdAt: true});
export const selectProductsSchema = createSelectSchema(products);
export const updateProductsSchema = insertProductsSchema.partial();

// ---- orders ----
export const insertOrdersSchema = createInsertSchema(orders).omit({id: true, createdAt: true});
export const selectOrdersSchema = createSelectSchema(orders);
export const updateOrdersSchema = insertOrdersSchema.partial();

// ---- teamMembers ----
export const insertTeamMembersSchema = createInsertSchema(teamMembers).omit({id: true, createdAt: true});
export const selectTeamMembersSchema = createSelectSchema(teamMembers);
export const updateTeamMembersSchema = insertTeamMembersSchema.partial();

// ---- contactMessages ----
export const insertContactMessagesSchema = createInsertSchema(contactMessages).omit({id: true, createdAt: true});
export const selectContactMessagesSchema = createSelectSchema(contactMessages);
export const updateContactMessagesSchema = insertContactMessagesSchema.partial();

// ---- clientMessages ----
export const insertClientMessagesSchema = createInsertSchema(clientMessages).omit({id: true, createdAt: true});
export const selectClientMessagesSchema = createSelectSchema(clientMessages);
export const updateClientMessagesSchema = insertClientMessagesSchema.partial();

// ---- profiles ----
export const insertProfilesSchema = createInsertSchema(profiles).omit({id: true, createdAt: true, updatedAt: true});
export const selectProfilesSchema = createSelectSchema(profiles);
export const updateProfilesSchema = insertProfilesSchema.partial();
