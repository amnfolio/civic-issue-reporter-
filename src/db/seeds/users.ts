import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'rajesh.kumar@example.com',
            name: 'Rajesh Kumar',
            role: 'admin',
            createdAt: new Date('2024-08-15').toISOString(),
        },
        {
            email: 'priya.sharma@example.com',
            name: 'Priya Sharma',
            role: 'admin',
            createdAt: new Date('2024-08-20').toISOString(),
        },
        {
            email: 'amit.patel@example.com',
            name: 'Amit Patel',
            role: 'user',
            createdAt: new Date('2024-09-01').toISOString(),
        },
        {
            email: 'sneha.reddy@example.com',
            name: 'Sneha Reddy',
            role: 'user',
            createdAt: new Date('2024-09-10').toISOString(),
        },
        {
            email: 'vikram.singh@example.com',
            name: 'Vikram Singh',
            role: 'user',
            createdAt: new Date('2024-09-15').toISOString(),
        },
        {
            email: 'anjali.gupta@example.com',
            name: 'Anjali Gupta',
            role: 'user',
            createdAt: new Date('2024-10-01').toISOString(),
        },
        {
            email: 'rahul.verma@example.com',
            name: 'Rahul Verma',
            role: 'user',
            createdAt: new Date('2024-10-10').toISOString(),
        },
        {
            email: 'kavya.menon@example.com',
            name: 'Kavya Menon',
            role: 'user',
            createdAt: new Date('2024-10-20').toISOString(),
        },
        {
            email: 'arjun.nair@example.com',
            name: 'Arjun Nair',
            role: 'user',
            createdAt: new Date('2024-11-05').toISOString(),
        },
        {
            email: 'deepika.joshi@example.com',
            name: 'Deepika Joshi',
            role: 'user',
            createdAt: new Date('2024-11-15').toISOString(),
        },
        {
            email: 'sanjay.rao@example.com',
            name: 'Sanjay Rao',
            role: 'user',
            createdAt: new Date('2024-12-01').toISOString(),
        },
        {
            email: 'meera.iyer@example.com',
            name: 'Meera Iyer',
            role: 'user',
            createdAt: new Date('2024-12-10').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});