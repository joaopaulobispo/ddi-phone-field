<?php
/**
 * Plugin Name: DDI Phone Field
 * Plugin URI: https://www.wplugin.com.br
 * Description: Adiciona campos de telefone com DDI e bandeira aos formulários do Elementor, Contact Form 7 e WooCommerce.
 * Version: 1.1.0
 * Author: Wplugin
 * Author URI: https://www.wplugin.com.br
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ddi-phone-field
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 *
 * @package DDI_Phone_Field
 * @version 1.1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('DDI_PHONE_FIELD_VERSION', '1.1.0');
define('DDI_PHONE_FIELD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DDI_PHONE_FIELD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DDI_PHONE_FIELD_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main plugin class
 */
final class DDI_Phone_Field {

    /**
     * Plugin instance
     *
     * @var DDI_Phone_Field
     */
    private static $instance = null;

    /**
     * Get plugin instance
     *
     * @return DDI_Phone_Field
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('plugins_loaded', array($this, 'init'));
        add_action('init', array($this, 'load_textdomain'));
    }

    /**
     * Initialize plugin
     */
    public function init() {
        // Load core classes
        $this->load_core_classes();
        
        // Initialize components
        $this->init_components();
    }

    /**
     * Load core classes
     */
    private function load_core_classes() {
        // Always load core and admin classes
        require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/core/class-loader.php';
        require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/admin/class-admin-settings.php';
        
        // Load integrations only if dependencies are available
        if (did_action('elementor/loaded')) {
            require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/elementor/class-elementor-integration.php';
        }
        
        if (class_exists('WPCF7')) {
            require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/cf7/class-cf7-integration.php';
        }
        
        if (class_exists('WooCommerce')) {
            require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/woocommerce/class-woocommerce-integration.php';
        }
    }

    /**
     * Initialize components
     */
    private function init_components() {
        // Initialize admin settings
        new DDI_Phone_Field_Admin_Settings();
        
        // Initialize integrations only if dependencies are available
        if (did_action('elementor/loaded')) {
            new DDI_Phone_Field_Elementor_Integration();
        }
        
        if (class_exists('WPCF7')) {
            new DDI_Phone_Field_CF7_Integration();
        }
        
        if (class_exists('WooCommerce')) {
            new DDI_Phone_Field_WooCommerce_Integration();
        }
    }

    /**
     * Load text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'ddi-phone-field',
            false,
            dirname(DDI_PHONE_FIELD_PLUGIN_BASENAME) . '/languages'
        );
    }

    /**
     * Get plugin version
     *
     * @return string
     */
    public function get_version() {
        return DDI_PHONE_FIELD_VERSION;
    }

    /**
     * Get plugin directory
     *
     * @return string
     */
    public function get_plugin_dir() {
        return DDI_PHONE_FIELD_PLUGIN_DIR;
    }

    /**
     * Get plugin URL
     *
     * @return string
     */
    public function get_plugin_url() {
        return DDI_PHONE_FIELD_PLUGIN_URL;
    }
}

/**
 * Get plugin instance
 *
 * @return DDI_Phone_Field
 */
function ddi_phone_field() {
    return DDI_Phone_Field::get_instance();
}

// Initialize plugin
ddi_phone_field();

// Activation hook
register_activation_hook(__FILE__, 'ddi_phone_field_activate');

/**
 * Plugin activation
 */
function ddi_phone_field_activate() {
    // Set default options
    $default_options = array(
        'ddi_phone_field_width' => '100%',
        'ddi_phone_border_color' => '#cccccc',
        'ddi_phone_ddi_color' => '#000000',
        'ddi_phone_bg_color' => '#F2F2F2'
    );
    
    add_option('ddi_phone_field_settings', $default_options);
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'ddi_phone_field_deactivate');

/**
 * Plugin deactivation
 */
function ddi_phone_field_deactivate() {
    // Cleanup if needed
}