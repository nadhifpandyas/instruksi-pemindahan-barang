const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async (userId, action, details) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details
            }
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

module.exports = logAction;
