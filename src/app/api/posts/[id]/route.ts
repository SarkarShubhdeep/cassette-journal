import { db } from "@/db";
import { postsTable, usersTable } from "@/schema";
import { auth0 } from "@/lib/auth0";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Helper function to verify user owns the post
async function verifyPostOwnership(postId: number, userEmail: string) {
    const post = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId));

    if (post.length === 0) {
        return null;
    }

    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, post[0].userId));

    if (user.length === 0 || user[0].email !== userEmail) {
        return null;
    }

    return post[0];
}

// GET single post
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const postId = parseInt(params.id);
        const post = await verifyPostOwnership(postId, session.user.email!);

        if (!post) {
            return NextResponse.json(
                { success: false, error: "Post not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}

// PUT update post
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const postId = parseInt(params.id);
        const body = await request.json();
        const { title, content } = body;

        if (!title || content === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title and content are required",
                },
                { status: 400 }
            );
        }

        // Verify ownership before updating
        const existingPost = await verifyPostOwnership(
            postId,
            session.user.email!
        );
        if (!existingPost) {
            return NextResponse.json(
                { success: false, error: "Post not found or unauthorized" },
                { status: 404 }
            );
        }

        const updatedPost = await db
            .update(postsTable)
            .set({ title, content })
            .where(eq(postsTable.id, postId))
            .returning();

        return NextResponse.json({ success: true, data: updatedPost[0] });
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update post" },
            { status: 500 }
        );
    }
}

// DELETE post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const postId = parseInt(params.id);

        // Verify ownership before deleting
        const existingPost = await verifyPostOwnership(
            postId,
            session.user.email!
        );
        if (!existingPost) {
            return NextResponse.json(
                { success: false, error: "Post not found or unauthorized" },
                { status: 404 }
            );
        }

        const deletedPost = await db
            .delete(postsTable)
            .where(eq(postsTable.id, postId))
            .returning();

        return NextResponse.json({ success: true, data: deletedPost[0] });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
