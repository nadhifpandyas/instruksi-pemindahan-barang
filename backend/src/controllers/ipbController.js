const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logAction = require('../utils/auditLogger');

const prisma = new PrismaClient();

const IPB_STATUS_DETAIL = {
    BELUM_LENGKAP: 'Dokumen belum lengkap',
    BELUM_LENGKAP_NO_MATERIAL: 'Dokumen belum lengkap + No material barang belum ada',
    SUDAH_TERBIT: 'SUDAH_TERBIT IPB (DONE)',
    LENGKAP: 'Dokumen sudah lengkap',
    KOSONG: 'Dokumen kosong'
};

const determineStatusDetail = (ipb) => {
    // Check specific documents for "Menunggu Approval" logic
    const hasDocKebun = !!ipb.docKebunPath;
    const hasDocTeknis1 = !!ipb.docTeknis1Path;
    const hasDocTeknis2 = !!ipb.docTeknis2Path;
    const hasDocIPB = !!ipb.docIPBPath;

    if (hasDocIPB) return 'Dokumen sudah lengkap';

    // If all 3 prerequisites are present but no IPB doc -> Menunggu Approval
    if (hasDocKebun && hasDocTeknis1 && hasDocTeknis2 && !hasDocIPB) {
        return 'Menunggu Approval';
    }

    const docs = [ipb.docKebunPath, ipb.docTeknis1Path, ipb.docTeknis2Path, ipb.docIPBPath];
    const uploadedCount = docs.filter(doc => doc !== null && doc !== undefined).length;

    if (uploadedCount === 0) return 'Dokumen kosong';

    // Fallback for 1 or 2 docs
    return 'Dokumen belum lengkap';
};

