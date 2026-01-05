export const validators = {
    required(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return !isNaN(value);
        return true;
    },

    email(value) {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    phone(value) {
        if (!value) return true;
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 6;
    },

    zipCode(value) {
        if (!value) return true;
        const zipRegex = /^\d{5}$/;
        return zipRegex.test(value);
    },

    trackingNumber(value) {
        if (!value) return false;
        return value.length >= 8 && value.length <= 30;
    },

    number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    positiveNumber(value) {
        return validators.number(value) && parseFloat(value) > 0;
    },

    nonNegativeNumber(value) {
        return validators.number(value) && parseFloat(value) >= 0;
    },

    minLength(value, min) {
        if (!value) return false;
        return value.length >= min;
    },

    maxLength(value, max) {
        if (!value) return true;
        return value.length <= max;
    },

    date(value) {
        if (!value) return true;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    },

    futureDate(value) {
        if (!value) return true;
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    },

    pastDate(value) {
        if (!value) return true;
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
    },

    url(value) {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }
};

export function validateForm(formData, rules) {
    const errors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = formData[field];

        for (const [ruleName, ruleValue] of Object.entries(fieldRules)) {
            if (ruleName === 'message') continue;

            let isValid = true;

            switch (ruleName) {
                case 'required':
                    if (ruleValue) {
                        isValid = validators.required(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'Questo campo è obbligatorio';
                        }
                    }
                    break;

                case 'email':
                    if (ruleValue) {
                        isValid = validators.email(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'Email non valida';
                        }
                    }
                    break;

                case 'phone':
                    if (ruleValue) {
                        isValid = validators.phone(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'Telefono non valido';
                        }
                    }
                    break;

                case 'zipCode':
                    if (ruleValue) {
                        isValid = validators.zipCode(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'CAP non valido';
                        }
                    }
                    break;

                case 'minLength':
                    isValid = validators.minLength(value, ruleValue);
                    if (!isValid) {
                        errors[field] = fieldRules.message || `Lunghezza minima: ${ruleValue} caratteri`;
                    }
                    break;

                case 'maxLength':
                    isValid = validators.maxLength(value, ruleValue);
                    if (!isValid) {
                        errors[field] = fieldRules.message || `Lunghezza massima: ${ruleValue} caratteri`;
                    }
                    break;

                case 'positiveNumber':
                    if (ruleValue) {
                        isValid = validators.positiveNumber(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'Deve essere un numero positivo';
                        }
                    }
                    break;

                case 'nonNegativeNumber':
                    if (ruleValue) {
                        isValid = validators.nonNegativeNumber(value);
                        if (!isValid) {
                            errors[field] = fieldRules.message || 'Deve essere un numero non negativo';
                        }
                    }
                    break;
            }

            if (!isValid) break;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
