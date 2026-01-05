import { Shipment } from '../models/Shipment.js';
import { formatters, escapeHtml } from '../utils/formatters.js';

export class ShipmentList {
    constructor(container, storage) {
        this.container = container;
        this.storage = storage;
        this.searchQuery = '';
        this.filters = {
            status: '',
            carrier: '',
            dateFrom: '',
            dateTo: ''
        };
        this.sortBy = 'shipDate';
        this.sortDirection = 'desc';

        window.addEventListener('new-shipment', () => this.showForm());
        window.addEventListener('global-search', (e) => {
            this.searchQuery = e.detail.query;
            this.render();
        });
    }

    render() {
        let shipments = this.storage.getAll('shipments');

        if (this.searchQuery) {
            shipments = this.storage.search('shipments', this.searchQuery);
        }

        shipments = this.applyFilters(shipments);
        shipments = this.storage.sort(shipments, this.sortBy, this.sortDirection);

        const carriers = [...new Set(this.storage.getAll('shipments').map(s => s.carrier))].filter(Boolean);

        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Gestione Spedizioni</h1>
                    <p class="page-description">Traccia e gestisci tutte le tue spedizioni</p>
                </div>
                <button class="btn btn-primary" id="btn-add-shipment">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nuova Spedizione
                </button>
            </div>

            <div class="filter-bar">
                <div class="filter-group">
                    <label class="filter-label">Stato:</label>
                    <select class="form-select filter-select" id="filter-status">
                        <option value="">Tutti</option>
                        <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>In Attesa</option>
                        <option value="in-transit" ${this.filters.status === 'in-transit' ? 'selected' : ''}>In Transito</option>
                        <option value="delivered" ${this.filters.status === 'delivered' ? 'selected' : ''}>Consegnato</option>
                        <option value="cancelled" ${this.filters.status === 'cancelled' ? 'selected' : ''}>Annullato</option>
                    </select>
                </div>

                ${carriers.length > 0 ? `
                    <div class="filter-group">
                        <label class="filter-label">Corriere:</label>
                        <select class="form-select filter-select" id="filter-carrier">
                            <option value="">Tutti</option>
                            ${carriers.map(c => `<option value="${c}" ${this.filters.carrier === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                ` : ''}

                <div class="filter-group">
                    <label class="filter-label">Ordina:</label>
                    <select class="form-select filter-select" id="sort-by">
                        <option value="shipDate" ${this.sortBy === 'shipDate' ? 'selected' : ''}>Data Spedizione</option>
                        <option value="trackingNumber" ${this.sortBy === 'trackingNumber' ? 'selected' : ''}>Tracking</option>
                        <option value="carrier" ${this.sortBy === 'carrier' ? 'selected' : ''}>Corriere</option>
                        <option value="status" ${this.sortBy === 'status' ? 'selected' : ''}>Stato</option>
                    </select>
                </div>

                <button class="btn btn-secondary" id="btn-export-csv">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Esporta CSV
                </button>
            </div>

            ${shipments.length > 0
                ? this.renderTable(shipments)
                : this.renderEmptyState()
            }
        `;

        this.attachEventListeners();
    }

    renderTable(shipments) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tracking</th>
                            <th>Corriere</th>
                            <th>Destinatario</th>
                            <th>Data Spedizione</th>
                            <th>Consegna Prevista</th>
                            <th>Stato</th>
                            <th>Costo</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${shipments.map(s => this.renderShipmentRow(s)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderShipmentRow(shipment) {
        const destination = this.storage.getById('destinations', shipment.destinationId);
        const shipmentObj = new Shipment(shipment);
        const isLate = shipmentObj.isLate();

        return `
            <tr>
                <td style="font-weight: 600; color: var(--color-text);">
                    ${escapeHtml(shipment.trackingNumber)}
                    ${isLate ? '<span class="badge badge-danger" style="margin-left: var(--spacing-xs);">In Ritardo</span>' : ''}
                </td>
                <td>${escapeHtml(shipment.carrier)}</td>
                <td>${destination ? escapeHtml(destination.name) : 'N/A'}</td>
                <td>${formatters.date(shipment.shipDate)}</td>
                <td>${shipment.expectedDelivery ? formatters.date(shipment.expectedDelivery) : '-'}</td>
                <td>
                    <select class="form-select" style="padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-sm);" data-shipment-id="${shipment.id}" data-action="change-status">
                        <option value="pending" ${shipment.status === 'pending' ? 'selected' : ''}>In Attesa</option>
                        <option value="in-transit" ${shipment.status === 'in-transit' ? 'selected' : ''}>In Transito</option>
                        <option value="out-for-delivery" ${shipment.status === 'out-for-delivery' ? 'selected' : ''}>In Consegna</option>
                        <option value="delivered" ${shipment.status === 'delivered' ? 'selected' : ''}>Consegnato</option>
                        <option value="failed-delivery" ${shipment.status === 'failed-delivery' ? 'selected' : ''}>Consegna Fallita</option>
                        <option value="cancelled" ${shipment.status === 'cancelled' ? 'selected' : ''}>Annullato</option>
                    </select>
                </td>
                <td>${shipment.cost ? formatters.currency(shipment.cost, shipment.currency) : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn action-btn-primary" data-action="edit" data-id="${shipment.id}" title="Modifica">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn action-btn-danger" data-action="delete" data-id="${shipment.id}" title="Elimina">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
                </svg>
                <h2 class="empty-state-title">Nessuna Spedizione</h2>
                <p class="empty-state-description">Inizia tracciando la tua prima spedizione</p>
                <button class="btn btn-primary" id="btn-add-first-shipment">Nuova Spedizione</button>
            </div>
        `;
    }

    attachEventListeners() {
        const addBtn = document.getElementById('btn-add-shipment');
        const addFirstBtn = document.getElementById('btn-add-first-shipment');
        const filterStatus = document.getElementById('filter-status');
        const filterCarrier = document.getElementById('filter-carrier');
        const sortBySelect = document.getElementById('sort-by');
        const exportBtn = document.getElementById('btn-export-csv');

        if (addBtn) addBtn.addEventListener('click', () => this.showForm());
        if (addFirstBtn) addFirstBtn.addEventListener('click', () => this.showForm());

        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.render();
            });
        }

        if (filterCarrier) {
            filterCarrier.addEventListener('change', (e) => {
                this.filters.carrier = e.target.value;
                this.render();
            });
        }

        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.render();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.showForm(id);
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.deleteShipment(id);
            });
        });

        document.querySelectorAll('[data-action="change-status"]').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.currentTarget.getAttribute('data-shipment-id');
                const newStatus = e.target.value;
                this.updateStatus(id, newStatus);
            });
        });
    }

    showForm(id = null) {
        const shipment = id ? this.storage.getById('shipments', id) : null;
        const destinations = this.storage.getAll('destinations');
        const isEdit = !!shipment;

        if (destinations.length === 0) {
            window.app.showToast('Devi prima aggiungere almeno un destinatario', 'warning');
            window.location.hash = '#/destinations';
            return;
        }

        const formHtml = `
            <form id="shipment-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Numero Tracking</label>
                        <input type="text" class="form-input" name="trackingNumber" value="${shipment?.trackingNumber || ''}" required>
                        <span class="form-error" id="error-trackingNumber"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label required">Corriere</label>
                        <input type="text" class="form-input" name="carrier" value="${shipment?.carrier || ''}" list="carriers" required>
                        <datalist id="carriers">
                            <option value="DHL">
                            <option value="UPS">
                            <option value="FedEx">
                            <option value="Poste Italiane">
                            <option value="BRT">
                            <option value="GLS">
                        </datalist>
                        <span class="form-error" id="error-carrier"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label required">Destinatario</label>
                    <select class="form-select" name="destinationId" required>
                        <option value="">Seleziona destinatario</option>
                        ${destinations.map(d => `
                            <option value="${d.id}" ${shipment?.destinationId === d.id ? 'selected' : ''}>
                                ${d.name}${d.company ? ` (${d.company})` : ''}
                            </option>
                        `).join('')}
                    </select>
                    <span class="form-error" id="error-destinationId"></span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label required">Data Spedizione</label>
                        <input type="date" class="form-input" name="shipDate" value="${shipment?.shipDate || new Date().toISOString().split('T')[0]}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Consegna Prevista</label>
                        <input type="date" class="form-input" name="expectedDelivery" value="${shipment?.expectedDelivery || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Peso (kg)</label>
                        <input type="number" step="0.01" class="form-input" name="weight" value="${shipment?.weight || ''}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Costo (€)</label>
                        <input type="number" step="0.01" class="form-input" name="cost" value="${shipment?.cost || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Descrizione Articoli</label>
                    <input type="text" class="form-input" name="items" value="${shipment?.items || ''}">
                </div>

                <div class="form-group">
                    <label class="form-label">Note</label>
                    <textarea class="form-textarea" name="notes">${shipment?.notes || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-form">Annulla</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Salva Modifiche' : 'Aggiungi Spedizione'}</button>
                </div>
            </form>
        `;

        window.app.openModal(isEdit ? 'Modifica Spedizione' : 'Nuova Spedizione', formHtml);

        const form = document.getElementById('shipment-form');
        const cancelBtn = document.getElementById('btn-cancel-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveShipment(new FormData(form), id);
        });

        cancelBtn.addEventListener('click', () => {
            window.app.closeModal();
        });
    }

    saveShipment(formData, id = null) {
        const data = {
            trackingNumber: formData.get('trackingNumber'),
            carrier: formData.get('carrier'),
            destinationId: formData.get('destinationId'),
            shipDate: formData.get('shipDate'),
            expectedDelivery: formData.get('expectedDelivery'),
            weight: parseFloat(formData.get('weight')) || 0,
            cost: parseFloat(formData.get('cost')) || 0,
            items: formData.get('items'),
            notes: formData.get('notes')
        };

        const shipment = new Shipment(data);
        const validation = shipment.validate();

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                const errorEl = document.getElementById(`error-${field}`);
                if (errorEl) errorEl.textContent = message;
            });
            return;
        }

        try {
            if (id) {
                this.storage.update('shipments', id, shipment.toJSON());
                window.app.showToast('Spedizione aggiornata con successo', 'success');
            } else {
                this.storage.create('shipments', shipment.toJSON());

                const destination = this.storage.getById('destinations', data.destinationId);
                if (destination) {
                    destination.usageCount = (destination.usageCount || 0) + 1;
                    this.storage.update('destinations', destination.id, destination);
                }

                window.app.showToast('Spedizione aggiunta con successo', 'success');
            }

            window.app.closeModal();
            this.render();
        } catch (error) {
            window.app.showToast('Errore nel salvare la spedizione', 'error');
            console.error(error);
        }
    }

    updateStatus(id, newStatus) {
        try {
            const shipment = this.storage.getById('shipments', id);
            shipment.status = newStatus;
            if (newStatus === 'delivered' && !shipment.actualDelivery) {
                shipment.actualDelivery = new Date().toISOString().split('T')[0];
            }

            this.storage.update('shipments', id, shipment);
            window.app.showToast('Stato aggiornato', 'success');
        } catch (error) {
            window.app.showToast('Errore nell\'aggiornare lo stato', 'error');
            console.error(error);
        }
    }

    deleteShipment(id) {
        const shipment = this.storage.getById('shipments', id);

        if (!confirm(`Vuoi eliminare la spedizione "${shipment.trackingNumber}"?`)) {
            return;
        }

        try {
            this.storage.delete('shipments', id);
            window.app.showToast('Spedizione eliminata con successo', 'success');
            this.render();
        } catch (error) {
            window.app.showToast('Errore nell\'eliminare la spedizione', 'error');
            console.error(error);
        }
    }

    applyFilters(shipments) {
        return shipments.filter(s => {
            if (this.filters.status && s.status !== this.filters.status) return false;
            if (this.filters.carrier && s.carrier !== this.filters.carrier) return false;
            return true;
        });
    }

    exportToCSV() {
        const csv = this.storage.exportToCSV('shipments');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spedizioni_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        window.app.showToast('CSV esportato con successo', 'success');
    }

    refresh() {
        this.render();
    }

    destroy() {
        window.removeEventListener('new-shipment', this.showForm);
    }
}
