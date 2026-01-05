import { formatters } from '../utils/formatters.js';

export class Dashboard {
    constructor(container, storage) {
        this.container = container;
        this.storage = storage;
    }

    render() {
        const stats = this.storage.getStats();
        const shipments = this.storage.getAll('shipments');
        const recentShipments = shipments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-description">Panoramica generale delle tue spedizioni</p>
                </div>
            </div>

            <div class="stats-cards">
                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-title">Spedizioni Totali</span>
                        <div class="stats-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stats-card-value">${stats.totalShipments}</div>
                    <div class="stats-card-footer">
                        <span>${stats.shipmentsThisMonth} questo mese</span>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-title">In Transito</span>
                        <div class="stats-card-icon" style="background-color: var(--color-info-light); color: var(--color-info);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stats-card-value">${stats.activeShipments}</div>
                    <div class="stats-card-footer">
                        <span>Spedizioni attive</span>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-title">Consegnate</span>
                        <div class="stats-card-icon" style="background-color: var(--color-success-light); color: var(--color-success);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stats-card-value">${stats.deliveredShipments}</div>
                    <div class="stats-card-footer">
                        <span>Completate con successo</span>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-card-title">Costo Totale</span>
                        <div class="stats-card-icon" style="background-color: var(--color-warning-light); color: var(--color-warning);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stats-card-value">${formatters.currency(stats.totalCost)}</div>
                    <div class="stats-card-footer">
                        <span>${formatters.currency(stats.costThisMonth)} questo mese</span>
                    </div>
                </div>
            </div>

            <div class="card-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Distribuzione Stati</h2>
                    </div>
                    <div class="card-body">
                        ${this.renderStatusChart(stats.statusCounts)}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Corrieri Più Usati</h2>
                    </div>
                    <div class="card-body">
                        ${this.renderCarrierChart(stats.carrierCounts)}
                    </div>
                </div>
            </div>

            <div class="card mt-lg">
                <div class="card-header">
                    <h2 class="card-title">Spedizioni Recenti</h2>
                    <a href="#/shipments" class="btn btn-secondary">Vedi Tutte</a>
                </div>
                <div class="card-body">
                    ${recentShipments.length > 0
                        ? this.renderRecentShipments(recentShipments)
                        : '<div class="empty-state"><p>Nessuna spedizione recente</p></div>'
                    }
                </div>
            </div>
        `;
    }

    renderStatusChart(statusCounts) {
        if (Object.keys(statusCounts).length === 0) {
            return '<div class="empty-state"><p>Nessun dato disponibile</p></div>';
        }

        const statusLabels = {
            'pending': 'In Attesa',
            'in-transit': 'In Transito',
            'delivered': 'Consegnato',
            'cancelled': 'Annullato'
        };

        const statusColors = {
            'pending': 'var(--color-warning)',
            'in-transit': 'var(--color-info)',
            'delivered': 'var(--color-success)',
            'cancelled': 'var(--color-danger)'
        };

        const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

        return `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${Object.entries(statusCounts).map(([status, count]) => {
                    const percentage = ((count / total) * 100).toFixed(0);
                    return `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                                <span style="font-size: var(--font-size-sm); color: var(--color-text);">
                                    ${statusLabels[status] || status}
                                </span>
                                <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text);">
                                    ${count} (${percentage}%)
                                </span>
                            </div>
                            <div style="height: 8px; background-color: var(--color-bg-dark); border-radius: var(--radius-full); overflow: hidden;">
                                <div style="height: 100%; width: ${percentage}%; background-color: ${statusColors[status] || 'var(--color-primary)'}; border-radius: var(--radius-full);"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderCarrierChart(carrierCounts) {
        if (Object.keys(carrierCounts).length === 0) {
            return '<div class="empty-state"><p>Nessun dato disponibile</p></div>';
        }

        const total = Object.values(carrierCounts).reduce((sum, count) => sum + count, 0);
        const sortedCarriers = Object.entries(carrierCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${sortedCarriers.map(([carrier, count]) => {
                    const percentage = ((count / total) * 100).toFixed(0);
                    return `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                                <span style="font-size: var(--font-size-sm); color: var(--color-text);">
                                    ${carrier}
                                </span>
                                <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text);">
                                    ${count} (${percentage}%)
                                </span>
                            </div>
                            <div style="height: 8px; background-color: var(--color-bg-dark); border-radius: var(--radius-full); overflow: hidden;">
                                <div style="height: 100%; width: ${percentage}%; background-color: var(--color-primary); border-radius: var(--radius-full);"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderRecentShipments(shipments) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tracking</th>
                            <th>Corriere</th>
                            <th>Destinatario</th>
                            <th>Stato</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${shipments.map(shipment => {
                            const destination = this.storage.getById('destinations', shipment.destinationId);
                            return `
                                <tr>
                                    <td style="font-weight: 500; color: var(--color-text);">${shipment.trackingNumber}</td>
                                    <td>${shipment.carrier}</td>
                                    <td>${destination?.name || 'N/A'}</td>
                                    <td><span class="badge ${this.getStatusClass(shipment.status)}">${this.getStatusLabel(shipment.status)}</span></td>
                                    <td>${formatters.date(shipment.shipDate)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'In Attesa',
            'in-transit': 'In Transito',
            'delivered': 'Consegnato',
            'cancelled': 'Annullato'
        };
        return labels[status] || status;
    }

    getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'in-transit': 'status-in-transit',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'badge-primary';
    }

    refresh() {
        this.render();
    }

    destroy() {
    }
}
