import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and received events
export const inngest = new Inngest({ id: "project-management" });


// Ingest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-created-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + "" + data?.last_name,
        image: data?.image_url,
      }
    });
  }
);

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deleted-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { 
        id: data.id 
      },
    });
  }
);

// Inngest Function to update user data in database

const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updated-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses?.[0]?.email_address,
        name: data?.first_name + "" + data?.last_name,
        image: data.image_url,
      },
    });
  }
);

// Inngest Function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
  {id: 'sync-workspace-from-clerk'},
  {event: 'clerk/organization.created'},
  async({ event }) => {
    const {data} = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerid: data.created_by,
        image_url: data.image_url,
      }
    })

    // Add creator as Admin memeber
    await prisma.workspaceMember.create({
      data: {
        useId: data.created_by,
        workspaceid: data.id,
        role: "ADMIN"
      }
    })
  }
)

// Inngest Function to update workspace data in database
const syncWorkspaceUpdationCreation = inngest.createFunction(
  {id: 'update-workspace-from-clerk'},
  {event: 'clerk/organization.update'},
  async ({ event })=> {
    const { data } = event;
    await prisma.workspace.update({
      where: {
        id: data.id
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      }
    })
  }
)

// Inngest Function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  { id: 'delete-workspace-with-clerk'},
  { event: 'clerk/organization.delete'},
  async({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data.id
      }
    })
  }
  
)

// Inngest Function to save workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
  {id: 'sync-workspace-member-from-clerk'},
  {event: 'clerk/organizationInitation.accepted'},
  async ({event}) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_nam).toUpperCase(),
      }
    })
  }
)

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdationCreation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation
  
];