<?php
/**
 * Admin Settings Class
 *
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DDI_Phone_Field_Admin_Settings
 */
class DDI_Phone_Field_Admin_Settings {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Configurações DDI Phone Field', 'ddi-phone-field'),
            __('DDI Phone', 'ddi-phone-field'),
            'manage_options',
            'ddi_phone_field_settings',
            array($this, 'settings_page'),
            'dashicons-flag',
            30
        );
    }

    /**
     * Settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Configurações do DDI Phone Field', 'ddi-phone-field'); ?></h1>
            
            <div class="notice notice-info">
                <p>
                    <?php echo esc_html__('Configure a aparência dos campos de telefone internacional.', 'ddi-phone-field'); ?>
                </p>
            </div>

            <form method="post" action="options.php">
                <?php
                settings_fields('ddi_phone_field_settings_group');
                do_settings_sections('ddi_phone_field_settings');
                submit_button();
                ?>
            </form>

            <div class="card" style="max-width: 800px; margin-top: 20px;">
                <h2><?php echo esc_html__('Como usar', 'ddi-phone-field'); ?></h2>
                <p><?php echo esc_html__('Para usar o campo de telefone internacional, simplesmente adicione um campo do tipo "tel" em seus formulários:', 'ddi-phone-field'); ?></p>
                <code>&lt;input type="tel" name="phone" /&gt;</code>
                
                <h3><?php echo esc_html__('Integrações suportadas:', 'ddi-phone-field'); ?></h3>
                <ul>
                    <li><strong>Elementor:</strong> <?php echo esc_html__('Use o widget de formulário e adicione campos de telefone.', 'ddi-phone-field'); ?></li>
                    <li><strong>Contact Form 7:</strong> <?php echo esc_html__('Use o shortcode [tel] para campos de telefone.', 'ddi-phone-field'); ?></li>
                    <li><strong>WooCommerce:</strong> <?php echo esc_html__('Os campos de telefone são automaticamente convertidos.', 'ddi-phone-field'); ?></li>
                </ul>
            </div>
        </div>
        <?php
    }

    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting('ddi_phone_field_settings_group', 'ddi_phone_field_settings');

        add_settings_section(
            'ddi_phone_field_section',
            __('Personalizar Aparência', 'ddi-phone-field'),
            array($this, 'section_callback'),
            'ddi_phone_field_settings'
        );

        add_settings_field(
            'ddi_phone_bg_color',
            __('Cor de Fundo da Bandeira e DDI', 'ddi-phone-field'),
            array($this, 'bg_color_render'),
            'ddi_phone_field_settings',
            'ddi_phone_field_section'
        );

        add_settings_field(
            'ddi_phone_ddi_color',
            __('Cor do Número DDI', 'ddi-phone-field'),
            array($this, 'ddi_color_render'),
            'ddi_phone_field_settings',
            'ddi_phone_field_section'
        );

        add_settings_field(
            'ddi_phone_border_color',
            __('Cor da Borda do Campo', 'ddi-phone-field'),
            array($this, 'border_color_render'),
            'ddi_phone_field_settings',
            'ddi_phone_field_section'
        );

        add_settings_field(
            'ddi_phone_field_width',
            __('Largura do Campo', 'ddi-phone-field'),
            array($this, 'field_width_render'),
            'ddi_phone_field_settings',
            'ddi_phone_field_section'
        );
    }

    /**
     * Section callback
     */
    public function section_callback() {
        echo '<p>' . esc_html__('Personalize a aparência dos campos de telefone internacional.', 'ddi-phone-field') . '</p>';
    }

    /**
     * Background color field
     */
    public function bg_color_render() {
        $options = get_option('ddi_phone_field_settings', array());
        $value = isset($options['ddi_phone_bg_color']) ? $options['ddi_phone_bg_color'] : '#F2F2F2';
        ?>
        <input type="text" 
               name="ddi_phone_field_settings[ddi_phone_bg_color]" 
               value="<?php echo esc_attr($value); ?>" 
               class="my-color-field" 
               data-default-color="#F2F2F2" 
               placeholder="<?php echo esc_attr__('Padrão: #F2F2F2', 'ddi-phone-field'); ?>" />
        <p class="description"><?php echo esc_html__('Cor de fundo da área da bandeira e código DDI.', 'ddi-phone-field'); ?></p>
        <?php
    }

    /**
     * DDI color field
     */
    public function ddi_color_render() {
        $options = get_option('ddi_phone_field_settings', array());
        $value = isset($options['ddi_phone_ddi_color']) ? $options['ddi_phone_ddi_color'] : '#000000';
        ?>
        <input type="text" 
               name="ddi_phone_field_settings[ddi_phone_ddi_color]" 
               value="<?php echo esc_attr($value); ?>" 
               class="my-color-field" 
               data-default-color="#000000" 
               placeholder="<?php echo esc_attr__('Padrão: Preto', 'ddi-phone-field'); ?>" />
        <p class="description"><?php echo esc_html__('Cor do texto do código DDI.', 'ddi-phone-field'); ?></p>
        <?php
    }

    /**
     * Border color field
     */
    public function border_color_render() {
        $options = get_option('ddi_phone_field_settings', array());
        $value = isset($options['ddi_phone_border_color']) ? $options['ddi_phone_border_color'] : '#cccccc';
        ?>
        <input type="text" 
               name="ddi_phone_field_settings[ddi_phone_border_color]" 
               value="<?php echo esc_attr($value); ?>" 
               class="my-color-field" 
               data-default-color="#cccccc" 
               placeholder="<?php echo esc_attr__('Padrão: Cinza', 'ddi-phone-field'); ?>" />
        <p class="description"><?php echo esc_html__('Cor da borda do campo de telefone.', 'ddi-phone-field'); ?></p>
        <?php
    }

    /**
     * Field width field
     */
    public function field_width_render() {
        $options = get_option('ddi_phone_field_settings', array());
        $value = isset($options['ddi_phone_field_width']) ? $options['ddi_phone_field_width'] : '100%';
        ?>
        <input type="text" 
               name="ddi_phone_field_settings[ddi_phone_field_width]" 
               value="<?php echo esc_attr($value); ?>" 
               placeholder="<?php echo esc_attr__('Ex: 100%, 50%, 300px', 'ddi-phone-field'); ?>" />
        <p class="description"><?php echo esc_html__('Largura do campo de telefone. Use valores como 100%, 50% ou 300px.', 'ddi-phone-field'); ?></p>
        <?php
    }
}
