import { validators } from '../utils/validators.js';

export class Shipment {
    constructor(data = {}) {
        this.id = data.id || null;
        this.trackingNumber = data.trackingNumber || '';
        this.carrier = data.carrier || '';
        this.destinationId = data.destinationId || '';
        this.status = data.status || 'pending';
        this.shipDate = data.shipDate || new Date().toISOString().split('T')[0];
        this.expectedDelivery = data.expectedDelivery || '';
        this.actualDelivery = data.actualDelivery || null;
        this.weight = data.weight || 0;
        this.weightUnit = data.weightUnit || 'kg';
        this.dimensions = {
            length: data.dimensions?.length || 0,
            width: data.dimensions?.width || 0,
            height: data.dimensions?.height || 0,
            unit: data.dimensions?.unit || 'cm'
        };
        this.cost = data.cost || 0;
        this.currency = data.currency || 'EUR';
        this.items = data.items || '';
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = {};

        if (!validators.required(this.trackingNumber)) {
            errors.trackingNumber = 'Il numero di tracking è obbligatorio';
        }

        if (!validators.required(this.carrier)) {
            errors.carrier = 'Il corriere è obbligatorio';
        }

        if (!validators.required(this.destinationId)) {
            errors.destinationId = 'Il destinatario è obbligatorio';
        }

        if (!validators.required(this.shipDate)) {
            errors.shipDate = 'La data di spedizione è obbligatoria';
        }

        if (this.weight && this.weight < 0) {
            errors.weight = 'Il peso non può essere negativo';
        }

        if (this.cost && this.cost < 0) {
            errors.cost = 'Il costo non può essere negativo';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            trackingNumber: this.trackingNumber,
            carrier: this.carrier,
            destinationId: this.destinationId,
            status: this.status,
            shipDate: this.shipDate,
            expectedDelivery: this.expectedDelivery,
            actualDelivery: this.actualDelivery,
            weight: this.weight,
            weightUnit: this.weightUnit,
            dimensions: this.dimensions,
            cost: this.cost,
            currency: this.currency,
            items: this.items,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        return new Shipment(data);
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        if (newStatus === 'delivered' && !this.actualDelivery) {
            this.actualDelivery = new Date().toISOString().split('T')[0];
        }
    }

    getStatusLabel() {
        const labels = {
            'pending': 'In Attesa',
            'in-transit': 'In Transito',
            'out-for-delivery': 'In Consegna',
            'delivered': 'Consegnato',
            'failed-delivery': 'Consegna Fallita',
            'cancelled': 'Annullato',
            'returned': 'Restituito'
        };

        return labels[this.status] || this.status;
    }

    getStatusClass() {
        const classes = {
            'pending': 'status-pending',
            'in-transit': 'status-in-transit',
            'out-for-delivery': 'status-in-transit',
            'delivered': 'status-delivered',
            'failed-delivery': 'status-cancelled',
            'cancelled': 'status-cancelled',
            'returned': 'status-cancelled'
        };

        return classes[this.status] || 'status-pending';
    }

    isActive() {
        return this.status === 'pending' || this.status === 'in-transit' || this.status === 'out-for-delivery';
    }

    isDelivered() {
        return this.status === 'delivered';
    }

    getDaysInTransit() {
        if (!this.shipDate) return 0;

        const shipDate = new Date(this.shipDate);
        const endDate = this.actualDelivery ? new Date(this.actualDelivery) : new Date();
        const diffTime = Math.abs(endDate - shipDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    isLate() {
        if (!this.expectedDelivery || this.status === 'delivered') return false;

        const expectedDate = new Date(this.expectedDelivery);
        const today = new Date();

        return today > expectedDate;
    }

    getVolume() {
        const { length, width, height } = this.dimensions;
        return length * width * height;
    }
}
