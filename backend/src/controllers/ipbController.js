const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logAction = require('../utils/auditLogger');

const prisma = new PrismaClient();

const IPB_STATUS_DETAIL = {
    BELUM_LENGKAP: 'Dokumen belum lengkap',
    BELUM_LENGKAP_NO_MATERIAL: 'Dokumen belum lengkap + No material barang belum ada',
    SUDAH_TERBIT: 'SUDAH_TERBIT IPB (DONE)'
};

const createIPB = async (req, res) => {
    try {
        const { title, textIPB } = req.body;
        const userId = req.user.userId;
        const docKebunFile = req.files && req.files['doc_kebun'] ? req.files['doc_kebun'][0] : null;

        const ipb = await prisma.iPB.create({
            data: {
                title,
                textIPB,
                createdById: userId,
                status: 'PENDING_DOCS',
                docKebunPath: docKebunFile ? docKebunFile.path : null
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

        // Admin updates status/text
        if (userRole === 'ADMIN') {
            if (status) updateData.status = status;
            if (statusDetail !== undefined) updateData.statusDetail = statusDetail;
            if (textIPB !== undefined) updateData.textIPB = textIPB;
        }

        const ipb = await prisma.iPB.update({
            where: { id: parseInt(id) },
            data: updateData
        });

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

        await prisma.iPB.delete({ where: { id: parseInt(id) } });

        await logAction(userId, 'DELETE_IPB', `Deleted IPB ID: ${id}`);

        res.json({ message: 'IPB deleted successfully' });
    } catch (error) {
        console.error('Delete IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createIPB, getAllIPBs, getIPBById, updateIPB, deleteIPB };
