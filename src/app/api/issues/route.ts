import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { issues, users, departments } from '@/db/schema';
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single issue fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db
        .select({
          id: issues.id,
          userId: issues.userId,
          title: issues.title,
          description: issues.description,
          category: issues.category,
          imageUrl: issues.imageUrl,
          latitude: issues.latitude,
          longitude: issues.longitude,
          address: issues.address,
          status: issues.status,
          departmentId: issues.departmentId,
          assignedBy: issues.assignedBy,
          adminNotes: issues.adminNotes,
          voteCount: issues.voteCount,
          createdAt: issues.createdAt,
          updatedAt: issues.updatedAt,
          userName: users.name,
          userEmail: users.email,
          departmentName: departments.name,
        })
        .from(issues)
        .leftJoin(users, eq(issues.userId, users.id))
        .leftJoin(departments, eq(issues.departmentId, departments.id))
        .where(eq(issues.id, parseInt(id)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'Issue not found',
          code: 'ISSUE_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    }

    // List issues with filtering and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const userId = searchParams.get('user_id');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sort') ?? 'createdAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Build conditions array
    const conditions = [];

    if (status) {
      conditions.push(eq(issues.status, status));
    }

    if (category) {
      conditions.push(eq(issues.category, category));
    }

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user_id is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(issues.userId, parseInt(userId)));
    }

    if (search) {
      conditions.push(
        or(
          like(issues.title, `%${search}%`),
          like(issues.description, `%${search}%`),
          like(issues.address, `%${search}%`)
        )
      );
    }

    // Determine sort column
    let sortColumn;
    switch (sortField) {
      case 'voteCount':
        sortColumn = issues.voteCount;
        break;
      case 'status':
        sortColumn = issues.status;
        break;
      case 'createdAt':
      default:
        sortColumn = issues.createdAt;
        break;
    }

    // Build query
    let query = db
      .select({
        id: issues.id,
        userId: issues.userId,
        title: issues.title,
        description: issues.description,
        category: issues.category,
        imageUrl: issues.imageUrl,
        latitude: issues.latitude,
        longitude: issues.longitude,
        address: issues.address,
        status: issues.status,
        departmentId: issues.departmentId,
        assignedBy: issues.assignedBy,
        adminNotes: issues.adminNotes,
        voteCount: issues.voteCount,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(issues)
      .leftJoin(users, eq(issues.userId, users.id));

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, authUserId, userEmail, userName, title, description, category, latitude, longitude, imageUrl, address } = body;

    // Handle user ID - support both old and new approaches
    let finalUserId: number;
    
    if (userId) {
      // Old approach - direct userId provided
      if (isNaN(parseInt(userId.toString()))) {
        return NextResponse.json({ 
          error: "userId must be a valid number",
          code: "INVALID_USER_ID",
          receivedValue: userId,
          receivedType: typeof userId
        }, { status: 400 });
      }
      finalUserId = parseInt(userId.toString());
    } else if (userEmail) {
      // New approach - find or create user by email
      const { users } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');
      
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (existingUser.length > 0) {
        finalUserId = existingUser[0].id;
      } else {
        // Create new user in the users table
        const newUser = await db
          .insert(users)
          .values({
            email: userEmail,
            name: userName || 'User',
            role: 'user',
            createdAt: new Date().toISOString(),
          })
          .returning();
        finalUserId = newUser[0].id;
      }
    } else {
      return NextResponse.json({ 
        error: "Either userId or userEmail is required",
        code: "MISSING_USER_IDENTIFIER" 
      }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ 
        error: "title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ 
        error: "description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: "category is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    if (latitude === undefined || latitude === null) {
      return NextResponse.json({ 
        error: "latitude is required",
        code: "MISSING_LATITUDE" 
      }, { status: 400 });
    }

    if (longitude === undefined || longitude === null) {
      return NextResponse.json({ 
        error: "longitude is required",
        code: "MISSING_LONGITUDE" 
      }, { status: 400 });
    }

    // Validate field lengths
    if (title.length > 200) {
      return NextResponse.json({ 
        error: "title cannot exceed 200 characters",
        code: "TITLE_TOO_LONG" 
      }, { status: 400 });
    }

    if (description.length > 2000) {
      return NextResponse.json({ 
        error: "description cannot exceed 2000 characters",
        code: "DESCRIPTION_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate latitude and longitude are numbers
    if (isNaN(parseFloat(latitude.toString()))) {
      return NextResponse.json({ 
        error: "latitude must be a valid number",
        code: "INVALID_LATITUDE" 
      }, { status: 400 });
    }

    if (isNaN(parseFloat(longitude.toString()))) {
      return NextResponse.json({ 
        error: "longitude must be a valid number",
        code: "INVALID_LONGITUDE" 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    const newIssue = await db.insert(issues)
      .values({
        userId: finalUserId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        address: address ? address.trim() : null,
        status: 'received',
        voteCount: 0,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newIssue[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Check if issue exists
    const existingIssue = await db.select()
      .from(issues)
      .where(eq(issues.id, parseInt(id)))
      .limit(1);

    if (existingIssue.length === 0) {
      return NextResponse.json({ 
        error: 'Issue not found',
        code: 'ISSUE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if requester is admin by looking for admin-only fields
    const isAdminUpdate = body.status || body.departmentId || body.assignedBy !== undefined || body.adminNotes !== undefined;
    const isUserUpdate = body.title || body.description || body.imageUrl !== undefined || body.address !== undefined;

    // If user update, verify ownership
    if (isUserUpdate && !isAdminUpdate) {
      if (!body.requestUserId) {
        return NextResponse.json({ 
          error: "requestUserId is required for user updates",
          code: "MISSING_REQUEST_USER_ID" 
        }, { status: 400 });
      }

      if (existingIssue[0].userId !== parseInt(body.requestUserId.toString())) {
        return NextResponse.json({ 
          error: "You can only update your own issues",
          code: "UNAUTHORIZED_UPDATE" 
        }, { status: 403 });
      }

      // User can only update specific fields
      const allowedFields: any = {};
      
      if (body.title !== undefined) {
        if (body.title.length > 200) {
          return NextResponse.json({ 
            error: "title cannot exceed 200 characters",
            code: "TITLE_TOO_LONG" 
          }, { status: 400 });
        }
        allowedFields.title = body.title.trim();
      }
      
      if (body.description !== undefined) {
        if (body.description.length > 2000) {
          return NextResponse.json({ 
            error: "description cannot exceed 2000 characters",
            code: "DESCRIPTION_TOO_LONG" 
          }, { status: 400 });
        }
        allowedFields.description = body.description.trim();
      }
      
      if (body.imageUrl !== undefined) {
        allowedFields.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
      }
      
      if (body.address !== undefined) {
        allowedFields.address = body.address ? body.address.trim() : null;
      }

      allowedFields.updatedAt = new Date().toISOString();

      const updated = await db.update(issues)
        .set(allowedFields)
        .where(eq(issues.id, parseInt(id)))
        .returning();

      return NextResponse.json(updated[0]);
    }

    // Admin update
    if (isAdminUpdate) {
      const allowedFields: any = {};

      if (body.status !== undefined) {
        const validStatuses = ['received', 'in_progress', 'resolved', 'rejected'];
        if (!validStatuses.includes(body.status)) {
          return NextResponse.json({ 
            error: "status must be one of: received, in_progress, resolved, rejected",
            code: "INVALID_STATUS" 
          }, { status: 400 });
        }
        allowedFields.status = body.status;
      }

      if (body.departmentId !== undefined) {
        if (body.departmentId !== null && isNaN(parseInt(body.departmentId.toString()))) {
          return NextResponse.json({ 
            error: "departmentId must be a valid number or null",
            code: "INVALID_DEPARTMENT_ID" 
          }, { status: 400 });
        }
        allowedFields.departmentId = body.departmentId ? parseInt(body.departmentId.toString()) : null;
      }

      if (body.assignedBy !== undefined) {
        if (body.assignedBy !== null && isNaN(parseInt(body.assignedBy.toString()))) {
          return NextResponse.json({ 
            error: "assignedBy must be a valid number or null",
            code: "INVALID_ASSIGNED_BY" 
          }, { status: 400 });
        }
        allowedFields.assignedBy = body.assignedBy ? parseInt(body.assignedBy.toString()) : null;
      }

      if (body.adminNotes !== undefined) {
        allowedFields.adminNotes = body.adminNotes ? body.adminNotes.trim() : null;
      }

      allowedFields.updatedAt = new Date().toISOString();

      const updated = await db.update(issues)
        .set(allowedFields)
        .where(eq(issues.id, parseInt(id)))
        .returning();

      return NextResponse.json(updated[0]);
    }

    // No valid fields to update
    return NextResponse.json({ 
      error: "No valid fields to update",
      code: "NO_FIELDS_TO_UPDATE" 
    }, { status: 400 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}