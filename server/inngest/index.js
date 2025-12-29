import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

// CREATE
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-created-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        email: data.email_addresses?.[0]?.email_address ?? `${data.id}@clerk.local`,
        name: [data.first_name, data.last_name].filter(Boolean).join(" "),
        image: data.image_url ?? "",
      },
    });
  }
);

// DELETE
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deleted-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.deleteMany({
      where: { id: data.id },
    });
  }
);

// UPDATE
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updated-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email_addresses?.[0]?.email_address ?? undefined,
        name: [data.first_name, data.last_name].filter(Boolean).join(" "),
        image: data.image_url ?? "",
      },
      create: {
        id: data.id,
        email: data.email_addresses?.[0]?.email_address ?? `${data.id}@clerk.local`,
        name: [data.first_name, data.last_name].filter(Boolean).join(" "),
        image: data.image_url ?? "",
      },
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];
