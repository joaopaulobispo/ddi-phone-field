/**
 * Elementor Integration JavaScript
 * 
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

(function($) {
    'use strict';

    /**
     * Elementor Integration Class
     */
    class DDIPhoneFieldElementorIntegration {
        constructor() {
            this.init();
        }

        /**
         * Initialize the integration
         */
        init() {
            this.bindElementorEvents();
            this.handleElementorForms();
            this.preventElementorValidationConflicts();
        }

        /**
         * Bind Elementor specific events
         */
        bindElementorEvents() {
            // Listen for Elementor form submission
            $(document).on('submit', '.elementor-form', function(e) {
                const phoneFields = $(this).find('input[type="tel"]');
                let hasErrors = false;

                phoneFields.each(function() {
                    const field = this;
                    const value = $(field).val().trim();
                    
                    // Phone validation for Elementor Pro forms
                    if (value !== '') {
                        const phonePattern = /^[\+]?[0-9\(\)\-\s\.]+$/;
                        if (!phonePattern.test(value)) {
                            hasErrors = true;
                            // Show Elementor Pro style error
                            $(field).addClass('elementor-field-invalid');
                            $(field).removeClass('elementor-field-valid');
                        } else {
                            $(field).removeClass('elementor-field-invalid');
                            $(field).addClass('elementor-field-valid');
                        }
                    }
                });

                if (hasErrors) {
                    e.preventDefault();
                    return false;
                }
            });

            // Clear validation on input
            $(document).on('input', '.elementor-form input[type="tel"]', function() {
                $(this).removeClass('elementor-field-invalid elementor-field-valid');
            });

            // Handle Elementor popup events
            $(document).on('elementor/popup/show', function() {
                setTimeout(() => {
                    if (window.ddiPhoneField) {
                        window.ddiPhoneField.forceReinit();
                    }
                }, 300);
            });

            $(document).on('elementor/popup/hide', function() {
                if (window.ddiPhoneField) {
                    window.ddiPhoneField.cleanupPopupFields();
                }
            });
        }

        /**
         * Handle Elementor forms specifically
         */
        handleElementorForms() {
            // Override Elementor Pro validation for phone fields
            if (typeof elementorFrontend !== 'undefined' && elementorFrontend.hooks) {
                elementorFrontend.hooks.addAction('frontend/element_ready/form.default', function($scope) {
                    const phoneFields = $scope.find('input[type="tel"]');
                    
                    phoneFields.each(function() {
                        const field = this;
                        
                        // Remove Elementor Pro validation attributes
                        $(field).removeAttr('pattern');
                        $(field).removeAttr('title');
                        $(field).removeAttr('data-rule-phone');
                        
                        // Add custom validation
                        $(field).on('blur', function() {
                            const value = $(this).val().trim();
                            
                            if (value !== '') {
                                const phonePattern = /^[\+]?[0-9\(\)\-\s\.]+$/;
                                if (!phonePattern.test(value)) {
                                    $(this).addClass('elementor-field-invalid');
                                    $(this).removeClass('elementor-field-valid');
                                } else {
                                    $(this).removeClass('elementor-field-invalid');
                                    $(this).addClass('elementor-field-valid');
                                }
                            } else {
                                $(this).removeClass('elementor-field-invalid elementor-field-valid');
                            }
                        });
                        
                        // Clear validation on input
                        $(field).on('input', function() {
                            $(this).removeClass('elementor-field-invalid elementor-field-valid');
                        });
                    });
                });
            }
        }

        /**
         * Prevent Elementor validation conflicts
         */
        preventElementorValidationConflicts() {
            // Override Elementor Pro phone validation
            if (typeof elementorFrontend !== 'undefined') {
                // Remove default Elementor Pro phone validation
                $(document).on('DOMNodeInserted', '.elementor-form', function() {
                    const phoneFields = $(this).find('input[type="tel"]');
                    
                    phoneFields.each(function() {
                        const field = this;
                        
                        // Remove problematic attributes
                        $(field).removeAttr('pattern');
                        $(field).removeAttr('title');
                        $(field).removeAttr('data-rule-phone');
                        
                        // Override validation
                        $(field).off('blur.elementorValidation');
                        $(field).off('input.elementorValidation');
                        
                        // Add our own validation
                        $(field).on('blur.ddiValidation', function() {
                            const value = $(this).val().trim();
                            
                            if (value !== '') {
                                const phonePattern = /^[\+]?[0-9\(\)\-\s\.]+$/;
                                if (!phonePattern.test(value)) {
                                    $(this).addClass('elementor-field-invalid');
                                    $(this).removeClass('elementor-field-valid');
                                } else {
                                    $(this).removeClass('elementor-field-invalid');
                                    $(this).addClass('elementor-field-valid');
                                }
                            } else {
                                $(this).removeClass('elementor-field-invalid elementor-field-valid');
                            }
                        });
                        
                        $(field).on('input.ddiValidation', function() {
                            $(this).removeClass('elementor-field-invalid elementor-field-valid');
                        });
                    });
                });
            }
        }

        /**
         * Force reinitialize phone fields in Elementor context
         */
        forceReinit() {
            if (window.ddiPhoneField) {
                window.ddiPhoneField.forceReinit();
            }
        }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        // Only initialize once
        if (window.ddiPhoneFieldElementor) {
            return;
        }
        
        window.ddiPhoneFieldElementor = new DDIPhoneFieldElementorIntegration();
    });

    // Make it available globally
    window.DDIPhoneFieldElementorIntegration = DDIPhoneFieldElementorIntegration;

})(jQuery); 