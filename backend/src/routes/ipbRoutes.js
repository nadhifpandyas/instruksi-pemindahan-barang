const express = require('express');
const { createIPB, getAllIPBs, getIPBById, updateIPB, deleteIPB } = require('../controllers/ipbController');
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
    authorizeRole(['TEKNIS', 'ADMIN', 'KEBUN']),
    upload.fields([
        { name: 'doc_kebun', maxCount: 1 },
        { name: 'doc_teknis_1', maxCount: 1 },
        { name: 'doc_teknis_2', maxCount: 1 }
    ]),
    updateIPB
);

router.delete('/:id',
    authenticateToken,
    authorizeRole(['ADMIN']),
    deleteIPB
);

const { exportIPB } = require('../controllers/importController');

router.get('/:id/export',
    authenticateToken,
    exportIPB
);

module.exports = router;
