<?php
/**
 * Elementor Integration Class
 *
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DDI_Phone_Field_Elementor_Integration
 */
class DDI_Phone_Field_Elementor_Integration {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('elementor/widgets/register', array($this, 'register_widgets'));
        add_action('elementor/elements/categories_registered', array($this, 'add_widget_categories'));
        add_action('elementor/editor/before_enqueue_scripts', array($this, 'enqueue_editor_scripts'));
    }

    /**
     * Register widgets
     */
    public function register_widgets($widgets_manager) {
        // Check if Elementor is active
        if (!did_action('elementor/loaded')) {
            return;
        }

        // Add custom phone field widget
        require_once DDI_PHONE_FIELD_PLUGIN_DIR . 'includes/elementor/widgets/class-phone-field-widget.php';
        $widgets_manager->register(new DDI_Phone_Field_Widget());
    }

    /**
     * Add widget categories
     */
    public function add_widget_categories($elements_manager) {
        $elements_manager->add_category(
            'ddi-phone-field',
            [
                'title' => __('DDI Phone Field', 'ddi-phone-field'),
                'icon' => 'fa fa-phone',
            ]
        );
    }

    /**
     * Enqueue editor scripts
     */
    public function enqueue_editor_scripts() {
        wp_enqueue_script(
            'ddi-phone-field-elementor-editor',
            DDI_PHONE_FIELD_PLUGIN_URL . 'assets/js/elementor-editor.js',
            array('jquery'),
            DDI_PHONE_FIELD_VERSION,
            true
        );
    }

    /**
     * Check if Elementor is active
     */
    public static function is_elementor_active() {
        return did_action('elementor/loaded');
    }

    /**
     * Get Elementor version
     */
    public static function get_elementor_version() {
        if (defined('ELEMENTOR_VERSION')) {
            return ELEMENTOR_VERSION;
        }
        return false;
    }
}
