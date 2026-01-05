import { Destination } from '../models/Destination.js';
import { formatters, escapeHtml } from '../utils/formatters.js';

export class DestinationList {
    constructor(container, storage) {
        this.container = container;
        this.storage = storage;
        this.searchQuery = '';
        this.sortBy = 'name';
        this.sortDirection = 'asc';

        window.addEventListener('new-destination', () => this.showForm());
        window.addEventListener('global-search', (e) => {
            this.searchQuery = e.detail.query;
            this.render();
        });
    }

    render() {
        let destinations = this.storage.getAll('destinations');

        if (this.searchQuery) {
            destinations = this.storage.search('destinations', this.searchQuery);
        }

        destinations = this.storage.sort(destinations, this.sortBy, this.sortDirection);

        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Rubrica Destinatari</h1>
                    <p class="page-description">Gestisci i tuoi destinatari abituali</p>
                </div>
                <button class="btn btn-primary" id="btn-add-destination">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nuovo Destinatario
                </button>
            </div>

            <div class="filter-bar">
                <div class="filter-group">
                    <label class="filter-label">Ordina per:</label>
                    <select class="form-select filter-select" id="sort-by">
                        <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Nome</option>
                        <option value="company" ${this.sortBy === 'company' ? 'selected' : ''}>Azienda</option>
                        <option value="usageCount" ${this.sortBy === 'usageCount' ? 'selected' : ''}>Più Usati</option>
                        <option value="createdAt" ${this.sortBy === 'createdAt' ? 'selected' : ''}>Data Creazione</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Direzione:</label>
                    <select class="form-select filter-select" id="sort-direction">
                        <option value="asc" ${this.sortDirection === 'asc' ? 'selected' : ''}>Crescente</option>
                        <option value="desc" ${this.sortDirection === 'desc' ? 'selected' : ''}>Decrescente</option>
                    </select>
                </div>
                <div style="flex: 1;"></div>
                <button class="btn btn-secondary" id="btn-export-csv">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Esporta CSV
                </button>
            </div>

            ${destinations.length > 0
                ? `<div class="card-grid">${destinations.map(d => this.renderDestinationCard(d)).join('')}</div>`
                : this.renderEmptyState()
            }
        `;

        this.attachEventListeners();
    }

    renderDestinationCard(destination) {
        const shipments = this.storage.getAll('shipments')
            .filter(s => s.destinationId === destination.id);

        return `
            <div class="card destination-card">
                ${destination.usageCount > 0 ? `<div class="usage-badge">${destination.usageCount} spedizioni</div>` : ''}
                <div class="card-body">
                    <div class="destination-card-header">
                        <div>
                            <div class="destination-name">${escapeHtml(destination.name)}</div>
                            ${destination.company ? `<div class="destination-company">${escapeHtml(destination.company)}</div>` : ''}
                        </div>
                        <div class="destination-actions">
                            <button class="action-btn action-btn-primary" data-action="edit" data-id="${destination.id}" title="Modifica">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="action-btn action-btn-danger" data-action="delete" data-id="${destination.id}" title="Elimina">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="destination-info">
                        ${destination.address.street || destination.address.city ? `
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span>${formatters.address(destination.address)}</span>
                            </div>
                        ` : ''}

                        ${destination.phone ? `
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <span>${formatters.phone(destination.phone)}</span>
                            </div>
                        ` : ''}

                        ${destination.email ? `
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <span>${destination.email}</span>
                            </div>
                        ` : ''}

                        ${destination.notes ? `
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                <span>${formatters.truncate(destination.notes, 60)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h2 class="empty-state-title">Nessun Destinatario</h2>
                <p class="empty-state-description">Inizia aggiungendo il tuo primo destinatario abituale</p>
                <button class="btn btn-primary" id="btn-add-first-destination">Aggiungi Destinatario</button>
            </div>
        `;
    }

    attachEventListeners() {
        const addBtn = document.getElementById('btn-add-destination');
        const addFirstBtn = document.getElementById('btn-add-first-destination');
        const sortBySelect = document.getElementById('sort-by');
        const sortDirectionSelect = document.getElementById('sort-direction');
        const exportBtn = document.getElementById('btn-export-csv');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.showForm());
        }

        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => this.showForm());
        }

        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.render();
            });
        }

        if (sortDirectionSelect) {
            sortDirectionSelect.addEventListener('change', (e) => {
                this.sortDirection = e.target.value;
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
                this.deleteDestination(id);
            });
        });
    }

    showForm(id = null) {
        const destination = id ? this.storage.getById('destinations', id) : null;
        const isEdit = !!destination;

        const formHtml = `
            <form id="destination-form">
                <div class="form-group">
                    <label class="form-label required">Nome</label>
                    <input type="text" class="form-input" name="name" value="${destination?.name || ''}" required>
                    <span class="form-error" id="error-name"></span>
                </div>

                <div class="form-group">
                    <label class="form-label">Azienda</label>
                    <input type="text" class="form-input" name="company" value="${destination?.company || ''}">
                </div>

                <div class="form-group">
                    <label class="form-label">Via</label>
                    <input type="text" class="form-input" name="street" value="${destination?.address?.street || ''}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Città</label>
                        <input type="text" class="form-input" name="city" value="${destination?.address?.city || ''}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Provincia</label>
                        <input type="text" class="form-input" name="state" value="${destination?.address?.state || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">CAP</label>
                        <input type="text" class="form-input" name="zipCode" value="${destination?.address?.zipCode || ''}">
                        <span class="form-error" id="error-zipCode"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Paese</label>
                        <input type="text" class="form-input" name="country" value="${destination?.address?.country || 'Italia'}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telefono</label>
                        <input type="tel" class="form-input" name="phone" value="${destination?.phone || ''}">
                        <span class="form-error" id="error-phone"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" value="${destination?.email || ''}">
                        <span class="form-error" id="error-email"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Note</label>
                    <textarea class="form-textarea" name="notes">${destination?.notes || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-form">Annulla</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Salva Modifiche' : 'Aggiungi Destinatario'}</button>
                </div>
            </form>
        `;

        window.app.openModal(isEdit ? 'Modifica Destinatario' : 'Nuovo Destinatario', formHtml);

        const form = document.getElementById('destination-form');
        const cancelBtn = document.getElementById('btn-cancel-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDestination(new FormData(form), id);
        });

        cancelBtn.addEventListener('click', () => {
            window.app.closeModal();
        });
    }

    saveDestination(formData, id = null) {
        const data = {
            name: formData.get('name'),
            company: formData.get('company'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            },
            phone: formData.get('phone'),
            email: formData.get('email'),
            notes: formData.get('notes')
        };

        const destination = new Destination(data);
        const validation = destination.validate();

        if (!validation.isValid) {
            Object.entries(validation.errors).forEach(([field, message]) => {
                const errorEl = document.getElementById(`error-${field}`);
                if (errorEl) {
                    errorEl.textContent = message;
                }
            });
            return;
        }

        try {
            if (id) {
                this.storage.update('destinations', id, destination.toJSON());
                window.app.showToast('Destinatario aggiornato con successo', 'success');
            } else {
                this.storage.create('destinations', destination.toJSON());
                window.app.showToast('Destinatario aggiunto con successo', 'success');
            }

            window.app.closeModal();
            this.render();
        } catch (error) {
            window.app.showToast('Errore nel salvare il destinatario', 'error');
            console.error(error);
        }
    }

    deleteDestination(id) {
        const destination = this.storage.getById('destinations', id);
        const shipments = this.storage.getAll('shipments').filter(s => s.destinationId === id);

        if (shipments.length > 0) {
            if (!confirm(`Questo destinatario ha ${shipments.length} spedizioni associate. Vuoi eliminarlo comunque?`)) {
                return;
            }
        } else {
            if (!confirm(`Vuoi eliminare "${destination.name}"?`)) {
                return;
            }
        }

        try {
            this.storage.delete('destinations', id);
            window.app.showToast('Destinatario eliminato con successo', 'success');
            this.render();
        } catch (error) {
            window.app.showToast('Errore nell\'eliminare il destinatario', 'error');
            console.error(error);
        }
    }

    exportToCSV() {
        const csv = this.storage.exportToCSV('destinations');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `destinatari_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        window.app.showToast('CSV esportato con successo', 'success');
    }

    refresh() {
        this.render();
    }

    destroy() {
        window.removeEventListener('new-destination', this.showForm);
        window.removeEventListener('global-search', this.handleSearch);
    }
}
