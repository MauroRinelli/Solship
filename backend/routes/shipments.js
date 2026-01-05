import express from 'express';
import {
    getAllShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    deleteShipment,
    searchShipments,
    getShipmentStats
} from '../controllers/shipmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/shipments/stats - Get shipment statistics
router.get('/stats', getShipmentStats);

// GET /api/shipments - Get all shipments
// GET /api/shipments?q=search - Search shipments
router.get('/', (req, res) => {
    if (req.query.q) {
        return searchShipments(req, res);
    }
    return getAllShipments(req, res);
});

// GET /api/shipments/:id - Get single shipment
router.get('/:id', getShipmentById);

// POST /api/shipments - Create new shipment
router.post('/', createShipment);

// PUT /api/shipments/:id - Update shipment
router.put('/:id', updateShipment);

// DELETE /api/shipments/:id - Delete shipment
router.delete('/:id', deleteShipment);

export default router;
