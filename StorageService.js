export class StorageService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.prefix = 'shipment-manager:';
        this.keys = {
            destinations: `${this.prefix}destinations`,
            shipments: `${this.prefix}shipments`,
            settings: `${this.prefix}settings`
        };

        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize settings in localStorage (settings remain local)
        if (!localStorage.getItem(this.keys.settings)) {
            localStorage.setItem(this.keys.settings, JSON.stringify({
                theme: 'light',
                currency: 'EUR',
                weightUnit: 'kg',
                dimensionUnit: 'cm'
            }));
        }
    }

    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getAll(entityType) {
        try {
            if (entityType === 'settings') {
                return this.getSettings();
            }

            const endpoint = `/${entityType}`;
            const response = await this.apiRequest(endpoint);
            return response.data || [];
        } catch (error) {
            console.error(`Error getting all ${entityType}:`, error);
            return [];
        }
    }

    async getById(entityType, id) {
        try {
            if (entityType === 'settings') {
                return this.getSettings();
            }

            const endpoint = `/${entityType}/${id}`;
            const response = await this.apiRequest(endpoint);
            return response.data || null;
        } catch (error) {
            console.error(`Error getting ${entityType} by id:`, error);
            return null;
        }
    }

    async create(entityType, data) {
        try {
            const endpoint = `/${entityType}`;
            const response = await this.apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            this.notifyUpdate();
            return response.data;
        } catch (error) {
            console.error(`Error creating ${entityType}:`, error);
            throw error;
        }
    }

    async update(entityType, id, data) {
        try {
            const endpoint = `/${entityType}/${id}`;
            const response = await this.apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            this.notifyUpdate();
            return response.data;
        } catch (error) {
            console.error(`Error updating ${entityType}:`, error);
            throw error;
        }
    }

    async delete(entityType, id) {
        try {
            const endpoint = `/${entityType}/${id}`;
            await this.apiRequest(endpoint, {
                method: 'DELETE'
            });

            this.notifyUpdate();
            return true;
        } catch (error) {
            console.error(`Error deleting ${entityType}:`, error);
            throw error;
        }
    }

    async search(entityType, query) {
        try {
            if (!query || query.trim() === '') {
                return await this.getAll(entityType);
            }

            const endpoint = `/${entityType}?q=${encodeURIComponent(query)}`;
            const response = await this.apiRequest(endpoint);
            return response.data || [];
        } catch (error) {
            console.error(`Error searching ${entityType}:`, error);
            return [];
        }
    }

    filter(items, criteria) {
        // Client-side filtering (same as before)
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

    async exportData() {
        try {
            const destinations = await this.getAll('destinations');
            const shipments = await this.getAll('shipments');

            const data = {
                destinations,
                shipments,
                settings: this.getSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            // Import destinations
            if (data.destinations && Array.isArray(data.destinations)) {
                for (const dest of data.destinations) {
                    await this.create('destinations', dest);
                }
            }

            // Import shipments
            if (data.shipments && Array.isArray(data.shipments)) {
                for (const ship of data.shipments) {
                    await this.create('shipments', ship);
                }
            }

            // Import settings (local)
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

    async exportToCSV(entityType) {
        try {
            const items = await this.getAll(entityType);

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
                const rows = items.map(item => [
                    item.id,
                    item.trackingNumber,
                    item.carrier,
                    item.status,
                    item.shipDate,
                    item.expectedDelivery || '',
                    item.destination?.name || '',
                    item.cost || ''
                ]);

                return this.convertToCSV([headers, ...rows]);
            }

            return '';
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
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

    async clearAll() {
        try {
            // This would require a special endpoint to clear all data
            // For now, we'll just clear local settings
            localStorage.removeItem(this.keys.settings);
            this.initializeStorage();
            this.notifyUpdate();
        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
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

    async getStats() {
        try {
            const response = await this.apiRequest('/shipments/stats');
            return response.data;
        } catch (error) {
            console.error('Error getting stats:', error);

            // Fallback to client-side calculation
            const destinations = await this.getAll('destinations');
            const shipments = await this.getAll('shipments');

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
    }

    notifyUpdate() {
        const event = new CustomEvent('data-updated');
        window.dispatchEvent(event);
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
