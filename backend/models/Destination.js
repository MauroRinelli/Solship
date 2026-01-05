import { pool } from '../config/database.js';

class Destination {
    static async findAll(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM destinations WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    static async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM destinations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }

    static async create(data, userId) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const [result] = await pool.query(
            `INSERT INTO destinations
            (id, user_id, name, company, street, city, state, zip_code, country, phone, email, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                userId,
                data.name,
                data.company || null,
                data.address?.street || null,
                data.address?.city || null,
                data.address?.state || null,
                data.address?.zipCode || null,
                data.address?.country || 'Italy',
                data.phone || null,
                data.email || null,
                data.notes || null
            ]
        );

        return await this.findById(id, userId);
    }

    static async update(id, data, userId) {
        const updateFields = [];
        const values = [];

        if (data.name !== undefined) {
            updateFields.push('name = ?');
            values.push(data.name);
        }
        if (data.company !== undefined) {
            updateFields.push('company = ?');
            values.push(data.company);
        }
        if (data.address?.street !== undefined) {
            updateFields.push('street = ?');
            values.push(data.address.street);
        }
        if (data.address?.city !== undefined) {
            updateFields.push('city = ?');
            values.push(data.address.city);
        }
        if (data.address?.state !== undefined) {
            updateFields.push('state = ?');
            values.push(data.address.state);
        }
        if (data.address?.zipCode !== undefined) {
            updateFields.push('zip_code = ?');
            values.push(data.address.zipCode);
        }
        if (data.address?.country !== undefined) {
            updateFields.push('country = ?');
            values.push(data.address.country);
        }
        if (data.phone !== undefined) {
            updateFields.push('phone = ?');
            values.push(data.phone);
        }
        if (data.email !== undefined) {
            updateFields.push('email = ?');
            values.push(data.email);
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
            `UPDATE destinations SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );

        return await this.findById(id, userId);
    }

    static async delete(id, userId) {
        const [result] = await pool.query(
            'DELETE FROM destinations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    static async search(query, userId) {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT * FROM destinations
            WHERE user_id = ? AND (
                name LIKE ? OR
                company LIKE ? OR
                city LIKE ? OR
                street LIKE ? OR
                email LIKE ? OR
                phone LIKE ?
            )
            ORDER BY created_at DESC`,
            [userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return rows;
    }

    static formatResponse(row) {
        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            company: row.company,
            address: {
                street: row.street,
                city: row.city,
                state: row.state,
                zipCode: row.zip_code,
                country: row.country
            },
            phone: row.phone,
            email: row.email,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

export default Destination;
