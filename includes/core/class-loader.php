<?php
/**
 * Class Loader
 *
 * @package DDI_Phone_Field
 * @since 1.0.1
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DDI_Phone_Field_Loader
 */
class DDI_Phone_Field_Loader {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_frontend_scripts() {
        // Enqueue CSS
        wp_enqueue_style(
            'intl-tel-input-css',
            'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css',
            array(),
            '17.0.8'
        );

        wp_enqueue_style(
            'ddi-phone-field-css',
            DDI_PHONE_FIELD_PLUGIN_URL . 'assets/css/ddi-phone-field.css',
            array('intl-tel-input-css'),
            DDI_PHONE_FIELD_VERSION
        );

        // Enqueue JavaScript
        wp_enqueue_script('jquery');
        
        wp_enqueue_script(
            'intl-tel-input-js',
            'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js',
            array('jquery'),
            '17.0.8',
            true
        );

        wp_enqueue_script(
            'jquery-mask-js',
            'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js',
            array('jquery'),
            '1.14.16',
            true
        );

        wp_enqueue_script(
            'ddi-phone-field-js',
            DDI_PHONE_FIELD_PLUGIN_URL . 'assets/js/ddi-phone-field.js',
            array('jquery', 'intl-tel-input-js', 'jquery-mask-js'),
            DDI_PHONE_FIELD_VERSION,
            true
        );

        // Add dynamic CSS
        $this->add_dynamic_css();
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook_suffix) {
        // Load only on our settings page
        if ($hook_suffix === 'toplevel_page_ddi_phone_field_settings') {
            wp_enqueue_style('wp-color-picker');
            wp_enqueue_script(
                'ddi-phone-field-admin-js',
                DDI_PHONE_FIELD_PLUGIN_URL . 'assets/js/admin.js',
                array('wp-color-picker'),
                DDI_PHONE_FIELD_VERSION,
                true
            );
        }
    }

    /**
     * Add dynamic CSS based on settings
     */
    private function add_dynamic_css() {
        $options = get_option('ddi_phone_field_settings', array());
        $custom_css = '';

        if (!empty($options['ddi_phone_field_width'])) {
            $custom_css .= "
                .iti, .iti--allow-dropdown {
                    width: " . esc_attr($options['ddi_phone_field_width']) . " !important;
                }
            ";
        }

        if (!empty($options['ddi_phone_border_color'])) {
            $custom_css .= "
                .iti, .iti--allow-dropdown {
                    border-color: " . esc_attr($options['ddi_phone_border_color']) . " !important;
                }
            ";
        }

        if (!empty($options['ddi_phone_ddi_color'])) {
            $custom_css .= "
                .iti__selected-dial-code {
                    color: " . esc_attr($options['ddi_phone_ddi_color']) . " !important;
                }
            ";
        }

        if (!empty($options['ddi_phone_bg_color'])) {
            $custom_css .= "
                .iti__selected-flag {
                    background-color: " . esc_attr($options['ddi_phone_bg_color']) . " !important;
                }
            ";
        }

        if ($custom_css) {
            wp_add_inline_style('ddi-phone-field-css', $custom_css);
        }
    }
}

// Initialize the loader
new DDI_Phone_Field_Loader();
