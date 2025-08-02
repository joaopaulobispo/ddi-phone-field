/**
 * DDI Phone Field Admin JavaScript
 * 
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

(function($) {
    'use strict';

    /**
     * Admin Settings Class
     */
    class DDIPhoneFieldAdmin {
        constructor() {
            this.init();
        }

        /**
         * Initialize admin functionality
         */
        init() {
            this.initColorPickers();
            this.initFormValidation();
            this.initPreview();
        }

        /**
         * Initialize color pickers
         */
        initColorPickers() {
            $('.my-color-field').wpColorPicker({
                change: function(event, ui) {
                    // Update preview when color changes
                    if (window.ddiPhoneFieldPreview) {
                        window.ddiPhoneFieldPreview.updatePreview();
                    }
                }
            });
        }

        /**
         * Initialize form validation
         */
        initFormValidation() {
            $('#ddi-phone-field-settings-form').on('submit', function(e) {
                const widthField = $('input[name="ddi_phone_field_settings[ddi_phone_field_width]"]');
                const widthValue = widthField.val().trim();

                if (widthValue && !isValidWidth(widthValue)) {
                    e.preventDefault();
                    alert('Por favor, insira uma largura válida (ex: 100%, 50%, 300px)');
                    widthField.focus();
                    return false;
                }
            });
        }

        /**
         * Initialize preview functionality
         */
        initPreview() {
            if ($('#ddi-phone-field-preview').length) {
                window.ddiPhoneFieldPreview = new DDIPhoneFieldPreview();
            }
        }
    }

    /**
     * Preview Class
     */
    class DDIPhoneFieldPreview {
        constructor() {
            this.previewContainer = $('#ddi-phone-field-preview');
            this.init();
        }

        /**
         * Initialize preview
         */
        init() {
            this.createPreviewField();
            this.bindEvents();
        }

        /**
         * Create preview field
         */
        createPreviewField() {
            const previewHtml = `
                <div class="ddi-phone-field-preview-wrapper">
                    <label for="preview-phone">Telefone</label>
                    <input type="tel" id="preview-phone" placeholder="Digite seu telefone" />
                </div>
            `;
            
            this.previewContainer.html(previewHtml);
            
            // Initialize the phone field
            if (window.intlTelInput) {
                this.phoneField = window.intlTelInput(document.getElementById('preview-phone'), {
                    initialCountry: "br",
                    separateDialCode: true,
                    preferredCountries: ["br"],
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
                });
            }
        }

        /**
         * Bind events
         */
        bindEvents() {
            // Update preview when settings change
            $('input[name*="ddi_phone_field_settings"]').on('change input', () => {
                this.updatePreview();
            });

            // Update preview when color picker changes
            $('.wp-color-result').on('click', () => {
                setTimeout(() => {
                    this.updatePreview();
                }, 100);
            });
        }

        /**
         * Update preview
         */
        updatePreview() {
            const settings = this.getCurrentSettings();
            
            // Update width
            if (settings.width) {
                this.previewContainer.find('.iti').css('width', settings.width);
            }

            // Update colors
            if (settings.borderColor) {
                this.previewContainer.find('.iti').css('border-color', settings.borderColor);
            }

            if (settings.ddiColor) {
                this.previewContainer.find('.iti__selected-dial-code').css('color', settings.ddiColor);
            }

            if (settings.bgColor) {
                this.previewContainer.find('.iti__selected-flag').css('background-color', settings.bgColor);
            }
        }

        /**
         * Get current settings
         */
        getCurrentSettings() {
            const settings = {};
            
            // Get width
            const widthField = $('input[name="ddi_phone_field_settings[ddi_phone_field_width]"]');
            if (widthField.length) {
                settings.width = widthField.val();
            }

            // Get colors from color pickers
            $('.my-color-field').each(function() {
                const name = $(this).attr('name');
                const color = $(this).wpColorPicker('color');
                
                if (name.includes('border_color')) {
                    settings.borderColor = color;
                } else if (name.includes('ddi_color')) {
                    settings.ddiColor = color;
                } else if (name.includes('bg_color')) {
                    settings.bgColor = color;
                }
            });

            return settings;
        }
    }

    /**
     * Utility functions
     */
    function isValidWidth(width) {
        // Check if width is valid (percentage, px, em, rem, etc.)
        const widthRegex = /^(\d+(?:\.\d+)?)(%|px|em|rem|vw|vh)$/;
        return widthRegex.test(width) || width === 'auto' || width === 'inherit';
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(function() {
        new DDIPhoneFieldAdmin();
    });

    // Make classes available globally
    window.DDIPhoneFieldAdmin = DDIPhoneFieldAdmin;
    window.DDIPhoneFieldPreview = DDIPhoneFieldPreview;

})(jQuery);