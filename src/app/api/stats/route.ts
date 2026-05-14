import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { issues, departments, votes } from '@/db/schema';
import { eq, desc, count, sum, sql, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 1. Total issues count
    const totalIssuesResult = await db.select({ count: count() })
      .from(issues);
    const totalIssues = totalIssuesResult[0]?.count || 0;

    // 2. Issues by status
    const statusCountsResult = await db.select({
      status: issues.status,
      count: count()
    })
      .from(issues)
      .groupBy(issues.status);

    const issuesByStatus = {
      received: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0
    };

    statusCountsResult.forEach(row => {
      if (row.status in issuesByStatus) {
        issuesByStatus[row.status as keyof typeof issuesByStatus] = row.count;
      }
    });

    // 3. Issues by category
    const categoryCountsResult = await db.select({
      category: issues.category,
      count: count()
    })
      .from(issues)
      .groupBy(issues.category);

    const issuesByCategory: { [key: string]: number } = {};
    categoryCountsResult.forEach(row => {
      issuesByCategory[row.category] = row.count;
    });

    // 4. Total votes
    const totalVotesResult = await db.select({ count: count() })
      .from(votes);
    const totalVotes = totalVotesResult[0]?.count || 0;

    // 5. Most voted issue
    const mostVotedResult = await db.select({
      id: issues.id,
      title: issues.title,
      voteCount: issues.voteCount
    })
      .from(issues)
      .orderBy(desc(issues.voteCount))
      .limit(1);

    const mostVotedIssue = mostVotedResult.length > 0 
      ? mostVotedResult[0] 
      : null;

    // 6. Recent issues (last 5)
    const recentIssuesResult = await db.select({
      id: issues.id,
      title: issues.title,
      status: issues.status,
      createdAt: issues.createdAt
    })
      .from(issues)
      .orderBy(desc(issues.createdAt))
      .limit(5);

    const recentIssues = recentIssuesResult;

    // 7. Resolution rate
    const resolvedCount = issuesByStatus.resolved;
    const resolutionRate = totalIssues > 0 
      ? Math.round((resolvedCount / totalIssues) * 100 * 100) / 100 
      : 0;

    // 8. Average votes per issue
    const averageVotesPerIssue = totalIssues > 0 
      ? Math.round((totalVotes / totalIssues) * 100) / 100 
      : 0;

    // 9. Issues by department
    const departmentCountsResult = await db.select({
      departmentId: issues.departmentId,
      departmentName: departments.name,
      count: count()
    })
      .from(issues)
      .leftJoin(departments, eq(issues.departmentId, departments.id))
      .groupBy(issues.departmentId, departments.name);

    const issuesByDepartment: { [key: string]: number } = {};
    departmentCountsResult.forEach(row => {
      const deptName = row.departmentName || 'Unassigned';
      issuesByDepartment[deptName] = row.count;
    });

    // 10. Issues created in last 7 days and 30 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const issuesLast7DaysResult = await db.select({ count: count() })
      .from(issues)
      .where(gte(issues.createdAt, sevenDaysAgo));
    const issuesLast7Days = issuesLast7DaysResult[0]?.count || 0;

    const issuesLast30DaysResult = await db.select({ count: count() })
      .from(issues)
      .where(gte(issues.createdAt, thirtyDaysAgo));
    const issuesLast30Days = issuesLast30DaysResult[0]?.count || 0;

    // Return comprehensive statistics
    return NextResponse.json({
      totalIssues,
      issuesByStatus,
      issuesByCategory,
      totalVotes,
      mostVotedIssue,
      recentIssues,
      resolutionRate,
      averageVotesPerIssue,
      issuesByDepartment,
      issuesLast7Days,
      issuesLast30Days
    }, { status: 200 });

  } catch (error) {
    console.error('GET statistics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch statistics: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}