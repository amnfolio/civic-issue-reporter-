import { db } from '@/db';
import { departments } from '@/db/schema';

async function main() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const sampleDepartments = [
        {
            name: 'Roads',
            description: 'Responsible for road maintenance, potholes, and traffic issues',
            createdAt: oneYearAgo.toISOString(),
        },
        {
            name: 'Sanitation',
            description: 'Handles garbage collection, waste management, and cleanliness',
            createdAt: oneYearAgo.toISOString(),
        },
        {
            name: 'Electrical',
            description: 'Manages streetlights, power supply issues, and electrical infrastructure',
            createdAt: oneYearAgo.toISOString(),
        },
        {
            name: 'Water Supply',
            description: 'Oversees water supply, leakages, and pipeline maintenance',
            createdAt: oneYearAgo.toISOString(),
        },
        {
            name: 'Waste Management',
            description: 'Dedicated to waste disposal, recycling, and sanitation services',
            createdAt: oneYearAgo.toISOString(),
        }
    ];

    await db.insert(departments).values(sampleDepartments);
    
    console.log('✅ Departments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});