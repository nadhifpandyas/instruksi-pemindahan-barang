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
        const { title, items } = req.body;
        const userId = req.user.userId;

        // Parse items if sent as string (multipart form-data quirk)
        let parsedItems = [];
        if (typeof items === 'string') {
            try {
                parsedItems = JSON.parse(items);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid items format' });
            }
        } else {
            parsedItems = items;
        }

        const docKebunFile = req.files && req.files['doc_kebun'] ? req.files['doc_kebun'][0] : null;

        const ipb = await prisma.iPB.create({
            data: {
                title,
                createdById: userId,
                status: 'PENDING_DOCS',
                docKebunPath: docKebunFile ? docKebunFile.path : null,
                items: {
                    create: parsedItems.map(item => ({
                        description: item.description,
                        quantity: parseInt(item.quantity) || 0,
                        unit: item.unit
                    }))
                }
            },
            include: { items: true }
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
            orderBy: { createdAt: 'desc' }
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
            include: { items: true, createdBy: { select: { username: true } } }
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

        // File uploads
        const docTeknis1 = req.files && req.files['doc_teknis_1'] ? req.files['doc_teknis_1'][0] : null;
        const docTeknis2 = req.files && req.files['doc_teknis_2'] ? req.files['doc_teknis_2'][0] : null;

        const updateData = {};

        if (docTeknis1) updateData.docTeknis1Path = docTeknis1.path;
        if (docTeknis2) updateData.docTeknis2Path = docTeknis2.path;

        // Admin updates
        if (userRole === 'ADMIN') {
            if (status) updateData.status = status;
            if (statusDetail) {
                if (!Object.values(IPB_STATUS_DETAIL).includes(statusDetail)) {
                    // Allow matching keys too if needed, but requirements say values.
                    // We trust admin sends correct string or we validate strictly?
                    // Let's allow raw string if it matches requirements.
                }
                updateData.statusDetail = statusDetail;
            }
            if (textIPB) updateData.textIPB = textIPB;
        }

        const ipb = await prisma.iPB.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { items: true }
        });

        await logAction(req.user.userId, 'UPDATE_IPB', `Updated IPB ID: ${id}. Changes: ${Object.keys(updateData).join(', ')}`);

        res.json(ipb);
    } catch (error) {
        console.error('Update IPB error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createIPB, getAllIPBs, getIPBById, updateIPB };
