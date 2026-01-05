import Shipment from '../models/Shipment.js';

export const getAllShipments = async (req, res) => {
    try {
        const userId = req.userId;
        const shipments = await Shipment.findAll(userId);

        const formatted = shipments.map(s => Shipment.formatResponse(s));
        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ success: false, message: 'Error fetching shipments' });
    }
};

export const getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const shipment = await Shipment.findById(id, userId);

        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        res.json({ success: true, data: Shipment.formatResponse(shipment) });
    } catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).json({ success: false, message: 'Error fetching shipment' });
    }
};

export const createShipment = async (req, res) => {
    try {
        const userId = req.userId;
        const shipment = await Shipment.create(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Shipment created successfully',
            data: Shipment.formatResponse(shipment)
        });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ success: false, message: 'Error creating shipment' });
    }
};

export const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const shipment = await Shipment.update(id, req.body, userId);

        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        res.json({
            success: true,
            message: 'Shipment updated successfully',
            data: Shipment.formatResponse(shipment)
        });
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ success: false, message: 'Error updating shipment' });
    }
};

export const deleteShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const deleted = await Shipment.delete(id, userId);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        res.json({ success: true, message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ success: false, message: 'Error deleting shipment' });
    }
};

export const searchShipments = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.userId;

        if (!q) {
            return getAllShipments(req, res);
        }

        const shipments = await Shipment.search(q, userId);
        const formatted = shipments.map(s => Shipment.formatResponse(s));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error searching shipments:', error);
        res.status(500).json({ success: false, message: 'Error searching shipments' });
    }
};

export const getShipmentStats = async (req, res) => {
    try {
        const userId = req.userId;
        const stats = await Shipment.getStats(userId);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
};
