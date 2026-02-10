const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const users = [
        { username: 'admin', role: 'ADMIN' },
        { username: 'kebun', role: 'KEBUN' },
        { username: 'teknis', role: 'TEKNIS' }
    ];

    for (const user of users) {
        const existing = await prisma.user.findUnique({ where: { username: user.username } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    username: user.username,
                    password: password,
                    role: user.role
                }
            });
            console.log(`Created user: ${user.username}`);
        } else {
            console.log(`User already exists: ${user.username}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
