import { validators } from '../utils/validators.js';

export class Destination {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.company = data.company || '';
        this.address = {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || 'Italia'
        };
        this.phone = data.phone || '';
        this.email = data.email || '';
        this.notes = data.notes || '';
        this.usageCount = data.usageCount || 0;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = {};

        if (!validators.required(this.name)) {
            errors.name = 'Il nome è obbligatorio';
        }

        if (this.email && !validators.email(this.email)) {
            errors.email = 'Email non valida';
        }

        if (this.phone && !validators.phone(this.phone)) {
            errors.phone = 'Telefono non valido';
        }

        if (this.address.zipCode && !validators.zipCode(this.address.zipCode)) {
            errors.zipCode = 'CAP non valido';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            company: this.company,
            address: this.address,
            phone: this.phone,
            email: this.email,
            notes: this.notes,
            usageCount: this.usageCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        return new Destination(data);
    }

    getFullAddress() {
        const parts = [
            this.address.street,
            this.address.city,
            this.address.state,
            this.address.zipCode,
            this.address.country
        ].filter(part => part && part.trim() !== '');

        return parts.join(', ');
    }

    getDisplayName() {
        return this.company ? `${this.name} (${this.company})` : this.name;
    }

    incrementUsage() {
        this.usageCount++;
    }
}
