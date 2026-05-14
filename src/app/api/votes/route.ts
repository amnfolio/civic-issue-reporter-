import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { votes, issues } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, userId } = body;

    // Validate required fields
    if (!issueId || !userId) {
      return NextResponse.json(
        { 
          error: 'issueId and userId are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate that they are valid integers
    const parsedIssueId = parseInt(issueId);
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedIssueId) || isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'issueId and userId must be valid integers',
          code: 'INVALID_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check if issue exists
    const existingIssue = await db.select()
      .from(issues)
      .where(eq(issues.id, parsedIssueId))
      .limit(1);

    if (existingIssue.length === 0) {
      return NextResponse.json(
        { 
          error: 'Issue not found',
          code: 'ISSUE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if user already voted for this issue
    const existingVote = await db.select()
      .from(votes)
      .where(
        and(
          eq(votes.issueId, parsedIssueId),
          eq(votes.userId, parsedUserId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      return NextResponse.json(
        { 
          error: 'You have already voted for this issue',
          code: 'ALREADY_VOTED'
        },
        { status: 400 }
      );
    }

    // Insert new vote record
    const newVote = await db.insert(votes)
      .values({
        issueId: parsedIssueId,
        userId: parsedUserId,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Increment voteCount in issues table
    const updatedIssue = await db.update(issues)
      .set({
        voteCount: existingIssue[0].voteCount + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(issues.id, parsedIssueId))
      .returning();

    return NextResponse.json(
      {
        message: 'Vote recorded successfully',
        voteCount: updatedIssue[0].voteCount,
        vote: newVote[0]
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST error:', error);
    
    // Handle foreign key constraint errors
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json(
        { 
          error: 'Invalid userId or issueId',
          code: 'FOREIGN_KEY_CONSTRAINT'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const issueId = searchParams.get('issueId');
    const userId = searchParams.get('userId');

    // Validate required parameters
    if (!issueId || !userId) {
      return NextResponse.json(
        { 
          error: 'issueId and userId are required',
          code: 'MISSING_REQUIRED_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Validate that they are valid integers
    const parsedIssueId = parseInt(issueId);
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedIssueId) || isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'issueId and userId must be valid integers',
          code: 'INVALID_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check if vote exists
    const existingVote = await db.select()
      .from(votes)
      .where(
        and(
          eq(votes.issueId, parsedIssueId),
          eq(votes.userId, parsedUserId)
        )
      )
      .limit(1);

    if (existingVote.length === 0) {
      return NextResponse.json(
        { 
          error: 'Vote not found',
          code: 'VOTE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get current issue to check voteCount
    const currentIssue = await db.select()
      .from(issues)
      .where(eq(issues.id, parsedIssueId))
      .limit(1);

    if (currentIssue.length === 0) {
      return NextResponse.json(
        { 
          error: 'Issue not found',
          code: 'ISSUE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete the vote record
    const deletedVote = await db.delete(votes)
      .where(
        and(
          eq(votes.issueId, parsedIssueId),
          eq(votes.userId, parsedUserId)
        )
      )
      .returning();

    // Decrement voteCount in issues table, ensure it doesn't go below 0
    const newVoteCount = Math.max(0, currentIssue[0].voteCount - 1);
    const updatedIssue = await db.update(issues)
      .set({
        voteCount: newVoteCount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(issues.id, parsedIssueId))
      .returning();

    return NextResponse.json(
      {
        message: 'Vote removed successfully',
        voteCount: updatedIssue[0].voteCount,
        deletedVote: deletedVote[0]
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const issueId = searchParams.get('issueId') || searchParams.get('issue_id');
    const userId = searchParams.get('userId') || searchParams.get('user_id');

    // Validate required parameters
    if (!issueId || !userId) {
      return NextResponse.json(
        { 
          error: 'issueId (or issue_id) and userId (or user_id) are required',
          code: 'MISSING_REQUIRED_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Validate that they are valid integers
    const parsedIssueId = parseInt(issueId);
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedIssueId) || isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'issueId and userId must be valid integers',
          code: 'INVALID_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check if issue exists
    const existingIssue = await db.select()
      .from(issues)
      .where(eq(issues.id, parsedIssueId))
      .limit(1);

    if (existingIssue.length === 0) {
      return NextResponse.json(
        { 
          error: 'Issue not found',
          code: 'ISSUE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if user has voted for this issue
    const existingVote = await db.select()
      .from(votes)
      .where(
        and(
          eq(votes.issueId, parsedIssueId),
          eq(votes.userId, parsedUserId)
        )
      )
      .limit(1);

    return NextResponse.json({
      hasVoted: existingVote.length > 0,
      voteCount: existingIssue[0].voteCount
    });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}