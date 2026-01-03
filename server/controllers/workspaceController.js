import prisma from "../configs/prisma.js";

/**
 * GET all workspaces for logged-in user
 */
export const getUserWorkspaces = async (req, res) => {
  try {
    const {userId} = await req.auth();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        owner: true,
        members: { include: { user: true } },
        projects: {
          include: {
            members: { include: { user: true } },
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    res.json({ workspaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADD member to workspace
 */
export const addMember = async (req, res) => {
  try {
    const {userId} = await auth();
    const { email, role, workspaceId, message } = req.body;

    if (!email || !role || !workspaceId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isAdmin = workspace.members.some(
      (m) => m.userId === userId && m.role === "ADMIN"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.userId === user.id
    );

    if (alreadyMember) {
      return res.status(409).json({ message: "User already a member" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
