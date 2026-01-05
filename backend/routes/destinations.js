import express from 'express';
import {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
    searchDestinations
} from '../controllers/destinationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/destinations - Get all destinations
// GET /api/destinations?q=search - Search destinations
router.get('/', (req, res) => {
    if (req.query.q) {
        return searchDestinations(req, res);
    }
    return getAllDestinations(req, res);
});

// GET /api/destinations/:id - Get single destination
router.get('/:id', getDestinationById);

// POST /api/destinations - Create new destination
router.post('/', createDestination);

// PUT /api/destinations/:id - Update destination
router.put('/:id', updateDestination);

// DELETE /api/destinations/:id - Delete destination
router.delete('/:id', deleteDestination);

export default router;
