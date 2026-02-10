const express = require('express');
const { createIPB, getAllIPBs, getIPBById, updateIPB } = require('../controllers/ipbController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllIPBs);
router.get('/:id', authenticateToken, getIPBById);

router.post('/',
    authenticateToken,
    authorizeRole(['KEBUN', 'ADMIN']),
    upload.fields([{ name: 'doc_kebun', maxCount: 1 }]),
    createIPB
);

router.put('/:id',
    authenticateToken,
    authorizeRole(['TEKNIS', 'ADMIN']),
    upload.fields([
        { name: 'doc_teknis_1', maxCount: 1 },
        { name: 'doc_teknis_2', maxCount: 1 }
    ]),
    updateIPB
);

const { importItems, exportIPB } = require('../controllers/importController');

router.post('/:id/import',
    authenticateToken,
    upload.single('file'),
    importItems
);

router.get('/:id/export',
    authenticateToken,
    exportIPB
);

module.exports = router;
