export const formatters = {
    date(dateString, format = 'short') {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date)) return '-';

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            long: { day: '2-digit', month: 'long', year: 'numeric' },
            medium: { day: '2-digit', month: 'short', year: 'numeric' }
        };

        return date.toLocaleDateString('it-IT', options[format] || options.short);
    },

    dateTime(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date)) return '-';

        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    phone(phoneString) {
        if (!phoneString) return '-';

        const cleaned = phoneString.replace(/\D/g, '');

        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }

        if (cleaned.length > 10) {
            return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }

        return phoneString;
    },

    currency(amount, currency = 'EUR') {
        if (amount === null || amount === undefined || isNaN(amount)) return '-';

        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    number(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) return '-';

        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    weight(value, unit = 'kg') {
        if (!value || isNaN(value)) return '-';

        return `${formatters.number(value, 2)} ${unit}`;
    },

    dimensions(dimensions) {
        if (!dimensions || !dimensions.length || !dimensions.width || !dimensions.height) {
            return '-';
        }

        const { length, width, height, unit = 'cm' } = dimensions;
        return `${length} × ${width} × ${height} ${unit}`;
    },

    address(address) {
        if (!address) return '-';

        const parts = [];

        if (address.street) parts.push(address.street);
        if (address.city) {
            const cityPart = [address.city, address.state].filter(Boolean).join(', ');
            parts.push(cityPart);
        }
        if (address.zipCode) parts.push(address.zipCode);
        if (address.country) parts.push(address.country);

        return parts.length > 0 ? parts.join(', ') : '-';
    },

    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;

        return text.substring(0, maxLength) + '...';
    },

    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    percentage(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) return '-';

        return `${formatters.number(value, decimals)}%`;
    },

    relativeTime(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date)) return '-';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ora';
        if (diffMins < 60) return `${diffMins} minuti fa`;
        if (diffHours < 24) return `${diffHours} ore fa`;
        if (diffDays < 7) return `${diffDays} giorni fa`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
        return `${Math.floor(diffDays / 365)} anni fa`;
    },

    fileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return formatters.number(bytes / Math.pow(k, i), 2) + ' ' + sizes[i];
    }
};

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}