const createIPB = async (req, res) => {
    try {
        if (req.user.role !== 'KEBUN' && req.user.role !== 'TEKNIS') {
            return res.status(403).json({ error: 'Only KEBUN and TEKNIS role can create IPB' });
        }

        const { title } = req.body;
        const userId = req.user.userId;

        let docPath = null;
        let docKebunPath = null;
        let docTeknis1Path = null;
        let docTeknis2Path = null;

        if (req.user.role === 'KEBUN') {
            const file = req.files && req.files['doc_kebun'] ? req.files['doc_kebun'][0] : null;
            if (file) docKebunPath = file.path;
            docPath = file;
        } else if (req.user.role === 'TEKNIS') {
            const file1 = req.files && req.files['doc_teknis_1'] ? req.files['doc_teknis_1'][0] : null;
            const file2 = req.files && req.files['doc_teknis_2'] ? req.files['doc_teknis_2'][0] : null;

            if (file1) docTeknis1Path = file1.path;
            if (file2) docTeknis2Path = file2.path;

            docPath = file1 || file2;
        }

        const initialStatusDetail = docPath ? 'Dokumen belum lengkap' : 'Dokumen kosong';

        const ipb = await prisma.iPB.create({
            data: {
                title,
                createdById: userId,
                status: 'PENDING_DOCS',
                statusDetail: initialStatusDetail,
                statusDetail: initialStatusDetail,
                docKebunPath: docKebunPath,
                docTeknis1Path: docTeknis1Path,
                docTeknis2Path: docTeknis2Path
            }
        });

        await logAction(userId, 'CREATE_IPB', `Created IPB ID: ${ipb.id}`);

        res.status(201).json(ipb);
    } catch (error) {
        console.error('Create IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllIPBs = async (req, res) => {
    try {
        const ipbs = await prisma.iPB.findMany({
            include: { createdBy: { select: { username: true, role: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(ipbs);
    } catch (error) {
        console.error('Get All IPBs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getIPBById = async (req, res) => {
    try {
        const { id } = req.params;
        const ipb = await prisma.iPB.findUnique({
            where: { id: parseInt(id) },
            include: { createdBy: { select: { username: true } } }
        });

        if (!ipb) {
            return res.status(404).json({ error: 'IPB not found' });
        }

        res.json(ipb);
    } catch (error) {
        console.error('Get IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateIPB = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, statusDetail, textIPB } = req.body;
        const userRole = req.user.role;
        const userId = req.user.userId;

        const { delete_doc_kebun, delete_doc_teknis_1, delete_doc_teknis_2 } = req.body;

        const docKebun = req.files && req.files['doc_kebun'] ? req.files['doc_kebun'][0] : null;
        const docTeknis1 = req.files && req.files['doc_teknis_1'] ? req.files['doc_teknis_1'][0] : null;
        const docTeknis2 = req.files && req.files['doc_teknis_2'] ? req.files['doc_teknis_2'][0] : null;

        const updateData = {};

        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error("Error deleting file:", e);
                }
            }
        };

        const currentIPB = await prisma.iPB.findUnique({ where: { id: parseInt(id) } });
        if (!currentIPB) {
            return res.status(404).json({ error: 'IPB not found' });
        }

        // File permissions logic
        if (userRole === 'ADMIN') {
            if (docKebun) {
                if (currentIPB.docKebunPath) deleteFile(currentIPB.docKebunPath);
                updateData.docKebunPath = docKebun.path;
            }
            if (delete_doc_kebun === 'true') {
                if (currentIPB.docKebunPath) deleteFile(currentIPB.docKebunPath);
                updateData.docKebunPath = null;
            }

            if (docTeknis1) {
                if (currentIPB.docTeknis1Path) deleteFile(currentIPB.docTeknis1Path);
                updateData.docTeknis1Path = docTeknis1.path;
            }
            if (delete_doc_teknis_1 === 'true') {
                if (currentIPB.docTeknis1Path) deleteFile(currentIPB.docTeknis1Path);
                updateData.docTeknis1Path = null;
            }

            if (docTeknis2) {
                if (currentIPB.docTeknis2Path) deleteFile(currentIPB.docTeknis2Path);
                updateData.docTeknis2Path = docTeknis2.path;
            }
            if (delete_doc_teknis_2 === 'true') {
                if (currentIPB.docTeknis2Path) deleteFile(currentIPB.docTeknis2Path);
                updateData.docTeknis2Path = null;
            }
        } else if (userRole === 'KEBUN') {
            if (docKebun) {
                if (currentIPB.docKebunPath) deleteFile(currentIPB.docKebunPath);
                updateData.docKebunPath = docKebun.path;
            }
            if (delete_doc_kebun === 'true') {
                if (currentIPB.docKebunPath) deleteFile(currentIPB.docKebunPath);
                updateData.docKebunPath = null;
            }
        } else if (userRole === 'TEKNIS') {
            if (docTeknis1) {
                if (currentIPB.docTeknis1Path) deleteFile(currentIPB.docTeknis1Path);
                updateData.docTeknis1Path = docTeknis1.path;
            }
            if (delete_doc_teknis_1 === 'true') {
                if (currentIPB.docTeknis1Path) deleteFile(currentIPB.docTeknis1Path);
                updateData.docTeknis1Path = null;
            }

            if (docTeknis2) {
                if (currentIPB.docTeknis2Path) deleteFile(currentIPB.docTeknis2Path);
                updateData.docTeknis2Path = docTeknis2.path;
            }
            if (delete_doc_teknis_2 === 'true') {
                if (currentIPB.docTeknis2Path) deleteFile(currentIPB.docTeknis2Path);
                updateData.docTeknis2Path = null;
            }
        }

        // Admin updates status/text/docIPB/Title
        if (userRole === 'ADMIN') {
            if (status) updateData.status = status;
            if (statusDetail !== undefined) updateData.statusDetail = statusDetail;
            if (req.body.title) updateData.title = req.body.title; // Allow Admin to edit title

            const docIPB = req.files && req.files['doc_ipb'] ? req.files['doc_ipb'][0] : null;
            if (docIPB) {
                if (currentIPB.docIPBPath) deleteFile(currentIPB.docIPBPath);
                updateData.docIPBPath = docIPB.path;
            }
            if (req.body.delete_doc_ipb === 'true') {
                if (currentIPB.docIPBPath) deleteFile(currentIPB.docIPBPath);
                updateData.docIPBPath = null;
            }
        }

        const ipb = await prisma.iPB.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Recalculate status detail based on updated IPB
        const updatedIPB = await prisma.iPB.findUnique({ where: { id: parseInt(id) } });
        const newStatusDetail = determineStatusDetail(updatedIPB);

        // Update again if status changed
        if (updatedIPB.statusDetail !== newStatusDetail) {
            await prisma.iPB.update({
                where: { id: parseInt(id) },
                data: { statusDetail: newStatusDetail }
            });
        }

        await logAction(userId, 'UPDATE_IPB', `Updated IPB ID: ${id}. Changes: ${Object.keys(updateData).join(', ')}`);

        res.json(ipb);
    } catch (error) {
        console.error('Update IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteIPB = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const ipb = await prisma.iPB.findUnique({ where: { id: parseInt(id) } });
        if (!ipb) {
            return res.status(404).json({ error: 'IPB not found' });
        }

        const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error("Error deleting file during IPB deletion:", e);
                }
            }
        };

        // Cleanup files
        deleteFile(ipb.docKebunPath);
        deleteFile(ipb.docTeknis1Path);
        deleteFile(ipb.docTeknis2Path);
        deleteFile(ipb.docIPBPath);

        await prisma.iPB.delete({ where: { id: parseInt(id) } });

        await logAction(userId, 'DELETE_IPB', `Deleted IPB ID: ${id}`);

        res.json({ message: 'IPB deleted successfully' });
    } catch (error) {
        console.error('Delete IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createIPB, getAllIPBs, getIPBById, updateIPB, deleteIPB };
