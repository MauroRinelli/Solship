import { pool } from '../config/database.js';

class Shipment {
    static async findAll(userId) {
        const [rows] = await pool.query(
            `SELECT s.*,
                d.name as destination_name,
                d.city as destination_city,
                d.country as destination_country
            FROM shipments s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id, userId) {
        const [rows] = await pool.query(
            `SELECT s.*,
                d.name as destination_name,
                d.company as destination_company,
                d.street as destination_street,
                d.city as destination_city,
                d.state as destination_state,
                d.zip_code as destination_zip_code,
                d.country as destination_country,
                d.phone as destination_phone,
                d.email as destination_email
            FROM shipments s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE s.id = ? AND s.user_id = ?`,
            [id, userId]
        );
        return rows[0];
    }

    static async create(data, userId) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const [result] = await pool.query(
            `INSERT INTO shipments
            (id, user_id, destination_id, tracking_number, carrier, status,
            ship_date, expected_delivery, items, weight, dimensions, cost, currency, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                userId,
                data.destinationId,
                data.trackingNumber || null,
                data.carrier,
                data.status || 'pending',
                data.shipDate,
                data.expectedDelivery || null,
                data.items || null,
                data.weight || null,
                data.dimensions || null,
                data.cost || null,
                data.currency || 'EUR',
                data.notes || null
            ]
        );

        return await this.findById(id, userId);
    }

    static async update(id, data, userId) {
        const updateFields = [];
        const values = [];

        if (data.destinationId !== undefined) {
            updateFields.push('destination_id = ?');
            values.push(data.destinationId);
        }
        if (data.trackingNumber !== undefined) {
            updateFields.push('tracking_number = ?');
            values.push(data.trackingNumber);
        }
        if (data.carrier !== undefined) {
            updateFields.push('carrier = ?');
            values.push(data.carrier);
        }
        if (data.status !== undefined) {
            updateFields.push('status = ?');
            values.push(data.status);
        }
        if (data.shipDate !== undefined) {
            updateFields.push('ship_date = ?');
            values.push(data.shipDate);
        }
        if (data.expectedDelivery !== undefined) {
            updateFields.push('expected_delivery = ?');
            values.push(data.expectedDelivery);
        }
        if (data.actualDelivery !== undefined) {
            updateFields.push('actual_delivery = ?');
            values.push(data.actualDelivery);
        }
        if (data.items !== undefined) {
            updateFields.push('items = ?');
            values.push(data.items);
        }
        if (data.weight !== undefined) {
            updateFields.push('weight = ?');
            values.push(data.weight);
        }
        if (data.dimensions !== undefined) {
            updateFields.push('dimensions = ?');
            values.push(data.dimensions);
        }
        if (data.cost !== undefined) {
            updateFields.push('cost = ?');
            values.push(data.cost);
        }
        if (data.currency !== undefined) {
            updateFields.push('currency = ?');
            values.push(data.currency);
        }
        if (data.notes !== undefined) {
            updateFields.push('notes = ?');
            values.push(data.notes);
        }

        if (updateFields.length === 0) {
            return await this.findById(id, userId);
        }

        values.push(id, userId);

        await pool.query(
            `UPDATE shipments SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );

        return await this.findById(id, userId);
    }

    static async delete(id, userId) {
        const [result] = await pool.query(
            'DELETE FROM shipments WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    static async search(query, userId) {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT s.*,
                d.name as destination_name,
                d.city as destination_city,
                d.country as destination_country
            FROM shipments s
            LEFT JOIN destinations d ON s.destination_id = d.id
            WHERE s.user_id = ? AND (
                s.tracking_number LIKE ? OR
                s.carrier LIKE ? OR
                s.status LIKE ? OR
                s.items LIKE ? OR
                d.name LIKE ?
            )
            ORDER BY s.created_at DESC`,
            [userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return rows;
    }

    static async getStats(userId) {
        const [stats] = await pool.query(
            `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('pending', 'in-transit') THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(cost) as total_cost,
                AVG(cost) as avg_cost
            FROM shipments
            WHERE user_id = ?`,
            [userId]
        );
        return stats[0];
    }

    static formatResponse(row) {
        if (!row) return null;

        return {
            id: row.id,
            destinationId: row.destination_id,
            trackingNumber: row.tracking_number,
            carrier: row.carrier,
            status: row.status,
            shipDate: row.ship_date,
            expectedDelivery: row.expected_delivery,
            actualDelivery: row.actual_delivery,
            items: row.items,
            weight: row.weight ? parseFloat(row.weight) : null,
            dimensions: row.dimensions,
            cost: row.cost ? parseFloat(row.cost) : null,
            currency: row.currency,
            notes: row.notes,
            destination: row.destination_name ? {
                name: row.destination_name,
                company: row.destination_company,
                address: {
                    street: row.destination_street,
                    city: row.destination_city,
                    state: row.destination_state,
                    zipCode: row.destination_zip_code,
                    country: row.destination_country
                },
                phone: row.destination_phone,
                email: row.destination_email
            } : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

export default Shipment;
