<?php
/**
 * Phone Field Widget for Elementor
 *
 * @package DDI_Phone_Field
 * @since 1.0.1
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Only load if Elementor is active
if (!did_action('elementor/loaded')) {
    return;
}

/**
 * Class DDI_Phone_Field_Widget
 */
class DDI_Phone_Field_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name
     */
    public function get_name() {
        return 'ddi_phone_field';
    }

    /**
     * Get widget title
     */
    public function get_title() {
        return __('Campo de Telefone Internacional', 'ddi-phone-field');
    }

    /**
     * Get widget icon
     */
    public function get_icon() {
        return 'eicon-phone';
    }

    /**
     * Get widget categories
     */
    public function get_categories() {
        return ['ddi-phone-field'];
    }

    /**
     * Register widget controls
     */
    protected function register_controls() {
        // Content Section
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Conteúdo', 'ddi-phone-field'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'field_label',
            [
                'label' => __('Rótulo do Campo', 'ddi-phone-field'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Telefone', 'ddi-phone-field'),
                'placeholder' => __('Digite o rótulo do campo', 'ddi-phone-field'),
            ]
        );

        $this->add_control(
            'field_placeholder',
            [
                'label' => __('Placeholder', 'ddi-phone-field'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('Digite seu telefone', 'ddi-phone-field'),
                'placeholder' => __('Digite o placeholder', 'ddi-phone-field'),
            ]
        );

        $this->add_control(
            'field_name',
            [
                'label' => __('Nome do Campo', 'ddi-phone-field'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'phone',
                'placeholder' => __('phone', 'ddi-phone-field'),
            ]
        );

        $this->add_control(
            'required',
            [
                'label' => __('Campo Obrigatório', 'ddi-phone-field'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Sim', 'ddi-phone-field'),
                'label_off' => __('Não', 'ddi-phone-field'),
                'return_value' => 'required',
                'default' => '',
            ]
        );

        $this->end_controls_section();

        // Style Section
        $this->start_controls_section(
            'style_section',
            [
                'label' => __('Estilo', 'ddi-phone-field'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'label_color',
            [
                'label' => __('Cor do Rótulo', 'ddi-phone-field'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ddi-phone-field-label' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'label_typography',
                'selector' => '{{WRAPPER}} .ddi-phone-field-label',
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        $required = $settings['required'] ? 'required' : '';
        $required_attr = $settings['required'] ? 'required' : '';
        
        ?>
        <div class="ddi-phone-field-wrapper">
            <?php if ($settings['field_label']) : ?>
                <label class="ddi-phone-field-label" for="<?php echo esc_attr($settings['field_name']); ?>">
                    <?php echo esc_html($settings['field_label']); ?>
                    <?php if ($required) : ?>
                        <span class="required">*</span>
                    <?php endif; ?>
                </label>
            <?php endif; ?>
            
            <input 
                type="tel" 
                id="<?php echo esc_attr($settings['field_name']); ?>"
                name="<?php echo esc_attr($settings['field_name']); ?>"
                placeholder="<?php echo esc_attr($settings['field_placeholder']); ?>"
                <?php echo $required_attr; ?>
                class="ddi-phone-field-input"
            />
        </div>
        <?php
    }

    /**
     * Render widget output in the editor
     */
    protected function content_template() {
        ?>
        <div class="ddi-phone-field-wrapper">
            <# if (settings.field_label) { #>
                <label class="ddi-phone-field-label" for="{{ settings.field_name }}">
                    {{ settings.field_label }}
                    <# if (settings.required) { #>
                        <span class="required">*</span>
                    <# } #>
                </label>
            <# } #>
            
            <input 
                type="tel" 
                id="{{ settings.field_name }}"
                name="{{ settings.field_name }}"
                placeholder="{{ settings.field_placeholder }}"
                <# if (settings.required) { #>required<# } #>
                class="ddi-phone-field-input"
            />
        </div>
        <?php
    }
} 