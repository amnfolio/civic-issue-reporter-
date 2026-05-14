import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, issues } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const isRead = searchParams.get('is_read');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate required user_id parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'Valid user_id is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(notifications.userId, parseInt(userId))];
    
    if (isRead !== null && (isRead === 'true' || isRead === 'false')) {
      conditions.push(eq(notifications.isRead, isRead === 'true'));
    }

    // Query notifications with issue details
    const results = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        issueId: notifications.issueId,
        message: notifications.message,
        type: notifications.type,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        issue: {
          id: issues.id,
          title: issues.title,
          status: issues.status,
        },
      })
      .from(notifications)
      .leftJoin(issues, eq(notifications.issueId, issues.id))
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, issueId, message, type } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { 
          error: 'message is required',
          code: 'MISSING_MESSAGE' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate issueId if provided
    if (issueId && isNaN(parseInt(issueId))) {
      return NextResponse.json(
        { 
          error: 'issueId must be a valid integer',
          code: 'INVALID_ISSUE_ID' 
        },
        { status: 400 }
      );
    }

    // Create notification object
    const notificationData: any = {
      userId: parseInt(userId),
      message: message.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (issueId) {
      notificationData.issueId = parseInt(issueId);
    }

    if (type) {
      notificationData.type = type.trim();
    }

    // Insert notification
    const newNotification = await db
      .insert(notifications)
      .values(notificationData)
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();
    const { is_read = true } = body;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid notification ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if notification exists
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { 
          error: 'Notification not found',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Update notification
    const updated = await db
      .update(notifications)
      .set({
        isRead: is_read === true || is_read === 'true',
      })
      .where(eq(notifications.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid notification ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if notification exists
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { 
          error: 'Notification not found',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete notification
    const deleted = await db
      .delete(notifications)
      .where(eq(notifications.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Notification deleted successfully',
        notification: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}