import { db } from '@/db';
import { votes } from '@/db/schema';

async function main() {
    const sampleVotes = [
        // Popular issues (15-25 votes each) - Issues 1, 5, 8, 12, 15, 18, 22
        // Issue 1 (23 votes)
        { issueId: 1, userId: 3, createdAt: new Date('2024-01-16T10:30:00').toISOString() },
        { issueId: 1, userId: 4, createdAt: new Date('2024-01-16T11:15:00').toISOString() },
        { issueId: 1, userId: 5, createdAt: new Date('2024-01-16T14:20:00').toISOString() },
        { issueId: 1, userId: 6, createdAt: new Date('2024-01-17T09:00:00').toISOString() },
        { issueId: 1, userId: 7, createdAt: new Date('2024-01-17T13:45:00').toISOString() },
        { issueId: 1, userId: 8, createdAt: new Date('2024-01-18T08:30:00').toISOString() },
        { issueId: 1, userId: 9, createdAt: new Date('2024-01-18T15:10:00').toISOString() },
        { issueId: 1, userId: 10, createdAt: new Date('2024-01-19T10:20:00').toISOString() },
        { issueId: 1, userId: 11, createdAt: new Date('2024-01-19T16:00:00').toISOString() },
        { issueId: 1, userId: 12, createdAt: new Date('2024-01-20T09:30:00').toISOString() },
        { issueId: 1, userId: 3, createdAt: new Date('2024-01-21T11:00:00').toISOString() },
        { issueId: 1, userId: 4, createdAt: new Date('2024-01-22T14:15:00').toISOString() },
        { issueId: 1, userId: 5, createdAt: new Date('2024-01-23T10:45:00').toISOString() },
        { issueId: 1, userId: 6, createdAt: new Date('2024-01-24T13:20:00').toISOString() },
        { issueId: 1, userId: 7, createdAt: new Date('2024-01-25T09:50:00').toISOString() },
        { issueId: 1, userId: 8, createdAt: new Date('2024-01-26T15:30:00').toISOString() },
        { issueId: 1, userId: 9, createdAt: new Date('2024-01-27T11:40:00').toISOString() },
        { issueId: 1, userId: 10, createdAt: new Date('2024-01-28T14:00:00').toISOString() },
        { issueId: 1, userId: 11, createdAt: new Date('2024-01-29T10:15:00').toISOString() },
        { issueId: 1, userId: 12, createdAt: new Date('2024-01-30T13:45:00').toISOString() },
        { issueId: 1, userId: 3, createdAt: new Date('2024-01-31T09:20:00').toISOString() },
        { issueId: 1, userId: 4, createdAt: new Date('2024-02-01T15:10:00').toISOString() },
        { issueId: 1, userId: 5, createdAt: new Date('2024-02-02T11:30:00').toISOString() },

        // Issue 5 (20 votes)
        { issueId: 5, userId: 3, createdAt: new Date('2024-01-20T10:00:00').toISOString() },
        { issueId: 5, userId: 4, createdAt: new Date('2024-01-20T11:30:00').toISOString() },
        { issueId: 5, userId: 5, createdAt: new Date('2024-01-20T14:15:00').toISOString() },
        { issueId: 5, userId: 6, createdAt: new Date('2024-01-21T09:45:00').toISOString() },
        { issueId: 5, userId: 7, createdAt: new Date('2024-01-21T13:20:00').toISOString() },
        { issueId: 5, userId: 8, createdAt: new Date('2024-01-22T10:30:00').toISOString() },
        { issueId: 5, userId: 9, createdAt: new Date('2024-01-22T15:00:00').toISOString() },
        { issueId: 5, userId: 10, createdAt: new Date('2024-01-23T11:15:00').toISOString() },
        { issueId: 5, userId: 11, createdAt: new Date('2024-01-23T14:45:00').toISOString() },
        { issueId: 5, userId: 12, createdAt: new Date('2024-01-24T09:30:00').toISOString() },
        { issueId: 5, userId: 3, createdAt: new Date('2024-01-25T13:00:00').toISOString() },
        { issueId: 5, userId: 4, createdAt: new Date('2024-01-26T10:20:00').toISOString() },
        { issueId: 5, userId: 5, createdAt: new Date('2024-01-27T14:30:00').toISOString() },
        { issueId: 5, userId: 6, createdAt: new Date('2024-01-28T11:00:00').toISOString() },
        { issueId: 5, userId: 7, createdAt: new Date('2024-01-29T15:15:00').toISOString() },
        { issueId: 5, userId: 8, createdAt: new Date('2024-01-30T10:45:00').toISOString() },
        { issueId: 5, userId: 9, createdAt: new Date('2024-01-31T13:30:00').toISOString() },
        { issueId: 5, userId: 10, createdAt: new Date('2024-02-01T09:50:00').toISOString() },
        { issueId: 5, userId: 11, createdAt: new Date('2024-02-02T14:10:00').toISOString() },
        { issueId: 5, userId: 12, createdAt: new Date('2024-02-03T11:25:00').toISOString() },

        // Issue 8 (18 votes)
        { issueId: 8, userId: 3, createdAt: new Date('2024-01-23T09:00:00').toISOString() },
        { issueId: 8, userId: 4, createdAt: new Date('2024-01-23T11:45:00').toISOString() },
        { issueId: 8, userId: 5, createdAt: new Date('2024-01-23T14:30:00').toISOString() },
        { issueId: 8, userId: 6, createdAt: new Date('2024-01-24T10:15:00').toISOString() },
        { issueId: 8, userId: 7, createdAt: new Date('2024-01-24T13:00:00').toISOString() },
        { issueId: 8, userId: 8, createdAt: new Date('2024-01-25T09:30:00').toISOString() },
        { issueId: 8, userId: 9, createdAt: new Date('2024-01-25T15:20:00').toISOString() },
        { issueId: 8, userId: 10, createdAt: new Date('2024-01-26T11:10:00').toISOString() },
        { issueId: 8, userId: 11, createdAt: new Date('2024-01-26T14:45:00').toISOString() },
        { issueId: 8, userId: 12, createdAt: new Date('2024-01-27T10:00:00').toISOString() },
        { issueId: 8, userId: 3, createdAt: new Date('2024-01-28T13:15:00').toISOString() },
        { issueId: 8, userId: 4, createdAt: new Date('2024-01-29T09:45:00').toISOString() },
        { issueId: 8, userId: 5, createdAt: new Date('2024-01-30T14:20:00').toISOString() },
        { issueId: 8, userId: 6, createdAt: new Date('2024-01-31T11:30:00').toISOString() },
        { issueId: 8, userId: 7, createdAt: new Date('2024-02-01T15:00:00').toISOString() },
        { issueId: 8, userId: 8, createdAt: new Date('2024-02-02T10:40:00').toISOString() },
        { issueId: 8, userId: 9, createdAt: new Date('2024-02-03T13:25:00').toISOString() },
        { issueId: 8, userId: 10, createdAt: new Date('2024-02-04T09:55:00').toISOString() },

        // Issue 12 (17 votes)
        { issueId: 12, userId: 3, createdAt: new Date('2024-01-27T10:30:00').toISOString() },
        { issueId: 12, userId: 4, createdAt: new Date('2024-01-27T13:15:00').toISOString() },
        { issueId: 12, userId: 5, createdAt: new Date('2024-01-27T15:45:00').toISOString() },
        { issueId: 12, userId: 6, createdAt: new Date('2024-01-28T09:20:00').toISOString() },
        { issueId: 12, userId: 7, createdAt: new Date('2024-01-28T12:00:00').toISOString() },
        { issueId: 12, userId: 8, createdAt: new Date('2024-01-29T10:40:00').toISOString() },
        { issueId: 12, userId: 9, createdAt: new Date('2024-01-29T14:30:00').toISOString() },
        { issueId: 12, userId: 10, createdAt: new Date('2024-01-30T11:15:00').toISOString() },
        { issueId: 12, userId: 11, createdAt: new Date('2024-01-30T15:00:00').toISOString() },
        { issueId: 12, userId: 12, createdAt: new Date('2024-01-31T09:50:00').toISOString() },
        { issueId: 12, userId: 3, createdAt: new Date('2024-02-01T13:20:00').toISOString() },
        { issueId: 12, userId: 4, createdAt: new Date('2024-02-02T10:10:00').toISOString() },
        { issueId: 12, userId: 5, createdAt: new Date('2024-02-03T14:45:00').toISOString() },
        { issueId: 12, userId: 6, createdAt: new Date('2024-02-04T11:30:00').toISOString() },
        { issueId: 12, userId: 7, createdAt: new Date('2024-02-05T15:15:00').toISOString() },
        { issueId: 12, userId: 8, createdAt: new Date('2024-02-06T10:00:00').toISOString() },
        { issueId: 12, userId: 9, createdAt: new Date('2024-02-07T13:40:00').toISOString() },

        // Issue 15 (19 votes)
        { issueId: 15, userId: 3, createdAt: new Date('2024-01-30T09:00:00').toISOString() },
        { issueId: 15, userId: 4, createdAt: new Date('2024-01-30T11:30:00').toISOString() },
        { issueId: 15, userId: 5, createdAt: new Date('2024-01-30T14:15:00').toISOString() },
        { issueId: 15, userId: 6, createdAt: new Date('2024-01-31T10:00:00').toISOString() },
        { issueId: 15, userId: 7, createdAt: new Date('2024-01-31T13:45:00').toISOString() },
        { issueId: 15, userId: 8, createdAt: new Date('2024-02-01T09:30:00').toISOString() },
        { issueId: 15, userId: 9, createdAt: new Date('2024-02-01T15:10:00').toISOString() },
        { issueId: 15, userId: 10, createdAt: new Date('2024-02-02T11:20:00').toISOString() },
        { issueId: 15, userId: 11, createdAt: new Date('2024-02-02T14:50:00').toISOString() },
        { issueId: 15, userId: 12, createdAt: new Date('2024-02-03T10:15:00').toISOString() },
        { issueId: 15, userId: 3, createdAt: new Date('2024-02-04T13:30:00').toISOString() },
        { issueId: 15, userId: 4, createdAt: new Date('2024-02-05T09:45:00').toISOString() },
        { issueId: 15, userId: 5, createdAt: new Date('2024-02-06T14:00:00').toISOString() },
        { issueId: 15, userId: 6, createdAt: new Date('2024-02-07T11:25:00').toISOString() },
        { issueId: 15, userId: 7, createdAt: new Date('2024-02-08T15:40:00').toISOString() },
        { issueId: 15, userId: 8, createdAt: new Date('2024-02-09T10:30:00').toISOString() },
        { issueId: 15, userId: 9, createdAt: new Date('2024-02-10T13:55:00').toISOString() },
        { issueId: 15, userId: 10, createdAt: new Date('2024-02-11T09:10:00').toISOString() },
        { issueId: 15, userId: 11, createdAt: new Date('2024-02-12T14:20:00').toISOString() },

        // Issue 18 (16 votes)
        { issueId: 18, userId: 3, createdAt: new Date('2024-02-02T10:00:00').toISOString() },
        { issueId: 18, userId: 4, createdAt: new Date('2024-02-02T12:30:00').toISOString() },
        { issueId: 18, userId: 5, createdAt: new Date('2024-02-02T15:15:00').toISOString() },
        { issueId: 18, userId: 6, createdAt: new Date('2024-02-03T09:45:00').toISOString() },
        { issueId: 18, userId: 7, createdAt: new Date('2024-02-03T13:20:00').toISOString() },
        { issueId: 18, userId: 8, createdAt: new Date('2024-02-04T10:30:00').toISOString() },
        { issueId: 18, userId: 9, createdAt: new Date('2024-02-04T14:50:00').toISOString() },
        { issueId: 18, userId: 10, createdAt: new Date('2024-02-05T11:10:00').toISOString() },
        { issueId: 18, userId: 11, createdAt: new Date('2024-02-05T15:35:00').toISOString() },
        { issueId: 18, userId: 12, createdAt: new Date('2024-02-06T09:20:00').toISOString() },
        { issueId: 18, userId: 3, createdAt: new Date('2024-02-07T13:00:00').toISOString() },
        { issueId: 18, userId: 4, createdAt: new Date('2024-02-08T10:40:00').toISOString() },
        { issueId: 18, userId: 5, createdAt: new Date('2024-02-09T14:25:00').toISOString() },
        { issueId: 18, userId: 6, createdAt: new Date('2024-02-10T11:15:00').toISOString() },
        { issueId: 18, userId: 7, createdAt: new Date('2024-02-11T15:00:00').toISOString() },
        { issueId: 18, userId: 8, createdAt: new Date('2024-02-12T10:45:00').toISOString() },

        // Issue 22 (15 votes)
        { issueId: 22, userId: 3, createdAt: new Date('2024-02-06T09:30:00').toISOString() },
        { issueId: 22, userId: 4, createdAt: new Date('2024-02-06T12:00:00').toISOString() },
        { issueId: 22, userId: 5, createdAt: new Date('2024-02-06T14:45:00').toISOString() },
        { issueId: 22, userId: 6, createdAt: new Date('2024-02-07T10:15:00').toISOString() },
        { issueId: 22, userId: 7, createdAt: new Date('2024-02-07T13:30:00').toISOString() },
        { issueId: 22, userId: 8, createdAt: new Date('2024-02-08T09:50:00').toISOString() },
        { issueId: 22, userId: 9, createdAt: new Date('2024-02-08T15:20:00').toISOString() },
        { issueId: 22, userId: 10, createdAt: new Date('2024-02-09T11:00:00').toISOString() },
        { issueId: 22, userId: 11, createdAt: new Date('2024-02-09T14:40:00').toISOString() },
        { issueId: 22, userId: 12, createdAt: new Date('2024-02-10T10:25:00').toISOString() },
        { issueId: 22, userId: 3, createdAt: new Date('2024-02-11T13:10:00').toISOString() },
        { issueId: 22, userId: 4, createdAt: new Date('2024-02-12T09:35:00').toISOString() },
        { issueId: 22, userId: 5, createdAt: new Date('2024-02-13T14:15:00').toISOString() },
        { issueId: 22, userId: 6, createdAt: new Date('2024-02-14T11:50:00').toISOString() },
        { issueId: 22, userId: 7, createdAt: new Date('2024-02-15T15:30:00').toISOString() },

        // Moderately voted issues (5-12 votes each)
        // Issue 2 (10 votes)
        { issueId: 2, userId: 3, createdAt: new Date('2024-01-17T10:00:00').toISOString() },
        { issueId: 2, userId: 4, createdAt: new Date('2024-01-17T13:30:00').toISOString() },
        { issueId: 2, userId: 5, createdAt: new Date('2024-01-18T09:15:00').toISOString() },
        { issueId: 2, userId: 6, createdAt: new Date('2024-01-18T14:45:00').toISOString() },
        { issueId: 2, userId: 7, createdAt: new Date('2024-01-19T11:20:00').toISOString() },
        { issueId: 2, userId: 8, createdAt: new Date('2024-01-19T15:00:00').toISOString() },
        { issueId: 2, userId: 9, createdAt: new Date('2024-01-20T10:30:00').toISOString() },
        { issueId: 2, userId: 10, createdAt: new Date('2024-01-20T14:10:00').toISOString() },
        { issueId: 2, userId: 11, createdAt: new Date('2024-01-21T09:45:00').toISOString() },
        { issueId: 2, userId: 12, createdAt: new Date('2024-01-21T13:25:00').toISOString() },

        // Issue 3 (8 votes)
        { issueId: 3, userId: 3, createdAt: new Date('2024-01-18T11:00:00').toISOString() },
        { issueId: 3, userId: 4, createdAt: new Date('2024-01-18T14:20:00').toISOString() },
        { issueId: 3, userId: 5, createdAt: new Date('2024-01-19T10:15:00').toISOString() },
        { issueId: 3, userId: 6, createdAt: new Date('2024-01-19T15:30:00').toISOString() },
        { issueId: 3, userId: 7, createdAt: new Date('2024-01-20T09:40:00').toISOString() },
        { issueId: 3, userId: 8, createdAt: new Date('2024-01-20T13:50:00').toISOString() },
        { issueId: 3, userId: 9, createdAt: new Date('2024-01-21T11:25:00').toISOString() },
        { issueId: 3, userId: 10, createdAt: new Date('2024-01-21T15:05:00').toISOString() },

        // Issue 4 (11 votes)
        { issueId: 4, userId: 3, createdAt: new Date('2024-01-19T09:30:00').toISOString() },
        { issueId: 4, userId: 4, createdAt: new Date('2024-01-19T12:45:00').toISOString() },
        { issueId: 4, userId: 5, createdAt: new Date('2024-01-19T15:20:00').toISOString() },
        { issueId: 4, userId: 6, createdAt: new Date('2024-01-20T10:00:00').toISOString() },
        { issueId: 4, userId: 7, createdAt: new Date('2024-01-20T13:35:00').toISOString() },
        { issueId: 4, userId: 8, createdAt: new Date('2024-01-21T09:50:00').toISOString() },
        { issueId: 4, userId: 9, createdAt: new Date('2024-01-21T14:15:00').toISOString() },
        { issueId: 4, userId: 10, createdAt: new Date('2024-01-22T11:30:00').toISOString() },
        { issueId: 4, userId: 11, createdAt: new Date('2024-01-22T15:45:00').toISOString() },
        { issueId: 4, userId: 12, createdAt: new Date('2024-01-23T10:20:00').toISOString() },
        { issueId: 4, userId: 3, createdAt: new Date('2024-01-23T14:00:00').toISOString() },

        // Issue 6 (9 votes)
        { issueId: 6, userId: 3, createdAt: new Date('2024-01-21T10:15:00').toISOString() },
        { issueId: 6, userId: 4, createdAt: new Date('2024-01-21T13:40:00').toISOString() },
        { issueId: 6, userId: 5, createdAt: new Date('2024-01-22T09:25:00').toISOString() },
        { issueId: 6, userId: 6, createdAt: new Date('2024-01-22T14:50:00').toISOString() },
        { issueId: 6, userId: 7, createdAt: new Date('2024-01-23T11:10:00').toISOString() },
        { issueId: 6, userId: 8, createdAt: new Date('2024-01-23T15:30:00').toISOString() },
        { issueId: 6, userId: 9, createdAt: new Date('2024-01-24T10:45:00').toISOString() },
        { issueId: 6, userId: 10, createdAt: new Date('2024-01-24T14:20:00').toISOString() },
        { issueId: 6, userId: 11, createdAt: new Date('2024-01-25T09:55:00').toISOString() },

        // Issue 7 (7 votes)
        { issueId: 7, userId: 3, createdAt: new Date('2024-01-22T11:00:00').toISOString() },
        { issueId: 7, userId: 4, createdAt: new Date('2024-01-22T14:30:00').toISOString() },
        { issueId: 7, userId: 5, createdAt: new Date('2024-01-23T10:15:00').toISOString() },
        { issueId: 7, userId: 6, createdAt: new Date('2024-01-23T13:45:00').toISOString() },
        { issueId: 7, userId: 7, createdAt: new Date('2024-01-24T09:30:00').toISOString() },
        { issueId: 7, userId: 8, createdAt: new Date('2024-01-24T15:00:00').toISOString() },
        { issueId: 7, userId: 9, createdAt: new Date('2024-01-25T11:20:00').toISOString() },

        // Issue 9 (12 votes)
        { issueId: 9, userId: 3, createdAt: new Date('2024-01-24T09:00:00').toISOString() },
        { issueId: 9, userId: 4, createdAt: new Date('2024-01-24T12:30:00').toISOString() },
        { issueId: 9, userId: 5, createdAt: new Date('2024-01-24T15:45:00').toISOString() },
        { issueId: 9, userId: 6, createdAt: new Date('2024-01-25T10:20:00').toISOString() },
        { issueId: 9, userId: 7, createdAt: new Date('2024-01-25T13:50:00').toISOString() },
        { issueId: 9, userId: 8, createdAt: new Date('2024-01-26T09:35:00').toISOString() },
        { issueId: 9, userId: 9, createdAt: new Date('2024-01-26T14:10:00').toISOString() },
        { issueId: 9, userId: 10, createdAt: new Date('2024-01-27T11:00:00').toISOString() },
        { issueId: 9, userId: 11, createdAt: new Date('2024-01-27T15:25:00').toISOString() },
        { issueId: 9, userId: 12, createdAt: new Date('2024-01-28T10:40:00').toISOString() },
        { issueId: 9, userId: 3, createdAt: new Date('2024-01-28T14:15:00').toISOString() },
        { issueId: 9, userId: 4, createdAt: new Date('2024-01-29T09:50:00').toISOString() },

        // Issue 10 (6 votes)
        { issueId: 10, userId: 3, createdAt: new Date('2024-01-25T10:30:00').toISOString() },
        { issueId: 10, userId: 4, createdAt: new Date('2024-01-25T13:45:00').toISOString() },
        { issueId: 10, userId: 5, createdAt: new Date('2024-01-26T09:20:00').toISOString() },
        { issueId: 10, userId: 6, createdAt: new Date('2024-01-26T14:35:00').toISOString() },
        { issueId: 10, userId: 7, createdAt: new Date('2024-01-27T11:10:00').toISOString() },
        { issueId: 10, userId: 8, createdAt: new Date('2024-01-27T15:40:00').toISOString() },

        // Issue 11 (8 votes)
        { issueId: 11, userId: 3, createdAt: new Date('2024-01-26T09:15:00').toISOString() },
        { issueId: 11, userId: 4, createdAt: new Date('2024-01-26T12:40:00').toISOString() },
        { issueId: 11, userId: 5, createdAt: new Date('2024-01-26T15:50:00').toISOString() },
        { issueId: 11, userId: 6, createdAt: new Date('2024-01-27T10:25:00').toISOString() },
        { issueId: 11, userId: 7, createdAt: new Date('2024-01-27T14:00:00').toISOString() },
        { issueId: 11, userId: 8, createdAt: new Date('2024-01-28T09:35:00').toISOString() },
        { issueId: 11, userId: 9, createdAt: new Date('2024-01-28T13:45:00').toISOString() },
        { issueId: 11, userId: 10, createdAt: new Date('2024-01-29T11:20:00').toISOString() },

        // Issue 13 (10 votes)
        { issueId: 13, userId: 3, createdAt: new Date('2024-01-28T10:00:00').toISOString() },
        { issueId: 13, userId: 4, createdAt: new Date('2024-01-28T13:30:00').toISOString() },
        { issueId: 13, userId: 5, createdAt: new Date('2024-01-29T09:45:00').toISOString() },
        { issueId: 13, userId: 6, createdAt: new Date('2024-01-29T14:15:00').toISOString() },
        { issueId: 13, userId: 7, createdAt: new Date('2024-01-30T10:50:00').toISOString() },
        { issueId: 13, userId: 8, createdAt: new Date('2024-01-30T15:20:00').toISOString() },
        { issueId: 13, userId: 9, createdAt: new Date('2024-01-31T11:00:00').toISOString() },
        { issueId: 13, userId: 10, createdAt: new Date('2024-01-31T14:40:00').toISOString() },
        { issueId: 13, userId: 11, createdAt: new Date('2024-02-01T09:25:00').toISOString() },
        { issueId: 13, userId: 12, createdAt: new Date('2024-02-01T13:55:00').toISOString() },

        // Issue 14 (7 votes)
        { issueId: 14, userId: 3, createdAt: new Date('2024-01-29T11:15:00').toISOString() },
        { issueId: 14, userId: 4, createdAt: new Date('2024-01-29T14:40:00').toISOString() },
        { issueId: 14, userId: 5, createdAt: new Date('2024-01-30T10:20:00').toISOString() },
        { issueId: 14, userId: 6, createdAt: new Date('2024-01-30T13:50:00').toISOString() },
        { issueId: 14, userId: 7, createdAt: new Date('2024-01-31T09:30:00').toISOString() },
        { issueId: 14, userId: 8, createdAt: new Date('2024-01-31T15:10:00').toISOString() },
        { issueId: 14, userId: 9, createdAt: new Date('2024-02-01T11:45:00').toISOString() },

        // Issue 16 (9 votes)
        { issueId: 16, userId: 3, createdAt: new Date('2024-01-31T09:45:00').toISOString() },
        { issueId: 16, userId: 4, createdAt: new Date('2024-01-31T13:20:00').toISOString() },
        { issueId: 16, userId: 5, createdAt: new Date('2024-02-01T10:00:00').toISOString() },
        { issueId: 16, userId: 6, createdAt: new Date('2024-02-01T14:35:00').toISOString() },
        { issueId: 16, userId: 7, createdAt: new Date('2024-02-02T09:50:00').toISOString() },
        { issueId: 16, userId: 8, createdAt: new Date('2024-02-02T15:15:00').toISOString() },
        { issueId: 16, userId: 9, createdAt: new Date('2024-02-03T11:30:00').toISOString() },
        { issueId: 16, userId: 10, createdAt: new Date('2024-02-03T14:50:00').toISOString() },
        { issueId: 16, userId: 11, createdAt: new Date('2024-02-04T10:25:00').toISOString() },

        // Issue 17 (5 votes)
        { issueId: 17, userId: 3, createdAt: new Date('2024-02-01T11:00:00').toISOString() },
        { issueId: 17, userId: 4, createdAt: new Date('2024-02-01T14:30:00').toISOString() },
        { issueId: 17, userId: 5, createdAt: new Date('2024-02-02T10:15:00').toISOString() },
        { issueId: 17, userId: 6, createdAt: new Date('2024-02-02T13:45:00').toISOString() },
        { issueId: 17, userId: 7, createdAt: new Date('2024-02-03T09:20:00').toISOString() },

        // Low voted issues (0-4 votes each)
        // Issue 19 (4 votes)
        { issueId: 19, userId: 3, createdAt: new Date('2024-02-03T10:30:00').toISOString() },
        { issueId: 19, userId: 4, createdAt: new Date('2024-02-03T14:00:00').toISOString() },
        { issueId: 19, userId: 5, createdAt: new Date('2024-02-04T09:45:00').toISOString() },
        { issueId: 19, userId: 6, createdAt: new Date('2024-02-04T13:20:00').toISOString() },

        // Issue 20 (3 votes)
        { issueId: 20, userId: 3, createdAt: new Date('2024-02-04T11:15:00').toISOString() },
        { issueId: 20, userId: 4, createdAt: new Date('2024-02-04T14:40:00').toISOString() },
        { issueId: 20, userId: 5, createdAt: new Date('2024-02-05T10:25:00').toISOString() },

        // Issue 21 (2 votes)
        { issueId: 21, userId: 3, createdAt: new Date('2024-02-05T09:30:00').toISOString() },
        { issueId: 21, userId: 4, createdAt: new Date('2024-02-05T13:50:00').toISOString() },

        // Issue 23 (4 votes)
        { issueId: 23, userId: 3, createdAt: new Date('2024-02-07T10:00:00').toISOString() },
        { issueId: 23, userId: 4, createdAt: new Date('2024-02-07T13:30:00').toISOString() },
        { issueId: 23, userId: 5, createdAt: new Date('2024-02-08T09:15:00').toISOString() },
        { issueId: 23, userId: 6, createdAt: new Date('2024-02-08T14:45:00').toISOString() },

        // Issue 24 (3 votes)
        { issueId: 24, userId: 3, createdAt: new Date('2024-02-08T11:20:00').toISOString() },
        { issueId: 24, userId: 4, createdAt: new Date('2024-02-08T15:00:00').toISOString() },
        { issueId: 24, userId: 5, createdAt: new Date('2024-02-09T10:30:00').toISOString() },

        // Issue 25 (1 vote)
        { issueId: 25, userId: 3, createdAt: new Date('2024-02-09T09:45:00').toISOString() },

        // Issue 26 (2 votes)
        { issueId: 26, userId: 3, createdAt: new Date('2024-02-10T11:00:00').toISOString() },
        { issueId: 26, userId: 4, createdAt: new Date('2024-02-10T14:30:00').toISOString() },

        // Issue 27 (1 vote)
        { issueId: 27, userId: 3, createdAt: new Date('2024-02-11T10:15:00').toISOString() },

        // Issue 28 (0 votes)
        // No votes for issue 28
    ];

    await db.insert(votes).values(sampleVotes);
    
    console.log('✅ Votes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});