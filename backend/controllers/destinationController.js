import Destination from '../models/Destination.js';

export const getAllDestinations = async (req, res) => {
    try {
        const userId = req.userId; // Set by auth middleware
        const destinations = await Destination.findAll(userId);

        const formatted = destinations.map(d => Destination.formatResponse(d));
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ success: false, message: 'Error fetching destinations' });
    }
};

export const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const destination = await Destination.findById(id, userId);

        if (!destination) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        res.json({ success: true, data: Destination.formatResponse(destination) });
    } catch (error) {
        console.error('Error fetching destination:', error);
        res.status(500).json({ success: false, message: 'Error fetching destination' });
    }
};

export const createDestination = async (req, res) => {
    try {
        const userId = req.userId;
        const destination = await Destination.create(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Destination created successfully',
            data: Destination.formatResponse(destination)
        });
    } catch (error) {
        console.error('Error creating destination:', error);
        res.status(500).json({ success: false, message: 'Error creating destination' });
    }
};

export const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const destination = await Destination.update(id, req.body, userId);

        if (!destination) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        res.json({
            success: true,
            message: 'Destination updated successfully',
            data: Destination.formatResponse(destination)
        });
    } catch (error) {
        console.error('Error updating destination:', error);
        res.status(500).json({ success: false, message: 'Error updating destination' });
    }
};

export const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const deleted = await Destination.delete(id, userId);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete destination with associated shipments'
            });
        }
        console.error('Error deleting destination:', error);
        res.status(500).json({ success: false, message: 'Error deleting destination' });
    }
};

export const searchDestinations = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.userId;

        if (!q) {
            return getAllDestinations(req, res);
        }

        const destinations = await Destination.search(q, userId);
        const formatted = destinations.map(d => Destination.formatResponse(d));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error searching destinations:', error);
        res.status(500).json({ success: false, message: 'Error searching destinations' });
    }
};
