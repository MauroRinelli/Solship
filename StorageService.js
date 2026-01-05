export class StorageService {
    constructor() {
        this.prefix = 'shipment-manager:';
        this.keys = {
            destinations: `${this.prefix}destinations`,
            shipments: `${this.prefix}shipments`,
            settings: `${this.prefix}settings`
        };

        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.keys.destinations)) {
            localStorage.setItem(this.keys.destinations, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keys.shipments)) {
            localStorage.setItem(this.keys.shipments, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keys.settings)) {
            localStorage.setItem(this.keys.settings, JSON.stringify({
                theme: 'light',
                currency: 'EUR',
                weightUnit: 'kg',
                dimensionUnit: 'cm'
            }));
        }
    }

    getAll(entityType) {
        try {
            const key = this.keys[entityType];
            if (!key) {
                throw new Error(`Invalid entity type: ${entityType}`);
            }

            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error getting all ${entityType}:`, error);
            return [];
        }
    }

    getById(entityType, id) {
        const items = this.getAll(entityType);
        return items.find(item => item.id === id) || null;
    }

    create(entityType, data) {
        try {
            const items = this.getAll(entityType);
            const newItem = {
                ...data,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            items.push(newItem);
            this.saveAll(entityType, items);
            this.notifyUpdate();

            return newItem;
        } catch (error) {
            console.error(`Error creating ${entityType}:`, error);
            throw error;
        }
    }

    update(entityType, id, data) {
        try {
            const items = this.getAll(entityType);
            const index = items.findIndex(item => item.id === id);

            if (index === -1) {
                throw new Error(`${entityType} with id ${id} not found`);
            }

            items[index] = {
                ...items[index],
                ...data,
                id,
                updatedAt: new Date().toISOString()
            };

            this.saveAll(entityType, items);
            this.notifyUpdate();

            return items[index];
        } catch (error) {
            console.error(`Error updating ${entityType}:`, error);
            throw error;
        }
    }

    delete(entityType, id) {
        try {
            const items = this.getAll(entityType);
            const filteredItems = items.filter(item => item.id !== id);

            if (items.length === filteredItems.length) {
                throw new Error(`${entityType} with id ${id} not found`);
            }

            this.saveAll(entityType, filteredItems);
            this.notifyUpdate();

            return true;
        } catch (error) {
            console.error(`Error deleting ${entityType}:`, error);
            throw error;
        }
    }

    search(entityType, query) {
        if (!query || query.trim() === '') {
            return this.getAll(entityType);
        }

        const items = this.getAll(entityType);
        const lowerQuery = query.toLowerCase();

        return items.filter(item => {
            if (entityType === 'destinations') {
                return (
                    item.name?.toLowerCase().includes(lowerQuery) ||
                    item.company?.toLowerCase().includes(lowerQuery) ||
                    item.address?.city?.toLowerCase().includes(lowerQuery) ||
                    item.address?.street?.toLowerCase().includes(lowerQuery) ||
                    item.email?.toLowerCase().includes(lowerQuery) ||
                    item.phone?.includes(query)
                );
            } else if (entityType === 'shipments') {
                return (
                    item.trackingNumber?.toLowerCase().includes(lowerQuery) ||
                    item.carrier?.toLowerCase().includes(lowerQuery) ||
                    item.status?.toLowerCase().includes(lowerQuery) ||
                    item.items?.toLowerCase().includes(lowerQuery)
                );
            }
            return false;
        });
    }

    filter(entityType, criteria) {
        const items = this.getAll(entityType);

        return items.filter(item => {
            for (const [key, value] of Object.entries(criteria)) {
                if (value === null || value === undefined || value === '') {
                    continue;
                }

                if (Array.isArray(value)) {
                    if (value.length > 0 && !value.includes(item[key])) {
                        return false;
                    }
                } else if (typeof value === 'object' && value.from && value.to) {
                    const itemDate = new Date(item[key]);
                    const fromDate = new Date(value.from);
                    const toDate = new Date(value.to);
                    if (itemDate < fromDate || itemDate > toDate) {
                        return false;
                    }
                } else if (item[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    sort(items, sortBy, direction = 'asc') {
        return [...items].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy.includes('.')) {
                const keys = sortBy.split('.');
                aVal = keys.reduce((obj, key) => obj?.[key], a);
                bVal = keys.reduce((obj, key) => obj?.[key], b);
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal?.toLowerCase() || '';
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    exportData() {
        const data = {
            destinations: this.getAll('destinations'),
            shipments: this.getAll('shipments'),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (data.destinations) {
                localStorage.setItem(this.keys.destinations, JSON.stringify(data.destinations));
            }

            if (data.shipments) {
                localStorage.setItem(this.keys.shipments, JSON.stringify(data.shipments));
            }

            if (data.settings) {
                localStorage.setItem(this.keys.settings, JSON.stringify(data.settings));
            }

            this.notifyUpdate();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    exportToCSV(entityType) {
        const items = this.getAll(entityType);

        if (items.length === 0) {
            return '';
        }

        if (entityType === 'destinations') {
            const headers = ['ID', 'Nome', 'Azienda', 'Via', 'Città', 'Provincia', 'CAP', 'Paese', 'Telefono', 'Email', 'Note'];
            const rows = items.map(item => [
                item.id,
                item.name,
                item.company || '',
                item.address?.street || '',
                item.address?.city || '',
                item.address?.state || '',
                item.address?.zipCode || '',
                item.address?.country || '',
                item.phone || '',
                item.email || '',
                item.notes || ''
            ]);

            return this.convertToCSV([headers, ...rows]);
        } else if (entityType === 'shipments') {
            const headers = ['ID', 'Tracking', 'Corriere', 'Stato', 'Data Spedizione', 'Consegna Prevista', 'Destinatario', 'Costo'];
            const rows = items.map(item => {
                const destination = this.getById('destinations', item.destinationId);
                return [
                    item.id,
                    item.trackingNumber,
                    item.carrier,
                    item.status,
                    item.shipDate,
                    item.expectedDelivery || '',
                    destination?.name || '',
                    item.cost || ''
                ];
            });

            return this.convertToCSV([headers, ...rows]);
        }

        return '';
    }

    convertToCSV(data) {
        return data.map(row =>
            row.map(cell => {
                const cellStr = String(cell || '');
                return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
                    ? `"${cellStr.replace(/"/g, '""')}"`
                    : cellStr;
            }).join(',')
        ).join('\n');
    }

    clearAll() {
        localStorage.removeItem(this.keys.destinations);
        localStorage.removeItem(this.keys.shipments);
        this.initializeStorage();
        this.notifyUpdate();
    }

    getSettings() {
        try {
            const settings = localStorage.getItem(this.keys.settings);
            return settings ? JSON.parse(settings) : {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem(this.keys.settings, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    getStats() {
        const destinations = this.getAll('destinations');
        const shipments = this.getAll('shipments');

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const shipmentsThisMonth = shipments.filter(s =>
            new Date(s.createdAt) >= thisMonth
        );

        const shipmentsThisWeek = shipments.filter(s =>
            new Date(s.createdAt) >= thisWeek
        );

        const activeShipments = shipments.filter(s =>
            s.status === 'pending' || s.status === 'in-transit'
        );

        const deliveredShipments = shipments.filter(s =>
            s.status === 'delivered'
        );

        const totalCost = shipments.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
        const costThisMonth = shipmentsThisMonth.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);

        const statusCounts = shipments.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {});

        const carrierCounts = shipments.reduce((acc, s) => {
            acc[s.carrier] = (acc[s.carrier] || 0) + 1;
            return acc;
        }, {});

        return {
            totalDestinations: destinations.length,
            totalShipments: shipments.length,
            shipmentsThisMonth: shipmentsThisMonth.length,
            shipmentsThisWeek: shipmentsThisWeek.length,
            activeShipments: activeShipments.length,
            deliveredShipments: deliveredShipments.length,
            totalCost,
            costThisMonth,
            statusCounts,
            carrierCounts
        };
    }

    saveAll(entityType, items) {
        const key = this.keys[entityType];
        if (!key) {
            throw new Error(`Invalid entity type: ${entityType}`);
        }

        localStorage.setItem(key, JSON.stringify(items));
    }

    notifyUpdate() {
        const event = new CustomEvent('data-updated');
        window.dispatchEvent(event);
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
