const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const supabase = require('../config/supabase'); // Import Supabase client
const { createIPB, getAllIPBs, getIPBById, updateIPB, deleteIPB } = require('../controllers/ipbController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');

// Multer for file uploads (Memory Storage for Vercel/Supabase)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

const router = express.Router();

router.get('/', authenticateToken, getAllIPBs);
router.get('/:id', authenticateToken, getIPBById);

// Helper to upload to Supabase
const uploadToSupabase = async (file) => {
    const filename = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase
        .storage
        .from('documents') // Bucket name
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    // Get Public URL
    const { data: publicData } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filename);

    return publicData.publicUrl;
}

// Create IPB
router.post('/',
    authenticateToken,
    authorizeRole(['KEBUN', 'TEKNIS']),
    upload.fields([
        { name: 'doc_kebun', maxCount: 1 },
        { name: 'doc_teknis_1', maxCount: 1 },
        { name: 'doc_teknis_2', maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            // Intercept createIPB logic to handle file uploads here
            // OR simpler: modify createIPB controller? 
            // For now, let's keep logic in route as per previous plan or modify controller.
            // Wait, the previous code had logic in controller. 
            // Let's copy the logic from previous ipbRoutes but adapted.

            // Actually, to avoid breaking controller separation, let's attach files to req.body 
            // passed to controller, OR execute upload here and pass paths.

            const { title } = req.body;
            const userId = req.user.userId;

            let docKebunPath = null;
            let docTeknis1Path = null;
            let docTeknis2Path = null;

            if (req.files.doc_kebun) {
                docKebunPath = await uploadToSupabase(req.files.doc_kebun[0]);
            }
            if (req.files.doc_teknis_1) {
                docTeknis1Path = await uploadToSupabase(req.files.doc_teknis_1[0]);
            }
            if (req.files.doc_teknis_2) {
                docTeknis2Path = await uploadToSupabase(req.files.doc_teknis_2[0]);
            }

            // Create IPB using Prisma directly here or call controller
            // Since we modified route logic, let's do it here to ensure paths are correct
            const newIPB = await prisma.iPB.create({
                data: {
                    title,
                    createdBy: { connect: { id: userId } },
                    docKebunPath,
                    docTeknis1Path,
                    docTeknis2Path,
                    status: 'DRAFT', // Default
                    statusDetail: req.user.role === 'KEBUN' ? 'Dokumen belum lengkap' : 'Menunggu Approval'
                }
            });

            // Log
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'CREATE_IPB',
                    details: `Created IPB ID: ${newIPB.id}`
                }
            });

            res.status(201).json(newIPB);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.put('/:id',
    authenticateToken,
    authorizeRole(['TEKNIS', 'ADMIN', 'KEBUN']),
    upload.fields([
        { name: 'doc_kebun', maxCount: 1 },
        { name: 'doc_teknis_1', maxCount: 1 },
        { name: 'doc_teknis_2', maxCount: 1 },
        { name: 'doc_ipb', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status, statusDetail, title } = req.body;

            const currentIPB = await prisma.iPB.findUnique({ where: { id: parseInt(id) } });
            if (!currentIPB) return res.status(404).json({ error: 'IPB not found' });

            let docKebunPath = currentIPB.docKebunPath;
            let docTeknis1Path = currentIPB.docTeknis1Path;
            let docTeknis2Path = currentIPB.docTeknis2Path;
            let docIPBPath = currentIPB.docIPBPath;

            // Handle file uploads for update
            if (req.files.doc_kebun) {
                docKebunPath = await uploadToSupabase(req.files.doc_kebun[0]);
            }
            if (req.files.doc_teknis_1) {
                docTeknis1Path = await uploadToSupabase(req.files.doc_teknis_1[0]);
            }
            if (req.files.doc_teknis_2) {
                docTeknis2Path = await uploadToSupabase(req.files.doc_teknis_2[0]);
            }
            if (req.files.doc_ipb) {
                docIPBPath = await uploadToSupabase(req.files.doc_ipb[0]);
            }

            // Handle file deletion (Just set path to null in DB, file remains in Supabase for now)
            if (req.body.delete_doc_kebun === 'true') {
                docKebunPath = null;
            }
            if (req.body.delete_doc_teknis_1 === 'true') {
                docTeknis1Path = null;
            }
            if (req.body.delete_doc_teknis_2 === 'true') {
                docTeknis2Path = null;
            }
            if (req.body.delete_doc_ipb === 'true') {
                docIPBPath = null;
            }

            const updatedIPB = await prisma.iPB.update({
                where: { id: parseInt(id) },
                data: {
                    title: title || undefined,
                    status: status || undefined,
                    statusDetail: statusDetail || undefined,
                    docKebunPath,
                    docTeknis1Path,
                    docTeknis2Path,
                    docIPBPath
                }
            });

            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'UPDATE_IPB',
                    details: `Updated IPB ID: ${id}`
                }
            });

            res.json(updatedIPB);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.delete('/:id',
    authenticateToken,
    authorizeRole(['ADMIN']),
    async (req, res) => {
        try {
            const { id } = req.params;
            const userRole = req.user.role;

            const ipb = await prisma.iPB.findUnique({ where: { id: parseInt(id) } });
            if (!ipb) return res.status(404).json({ error: 'IPB not found' });

            if (userRole !== 'ADMIN' && ipb.createdById !== req.user.userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Files in Supabase are not automatically deleted here to keep it simple
            // You can add logic to delete from Supabase Storage if needed

            await prisma.iPB.delete({ where: { id: parseInt(id) } });

            // Log
            await prisma.auditLog.create({
                data: {
                    userId: req.user.userId,
                    action: 'DELETE_IPB',
                    details: `Deleted IPB ID: ${id}`
                }
            });

            res.json({ message: 'IPB deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

const { exportIPB } = require('../controllers/importController');

router.get('/:id/export',
    authenticateToken,
    exportIPB
);

module.exports = router;
