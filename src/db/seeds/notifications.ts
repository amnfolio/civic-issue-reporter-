import { db } from '@/db';
import { notifications } from '@/db/schema';

async function main() {
    const sampleNotifications = [
        // Issue 1: Pothole on Main Street - Full lifecycle (received -> in_progress -> resolved)
        {
            userId: 3,
            issueId: 1,
            message: "Your issue has been assigned to Public Works department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            userId: 3,
            issueId: 1,
            message: "Your issue 'Pothole on Main Street' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            userId: 3,
            issueId: 1,
            message: "Good news! Your issue 'Pothole on Main Street' has been resolved",
            type: 'issue_resolved',
            isRead: true,
            createdAt: new Date('2024-01-20T14:00:00').toISOString(),
        },

        // Issue 2: Broken streetlight - Full lifecycle
        {
            userId: 4,
            issueId: 2,
            message: "Your issue has been assigned to Electric Services department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-16T09:00:00').toISOString(),
        },
        {
            userId: 4,
            issueId: 2,
            message: "Your issue 'Broken streetlight near park' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-16T09:00:00').toISOString(),
        },
        {
            userId: 4,
            issueId: 2,
            message: "Good news! Your issue 'Broken streetlight near park' has been resolved",
            type: 'issue_resolved',
            isRead: false,
            createdAt: new Date('2024-01-22T16:30:00').toISOString(),
        },

        // Issue 3: Graffiti removal - Rejected
        {
            userId: 5,
            issueId: 3,
            message: "Your issue 'Graffiti on community center' has been rejected. Reason: Already scheduled for removal next week",
            type: 'issue_rejected',
            isRead: false,
            createdAt: new Date('2024-01-18T11:00:00').toISOString(),
        },

        // Issue 4: Illegal dumping - Full lifecycle
        {
            userId: 6,
            issueId: 4,
            message: "Your issue has been assigned to Sanitation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-19T08:30:00').toISOString(),
        },
        {
            userId: 6,
            issueId: 4,
            message: "Your issue 'Illegal dumping site' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-19T08:30:00').toISOString(),
        },
        {
            userId: 6,
            issueId: 4,
            message: "Good news! Your issue 'Illegal dumping site' has been resolved",
            type: 'issue_resolved',
            isRead: true,
            createdAt: new Date('2024-01-25T10:00:00').toISOString(),
        },

        // Issue 5: Park maintenance - In progress
        {
            userId: 7,
            issueId: 5,
            message: "Your issue has been assigned to Parks & Recreation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-20T13:00:00').toISOString(),
        },
        {
            userId: 7,
            issueId: 5,
            message: "Your issue 'Park bench needs repair' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-01-20T13:00:00').toISOString(),
        },

        // Issue 6: Drainage problem - Full lifecycle
        {
            userId: 8,
            issueId: 6,
            message: "Your issue has been assigned to Public Works department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-21T09:45:00').toISOString(),
        },
        {
            userId: 8,
            issueId: 6,
            message: "Your issue 'Clogged storm drain' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-21T09:45:00').toISOString(),
        },
        {
            userId: 8,
            issueId: 6,
            message: "Good news! Your issue 'Clogged storm drain' has been resolved",
            type: 'issue_resolved',
            isRead: true,
            createdAt: new Date('2024-01-26T15:20:00').toISOString(),
        },

        // Issue 7: Traffic signal - In progress
        {
            userId: 9,
            issueId: 7,
            message: "Your issue has been assigned to Traffic Management department",
            type: 'department_assigned',
            isRead: false,
            createdAt: new Date('2024-01-22T10:15:00').toISOString(),
        },
        {
            userId: 9,
            issueId: 7,
            message: "Your issue 'Malfunctioning traffic light' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-01-22T10:15:00').toISOString(),
        },

        // Issue 8: Sidewalk crack - Rejected
        {
            userId: 10,
            issueId: 8,
            message: "Your issue 'Cracked sidewalk' has been rejected. Reason: Does not meet severity threshold for repair",
            type: 'issue_rejected',
            isRead: true,
            createdAt: new Date('2024-01-23T14:30:00').toISOString(),
        },

        // Issue 9: Playground equipment - Full lifecycle
        {
            userId: 11,
            issueId: 9,
            message: "Your issue has been assigned to Parks & Recreation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-24T08:00:00').toISOString(),
        },
        {
            userId: 11,
            issueId: 9,
            message: "Your issue 'Broken playground swing' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-24T08:00:00').toISOString(),
        },
        {
            userId: 11,
            issueId: 9,
            message: "Good news! Your issue 'Broken playground swing' has been resolved",
            type: 'issue_resolved',
            isRead: false,
            createdAt: new Date('2024-01-28T11:45:00').toISOString(),
        },

        // Issue 10: Overgrown vegetation - In progress
        {
            userId: 12,
            issueId: 10,
            message: "Your issue has been assigned to Parks & Recreation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-25T12:30:00').toISOString(),
        },
        {
            userId: 12,
            issueId: 10,
            message: "Your issue 'Overgrown vegetation blocking view' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-01-25T12:30:00').toISOString(),
        },

        // Issue 11: Water leak - Full lifecycle
        {
            userId: 3,
            issueId: 11,
            message: "Your issue has been assigned to Water & Sewer department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-26T07:00:00').toISOString(),
        },
        {
            userId: 3,
            issueId: 11,
            message: "Your issue 'Water leak on residential street' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-26T07:00:00').toISOString(),
        },
        {
            userId: 3,
            issueId: 11,
            message: "Good news! Your issue 'Water leak on residential street' has been resolved",
            type: 'issue_resolved',
            isRead: true,
            createdAt: new Date('2024-01-29T16:00:00').toISOString(),
        },

        // Issue 12: Abandoned vehicle - In progress
        {
            userId: 4,
            issueId: 12,
            message: "Your issue has been assigned to Police Department department",
            type: 'department_assigned',
            isRead: false,
            createdAt: new Date('2024-01-27T09:30:00').toISOString(),
        },
        {
            userId: 4,
            issueId: 12,
            message: "Your issue 'Abandoned vehicle' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-01-27T09:30:00').toISOString(),
        },

        // Issue 13: Street sign damage - Resolved
        {
            userId: 5,
            issueId: 13,
            message: "Your issue has been assigned to Traffic Management department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-28T10:00:00').toISOString(),
        },
        {
            userId: 5,
            issueId: 13,
            message: "Your issue 'Damaged street sign' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-28T10:00:00').toISOString(),
        },
        {
            userId: 5,
            issueId: 13,
            message: "Good news! Your issue 'Damaged street sign' has been resolved",
            type: 'issue_resolved',
            isRead: false,
            createdAt: new Date('2024-02-01T14:30:00').toISOString(),
        },

        // Issue 14: Noise complaint - Rejected
        {
            userId: 6,
            issueId: 14,
            message: "Your issue 'Construction noise complaint' has been rejected. Reason: Work permitted during daytime hours",
            type: 'issue_rejected',
            isRead: true,
            createdAt: new Date('2024-01-29T15:00:00').toISOString(),
        },

        // Issue 15: Dead tree - In progress
        {
            userId: 7,
            issueId: 15,
            message: "Your issue has been assigned to Parks & Recreation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-30T08:45:00').toISOString(),
        },
        {
            userId: 7,
            issueId: 15,
            message: "Your issue 'Dead tree needs removal' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-01-30T08:45:00').toISOString(),
        },

        // Issue 16: Manhole cover - Resolved
        {
            userId: 8,
            issueId: 16,
            message: "Your issue has been assigned to Public Works department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-01-31T07:30:00').toISOString(),
        },
        {
            userId: 8,
            issueId: 16,
            message: "Your issue 'Loose manhole cover' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-01-31T07:30:00').toISOString(),
        },
        {
            userId: 8,
            issueId: 16,
            message: "Good news! Your issue 'Loose manhole cover' has been resolved",
            type: 'issue_resolved',
            isRead: true,
            createdAt: new Date('2024-02-02T12:00:00').toISOString(),
        },

        // Issue 17: Streetlight out - In progress
        {
            userId: 9,
            issueId: 17,
            message: "Your issue has been assigned to Electric Services department",
            type: 'department_assigned',
            isRead: false,
            createdAt: new Date('2024-02-01T09:00:00').toISOString(),
        },
        {
            userId: 9,
            issueId: 17,
            message: "Your issue 'Multiple streetlights out' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-02-01T09:00:00').toISOString(),
        },

        // Issue 18: Graffiti - Resolved
        {
            userId: 10,
            issueId: 18,
            message: "Your issue has been assigned to Sanitation department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-02-02T10:15:00').toISOString(),
        },
        {
            userId: 10,
            issueId: 18,
            message: "Your issue 'Graffiti on bus stop' status changed to in_progress",
            type: 'status_change',
            isRead: true,
            createdAt: new Date('2024-02-02T10:15:00').toISOString(),
        },
        {
            userId: 10,
            issueId: 18,
            message: "Good news! Your issue 'Graffiti on bus stop' has been resolved",
            type: 'issue_resolved',
            isRead: false,
            createdAt: new Date('2024-02-05T13:30:00').toISOString(),
        },

        // Issue 19: Drainage issue - In progress
        {
            userId: 11,
            issueId: 19,
            message: "Your issue has been assigned to Public Works department",
            type: 'department_assigned',
            isRead: true,
            createdAt: new Date('2024-02-03T11:00:00').toISOString(),
        },
        {
            userId: 11,
            issueId: 19,
            message: "Your issue 'Poor drainage causing flooding' status changed to in_progress",
            type: 'status_change',
            isRead: false,
            createdAt: new Date('2024-02-03T11:00:00').toISOString(),
        },

        // Issue 20: Broken curb - Rejected
        {
            userId: 12,
            issueId: 20,
            message: "Your issue 'Broken curb' has been rejected. Reason: Private property responsibility",
            type: 'issue_rejected',
            isRead: false,
            createdAt: new Date('2024-02-04T14:00:00').toISOString(),
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log('✅ Notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});