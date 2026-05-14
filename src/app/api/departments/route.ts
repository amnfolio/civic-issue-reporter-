import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { departments, issues } from '@/db/schema';
import { eq, sql, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch all departments with issue count, sorted by name
    const departmentList = await db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        createdAt: departments.createdAt,
        issueCount: sql<number>`count(${issues.id})`.as('issue_count'),
      })
      .from(departments)
      .leftJoin(issues, eq(departments.id, issues.departmentId))
      .groupBy(departments.id)
      .orderBy(asc(departments.name));

    return NextResponse.json(departmentList, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Department name is required and cannot be empty', code: 'MISSING_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : null;

    // Check for duplicate department name
    const existingDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.name, sanitizedName))
      .limit(1);

    if (existingDepartment.length > 0) {
      return NextResponse.json(
        { error: 'A department with this name already exists', code: 'DUPLICATE_DEPARTMENT' },
        { status: 400 }
      );
    }

    // Create new department
    const newDepartment = await db
      .insert(departments)
      .values({
        name: sanitizedName,
        description: sanitizedDescription,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newDepartment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}