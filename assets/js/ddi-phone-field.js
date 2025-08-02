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
            this.validationTimeout = null;
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
         * Initialize single phone field
         */
        initSinglePhoneField(field) {
            // Skip if already initialized
            if (field.classList.contains('iti__tel-input') || this.phoneFields.has(field)) {
                return;
            }

            try {
                // Check if field is in popup
                const isPopup = this.isInPopup(field);

                // Remove problematic attributes that conflict with Elementor Pro
                field.removeAttribute('pattern');
                field.removeAttribute('title');

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

                // Add validation with a small delay to avoid conflicts
                setTimeout(() => {
                    this.addValidation(field, phoneNumber);
                }, 100);

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
            field.removeAttribute('title');
            
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
                    field.removeAttribute('title');
                    
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
            
            // Reinitialize
            setTimeout(() => {
                this.initSinglePhoneField(field);
            }, 100);
        }

        /**
         * Add validation to phone field
         */
        addValidation(field, phoneNumber) {
            const self = this;
            const isPopup = this.isInPopup(field);
            let isTyping = false;

            // Add input validation to prevent invalid characters
            field.addEventListener('input', function(e) {
                const value = this.value;
                const phonePattern = /^[\+]?[0-9\(\)\-\s\.]*$/;
                
                // If the new value doesn't match the pattern, revert to the last valid value
                if (!phonePattern.test(value)) {
                    this.value = value.replace(/[^0-9\(\)\-\s\.\+]/g, '');
                }
                
                isTyping = true;
                self.clearValidation(field);
                
                // Reset typing flag after a delay
                setTimeout(() => {
                    isTyping = false;
                }, 200);
            });

            // Only validate on blur, not during typing
            field.addEventListener('blur', function() {
                // Add a small delay to avoid validation during typing
                setTimeout(() => {
                    if (!isTyping) {
                        self.validateField(field, phoneNumber);
                    }
                }, 150);
            });

            // Form submission validation - only for our own forms, not Elementor Pro forms
            const form = field.closest('form');
            if (form && !form.classList.contains('elementor-form')) {
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
            const isElementorForm = field.closest('.elementor-form') !== null;
            
            // For Elementor Pro forms, use permissive but controlled validation
            if (isElementorForm) {
                // Accept only numbers, parentheses, hyphens, spaces, plus sign, and dots
                const phonePattern = /^[\+]?[0-9\(\)\-\s\.]+$/;
                
                if (value !== '' && !phonePattern.test(value)) {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showError(field, container, 'O campo aceita apenas números e caracteres de telefone.');
                    return false;
                }
                
                // If validation passes, show success state
                if (value !== '') {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showSuccess(field, container);
                }
                return true;
            }
            
            // For popups, use a simpler validation
            if (isPopup) {
                // Simplified regex for popups - only check for basic phone characters
                const popupPattern = /^[\+]?[0-9\(\)\-\s\.]+$/;
                
                if (value !== '' && !popupPattern.test(value)) {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showError(field, container, 'O campo aceita apenas números e caracteres de telefone.');
                    return false;
                }
                
                // If validation passes, show success state
                if (value !== '') {
                    const container = field.closest('.iti') || field.parentElement;
                    this.showSuccess(field, container);
                }
                return true;
            }
            
            // For regular fields, use simplified validation
            const phonePattern = /^[\+]?[0-9\s\(\)\-\.]+$/;
            
            const container = field.closest('.iti') || field.parentElement;

            this.clearValidation(field);

            // Basic pattern validation
            if (value !== '' && !phonePattern.test(value)) {
                this.showError(field, container, 'O campo aceita apenas números e caracteres de telefone.');
                return false;
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
                    
                    // Clear any existing validation when country changes
                    this.clearValidation(field);
                    
                    // Prevent event bubbling to avoid conflicts with Elementor
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        }

        /**
         * Update mask for specific country
         */
        updateMaskForCountry(field, countryData) {
            const isPopup = this.isInPopup(field);
            
            // Don't apply validation patterns for popups
            if (isPopup) {
                return;
            }
            
            // Apply country-specific validation patterns
            if (countryData.iso2 === 'br') {
                field.setAttribute('pattern', '^\\+?[0-9]{11,15}$'); // Brazilian pattern
                field.setAttribute('title', 'Número de telefone brasileiro (DDD + 9 dígitos)');
            } else {
                field.setAttribute('pattern', '^\\+?[0-9]{10,15}$'); // International pattern
                field.setAttribute('title', 'Número de telefone internacional (10-15 dígitos)');
            }
        }

        /**
         * Force reinitialize phone fields
         */
        forceReinit() {
            
            // Only reinit if there are uninitialized phone fields
            const phoneFields = document.querySelectorAll('input[type="tel"]');
            let needsReinit = false;
            
            phoneFields.forEach(field => {
                if (!field.classList.contains('iti__tel-input') && !this.phoneFields.has(field)) {
                    needsReinit = true;
                }
            });
            
            if (!needsReinit) {
                return;
            }
            
            // Only destroy fields that are not working properly
            this.phoneFields.forEach((phoneField, field) => {
                if (phoneField && typeof phoneField.destroy === 'function') {
                    // Only destroy if the field is not properly initialized
                    if (!field.classList.contains('iti__tel-input')) {
                        phoneField.destroy();
                        this.phoneFields.delete(field);
                    }
                }
            });
            
            // Remove existing masks only for uninitialized fields
            phoneFields.forEach(field => {
                if (!field.classList.contains('iti__tel-input')) {
                    field.classList.remove('ddi-popup-field');
                }
            });
            
            // Reinitialize only new fields
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
        
        // Listen for Elementor popup events - only reinit if necessary
        $(document).on('elementor/popup/show', function() {
            setTimeout(() => {
                if (window.ddiPhoneField) {
                    // Only reinit if there are phone fields in the popup
                    const popup = document.querySelector('.elementor-popup-modal');
                    if (popup && popup.querySelector('input[type="tel"]')) {
                        window.ddiPhoneField.forceReinit();
                    }
                }
            }, 300);
        });
        
        // Listen for Elementor popup hide
        $(document).on('elementor/popup/hide', function() {
            if (window.ddiPhoneField) {
                window.ddiPhoneField.cleanupPopupFields();
            }
        });

        // Listen for Elementor popup open - only reinit if necessary
        $(document).on('elementor/popup/open', function() {
            setTimeout(() => {
                if (window.ddiPhoneField) {
                    // Only reinit if there are phone fields in the popup
                    const popup = document.querySelector('.elementor-popup-modal');
                    if (popup && popup.querySelector('input[type="tel"]')) {
                        window.ddiPhoneField.forceReinit();
                    }
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