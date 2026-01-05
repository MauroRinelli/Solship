import { StorageService } from './services/StorageService.js';
import { Dashboard } from './components/Dashboard.js';
import { DestinationList } from './components/DestinationList.js';
import { ShipmentList } from './components/ShipmentList.js';

class App {
    constructor() {
        this.storage = new StorageService();
        this.currentComponent = null;
        this.container = document.getElementById('app-container');
        this.routes = {
            '/dashboard': Dashboard,
            '/destinations': DestinationList,
            '/shipments': ShipmentList,
            '/reports': Dashboard
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMobileNav();
        this.updateStats();
        this.navigate(window.location.hash || '#/dashboard');
    }

    setupEventListeners() {
        window.addEventListener('hashchange', () => {
            this.navigate(window.location.hash);
        });

        const searchInput = document.getElementById('global-search');
        searchInput.addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        const menuToggle = document.getElementById('menu-toggle');
        menuToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        const newShipmentBtn = document.getElementById('btn-new-shipment');
        newShipmentBtn.addEventListener('click', () => {
            window.location.hash = '#/shipments';
            setTimeout(() => {
                const event = new CustomEvent('new-shipment');
                window.dispatchEvent(event);
            }, 100);
        });

        const newDestinationBtn = document.getElementById('btn-new-destination');
        newDestinationBtn.addEventListener('click', () => {
            window.location.hash = '#/destinations';
            setTimeout(() => {
                const event = new CustomEvent('new-destination');
                window.dispatchEvent(event);
            }, 100);
        });

        const modalClose = document.getElementById('modal-close');
        modalClose.addEventListener('click', () => {
            this.closeModal();
        });

        const modalOverlay = document.getElementById('modal-container');
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeModal();
            }
        });

        window.addEventListener('data-updated', () => {
            this.updateStats();
            if (this.currentComponent && this.currentComponent.refresh) {
                this.currentComponent.refresh();
            }
        });
    }

    setupMobileNav() {
        if (window.innerWidth > 640) return;

        const body = document.querySelector('.app-body');
        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <a href="#/dashboard" class="mobile-nav-link" data-route="dashboard">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
            </a>
            <a href="#/shipments" class="mobile-nav-link" data-route="shipments">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
                </svg>
                Spedizioni
            </a>
            <a href="#/destinations" class="mobile-nav-link" data-route="destinations">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Rubrica
            </a>
            <a href="#/reports" class="mobile-nav-link" data-route="reports">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Report
            </a>
        `;
        body.appendChild(mobileNav);
    }

    navigate(hash) {
        const path = hash.replace('#', '') || '/dashboard';
        const Component = this.routes[path] || this.routes['/dashboard'];

        if (this.currentComponent && this.currentComponent.destroy) {
            this.currentComponent.destroy();
        }

        this.container.innerHTML = '';

        this.currentComponent = new Component(this.container, this.storage);
        this.currentComponent.render();

        this.updateActiveNav(path);
        this.closeSidebar();
    }

    updateActiveNav(path) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${path}`) {
                link.classList.add('active');
            }
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${path}`) {
                link.classList.add('active');
            }
        });
    }

    handleGlobalSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            const event = new CustomEvent('global-search', { detail: { query } });
            window.dispatchEvent(event);
        }, 300);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
    }

    updateStats() {
        const destinations = this.storage.getAll('destinations');
        const shipments = this.storage.getAll('shipments');

        const totalShipments = shipments.length;
        const activeShipments = shipments.filter(s =>
            s.status === 'pending' || s.status === 'in-transit'
        ).length;
        const totalDestinations = destinations.length;

        document.getElementById('stat-total-shipments').textContent = totalShipments;
        document.getElementById('stat-active-shipments').textContent = activeShipments;
        document.getElementById('stat-total-destinations').textContent = totalDestinations;
    }

    openModal(title, content) {
        const modal = document.getElementById('modal-container');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else {
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
        }

        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('modal-container');
        modal.classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' :
                  type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' :
                  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

window.app = new App();
