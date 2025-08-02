/**
 * DDI Phone Field JavaScript
 * 
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

(function($) {
    'use strict';

    /**
     * DDI Phone Field Class
     */
    class DDIPhoneField {
        constructor() {
            this.phoneFields = new Map();
            this.popupObserver = null;
            this.init();
        }

        /**
         * Initialize the plugin
         */
        init() {
            this.initPhoneFields();
            this.bindEvents();
            this.initPopupObserver();
        }

        /**
         * Initialize phone fields
         */
        initPhoneFields() {
            const phoneInputFields = document.querySelectorAll('input[type="tel"]:not(.iti__tel-input)');
            
            phoneInputFields.forEach((field) => {
                this.initSinglePhoneField(field);
            });
        }

        /**
         * Initialize a single phone field
         */
        initSinglePhoneField(field) {
            // Skip if already initialized
            if (field.classList.contains('iti__tel-input') || this.phoneFields.has(field)) {
                return;
            }

            try {
                // Remove any existing mask
                if (typeof $.fn.mask !== 'undefined') {
                    $(field).unmask();
                }

                // Check if field is in popup
                const isPopup = this.isInPopup(field);

                const phoneNumber = window.intlTelInput(field, {
                    initialCountry: "br",
                    separateDialCode: true,
                    preferredCountries: ["br", "us", "pt", "es", "ar", "mx"],
                    hiddenInput: "full",
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
                    autoHideDialCode: false,
                    autoPlaceholder: "aggressive",
                    formatOnDisplay: true,
                    nationalMode: false,
                    allowDropdown: true,
                    dropdownContainer: document.body,
                    customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
                        return selectedCountryPlaceholder.replace(/[0-9]/g, '0');
                    }
                });

                // Store the phone field
                this.phoneFields.set(field, phoneNumber);

                // Apply mask only for non-popup fields
                if (!isPopup) {
                    this.applyMask(field);
                }

                // Add validation
                this.addValidation(field, phoneNumber);

                // Special handling for popups
                if (isPopup) {
                    this.handlePopupField(field, phoneNumber);
                }

            } catch (error) {
                console.error('Error initializing phone field:', error);
            }
        }

        /**
         * Check if field is in a popup
         */
        isInPopup(field) {
            return field.closest('.elementor-popup-modal') !== null;
        }

        /**
         * Handle phone field in popup
         */
        handlePopupField(field, phoneNumber) {
            // Add popup-specific class
            field.classList.add('ddi-popup-field');
            
            // Remove problematic pattern attribute for popups
            field.removeAttribute('pattern');
            
            // Ensure proper z-index
            const itiContainer = field.closest('.iti');
            if (itiContainer) {
                itiContainer.style.zIndex = '999999';
            }

            // Add click handler to prevent conflicts
            field.addEventListener('click', (e) => {
                e.stopPropagation();
            }, true);

            // Add focus handler
            field.addEventListener('focus', (e) => {
                e.stopPropagation();
                // Ensure dropdown is visible
                setTimeout(() => {
                    if (phoneNumber && typeof phoneNumber.openCountryDropdown === 'function') {
                        phoneNumber.openCountryDropdown();
                    }
                }, 100);
            });
        }

        /**
         * Initialize popup observer
         */
        initPopupObserver() {
            // Watch for popup creation
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Check if it's a popup
                            if (node.classList && node.classList.contains('elementor-popup-modal')) {
                                this.handlePopupOpen(node);
                            }
                            
                            // Check for phone fields in added content
                            const phoneFields = node.querySelectorAll ? node.querySelectorAll('input[type="tel"]') : [];
                            phoneFields.forEach(field => {
                                this.initSinglePhoneField(field);
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.popupObserver = observer;
        }

        /**
         * Handle popup opening
         */
        handlePopupOpen(popup) {
            // Wait for popup to be fully rendered
            setTimeout(() => {
                const phoneFields = popup.querySelectorAll('input[type="tel"]');
                phoneFields.forEach(field => {
                    // Remove problematic pattern attribute
                    field.removeAttribute('pattern');
                    
                    // Force reinitialize popup fields
                    this.forceReinitPopupField(field);
                });
            }, 500);
        }

        /**
         * Force reinitialize a single popup field
         */
        forceReinitPopupField(field) {
            // Remove existing initialization
            if (this.phoneFields.has(field)) {
                const existingPhone = this.phoneFields.get(field);
                if (existingPhone && typeof existingPhone.destroy === 'function') {
                    existingPhone.destroy();
                }
                this.phoneFields.delete(field);
            }

            // Remove existing classes and masks
            field.classList.remove('iti__tel-input', 'ddi-popup-field');
            if (typeof $.fn.mask !== 'undefined') {
                $(field).unmask();
            }

            // Reinitialize
            setTimeout(() => {
                this.initSinglePhoneField(field);
            }, 100);
        }

        /**
         * Apply mask to phone field
         */
        applyMask(field) {
            if (typeof $.fn.mask !== 'undefined') {
                // Remove existing mask first
                $(field).unmask();
                
                // Apply Brazilian phone mask
                $(field).mask('(00) 0000-00009', {
                    onKeyPress: function(val, e, field, options) {
                        field.mask(val.length > 14 ? '(00) 00000-0000' : '(00) 0000-00009', options);
                    },
                    onComplete: function(val) {
                        // Trigger change event for popups
                        if (field.closest('.elementor-popup-modal')) {
                            $(field).trigger('change');
                        }
                    }
                });
            }
        }

        /**
         * Add validation to phone field
         */
        addValidation(field, phoneNumber) {
            const self = this;
            const isPopup = this.isInPopup(field);

            // Only validate on blur, not during typing
            field.addEventListener('blur', function() {
                self.validateField(field, phoneNumber);
            });

            // Clear validation on input to avoid showing errors during typing
            field.addEventListener('input', function() {
                self.clearValidation(field);
            });

            // Form submission validation
            const form = field.closest('form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    if (!self.validateField(field, phoneNumber)) {
                        e.preventDefault();
                        return false;
                    }
                    
                    // Update hidden input with full number if available
                    if (phoneNumber && typeof phoneNumber.getNumber === 'function') {
                        const fullNumber = phoneNumber.getNumber(intlTelInputUtils.numberFormat.E164);
                        if (fullNumber) {
                            field.value = fullNumber;
                        }
                    }
                });
            }
        }

        /**
         * Validate phone field
         */
        validateField(field, phoneNumber) {
            const value = field.value.trim();
            const isPopup = this.isInPopup(field);
            
            // For popups, use a simpler validation without spaces
            if (isPopup) {
                const popupPattern = /^[\+]?[0-9\(\)\-\+\.\#\*\&\=]+$/;
                
                if (value !== '' && !popupPattern.test(value)) {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showError(field, container, 'O campo aceita apenas números e caracteres de telefone (#, -, *, etc).');
                    return false;
                }
                
                // If validation passes, show success state
                if (value !== '') {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showSuccess(field, container);
                }
                return true;
            }
            
            // For regular fields, use standard validation
            const phonePattern = /^[\+]?[0-9\s\(\)\-\+\.\#\*\&\=]+$/;
            
            const container = field.closest('.iti') || field.parentElement;

            this.clearValidation(field);

            // Basic pattern validation
            if (value !== '' && !phonePattern.test(value)) {
                this.showError(field, container, 'O campo aceita apenas números e caracteres de telefone (#, -, *, etc).');
                return false;
            }

            // Only validate if the number seems complete (has enough digits)
            const digitCount = value.replace(/\D/g, '').length;
            if (phoneNumber && typeof phoneNumber.isValidNumber === 'function' && digitCount >= 10) {
                try {
                    const isValid = phoneNumber.isValidNumber();
                    if (!isValid && value !== '') {
                        this.showError(field, container, 'Número de telefone inválido.');
                        return false;
                    }
                } catch (error) {
                    // If validation fails due to incomplete number, don't show error
                    console.log('Phone validation error:', error);
                }
            }

            // If validation passes, show success state
            if (value !== '') {
                this.showSuccess(field, container);
            }

            return true;
        }

        /**
         * Show error state
         */
        showError(field, container, message) {
            container.classList.add('iti--error');
            
            // Add error message
            let errorElement = container.querySelector('.ddi-phone-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'ddi-phone-error';
                errorElement.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
                container.appendChild(errorElement);
            }
            errorElement.textContent = message;
        }

        /**
         * Show success state
         */
        showSuccess(field, container) {
            container.classList.add('iti--success');
            container.classList.remove('iti--error');
            
            // Remove error message
            const errorElement = container.querySelector('.ddi-phone-error');
            if (errorElement) {
                errorElement.remove();
            }
        }

        /**
         * Clear validation state
         */
        clearValidation(field) {
            const container = field.closest('.iti') || field.parentElement;
            container.classList.remove('iti--error', 'iti--success');
            
            const errorElement = container.querySelector('.ddi-phone-error');
            if (errorElement) {
                errorElement.remove();
            }
        }

        /**
         * Bind events
         */
        bindEvents() {
            // Handle dynamic content
            this.handleDynamicContent();
            
            // Handle country change
            this.handleCountryChange();
        }

        /**
         * Handle dynamic content
         */
        handleDynamicContent() {
            // Observer for dynamically added content
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                    let shouldReinit = false;
                    
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === 1 && node.querySelectorAll) {
                                    const phoneFields = node.querySelectorAll('input[type="tel"]');
                                    if (phoneFields.length > 0) {
                                        shouldReinit = true;
                                    }
                                    
                                    // Check for Elementor popups
                                    if (node.classList && node.classList.contains('elementor-popup-modal')) {
                                        shouldReinit = true;
                                    }
                                }
                            });
                        }
                    });
                    
                    if (shouldReinit) {
                        setTimeout(() => {
                            this.initPhoneFields();
                        }, 200);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        /**
         * Handle country change
         */
        handleCountryChange() {
            document.addEventListener('countrychange', (e) => {
                const field = e.target;
                const phoneNumber = this.phoneFields.get(field);
                
                if (phoneNumber) {
                    const countryData = phoneNumber.getSelectedCountryData();
                    // Only update mask for non-popup fields
                    if (!this.isInPopup(field)) {
                        this.updateMaskForCountry(field, countryData);
                    }
                }
            });
        }

        /**
         * Update mask for specific country
         */
        updateMaskForCountry(field, countryData) {
            const isPopup = this.isInPopup(field);
            
            // Don't apply mask for popups
            if (isPopup) {
                return;
            }
            
            if (typeof $.fn.mask !== 'undefined') {
                $(field).unmask();
                
                // Apply country-specific mask
                if (countryData.iso2 === 'br') {
                    $(field).mask('(00) 0000-00009', {
                        onKeyPress: function(val, e, field, options) {
                            field.mask(val.length > 14 ? '(00) 00000-0000' : '(00) 0000-00009', options);
                        },
                        onComplete: function(val) {
                            // Trigger change event for popups
                            if (isPopup) {
                                $(field).trigger('change');
                            }
                        }
                    });
                } else {
                    // For other countries, use a more flexible mask
                    $(field).mask('000000000000000', {
                        onComplete: function(val) {
                            // Trigger change event for popups
                            if (isPopup) {
                                $(field).trigger('change');
                            }
                        }
                    });
                }
            }
        }

        /**
         * Force reinitialize phone fields
         */
        forceReinit() {
            // Destroy existing phone fields
            this.phoneFields.forEach((phoneField, field) => {
                if (phoneField && typeof phoneField.destroy === 'function') {
                    phoneField.destroy();
                }
            });
            this.phoneFields.clear();
            
            // Remove existing masks
            $('input[type="tel"]').unmask();
            
            // Remove existing classes
            $('input[type="tel"]').removeClass('iti__tel-input ddi-popup-field');
            
            // Reinitialize
            setTimeout(() => {
                this.initPhoneFields();
            }, 100);
        }

        /**
         * Get phone field by element
         */
        getPhoneField(element) {
            return this.phoneFields.get(element);
        }

        /**
         * Destroy all phone fields
         */
        destroy() {
            this.phoneFields.forEach((phoneField, field) => {
                if (phoneField && typeof phoneField.destroy === 'function') {
                    phoneField.destroy();
                }
            });
            this.phoneFields.clear();
            
            if (this.popupObserver) {
                this.popupObserver.disconnect();
            }
        }

        /**
         * Clean up popup fields
         */
        cleanupPopupFields() {
            this.phoneFields.forEach((phoneField, field) => {
                if (this.isInPopup(field)) {
                    if (phoneField && typeof phoneField.destroy === 'function') {
                        phoneField.destroy();
                    }
                    this.phoneFields.delete(field);
                }
            });
        }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        // Only initialize once
        if (window.ddiPhoneField) {
            return;
        }
        
        window.ddiPhoneField = new DDIPhoneField();
        
        // Listen for Elementor popup events
        $(document).on('elementor/popup/show', function() {
            setTimeout(() => {
                if (window.ddiPhoneField) {
                    window.ddiPhoneField.forceReinit();
                }
            }, 300);
        });
        
        // Listen for Elementor popup hide
        $(document).on('elementor/popup/hide', function() {
            if (window.ddiPhoneField) {
                window.ddiPhoneField.cleanupPopupFields();
            }
        });

        // Listen for Elementor popup open
        $(document).on('elementor/popup/open', function() {
            setTimeout(() => {
                if (window.ddiPhoneField) {
                    window.ddiPhoneField.forceReinit();
                }
            }, 500);
        });

        // Listen for Elementor popup close
        $(document).on('elementor/popup/close', function() {
            if (window.ddiPhoneField) {
                window.ddiPhoneField.cleanupPopupFields();
            }
        });

        // Additional popup event listeners
        $(document).on('click', '.elementor-popup-modal-close', function() {
            setTimeout(() => {
                if (window.ddiPhoneField) {
                    window.ddiPhoneField.cleanupPopupFields();
                }
            }, 100);
        });

        // Handle ESC key for popup closing
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                setTimeout(() => {
                    if (window.ddiPhoneField) {
                        window.ddiPhoneField.cleanupPopupFields();
                    }
                }, 100);
            }
        });
    });

    // Make it available globally
    window.DDIPhoneField = DDIPhoneField;

})(jQuery); 