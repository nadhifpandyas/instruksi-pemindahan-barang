const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const importItems = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Header detection/validation (simple)
        // Expect: Description, Quantity, Unit
        if (data.length === 0) {
            return res.status(400).json({ error: 'Empty file' });
        }

        const itemsToCreate = data.map(row => ({
            description: row['Description'] || row['description'] || 'Unknown Item',
            quantity: parseInt(row['Quantity'] || row['quantity']) || 0,
            unit: row['Unit'] || row['unit'] || 'pcs'
        }));

        const result = await prisma.iPBItem.createMany({
            data: itemsToCreate.map(item => ({
                ipbId: parseInt(id),
                ...item
            }))
        });

        // Cleanup uploaded file
        const fs = require('fs');
        fs.unlinkSync(file.path);

        res.json({ message: 'Import successful', count: result.count, items: itemsToCreate });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const exportIPB = async (req, res) => {
    try {
        const { id } = req.params;
        const ipb = await prisma.iPB.findUnique({
            where: { id: parseInt(id) },
            include: { items: true, createdBy: true }
        });

        if (!ipb) {
            return res.status(404).json({ error: 'IPB not found' });
        }

        const data = ipb.items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            Unit: item.unit
        }));

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Items");

        // Write to buffer
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="IPB-${id}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { importItems, exportIPB };
