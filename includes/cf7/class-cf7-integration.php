<?php
/**
 * Contact Form 7 Integration Class
 *
 * @package DDI_Phone_Field
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DDI_Phone_Field_CF7_Integration
 */
class DDI_Phone_Field_CF7_Integration {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('wpcf7_init', array($this, 'add_form_tag_phone'));
        add_action('wpcf7_admin_init', array($this, 'add_tag_generator_phone'));
        add_filter('wpcf7_validate_tel*', array($this, 'validate_phone_field'), 10, 2);
        add_filter('wpcf7_validate_tel', array($this, 'validate_phone_field'), 10, 2);
    }

    /**
     * Add phone form tag
     */
    public function add_form_tag_phone() {
        wpcf7_add_form_tag(
            array('tel', 'tel*'),
            array($this, 'phone_form_tag_handler'),
            array('name-attr' => true)
        );
    }

    /**
     * Phone form tag handler
     */
    public function phone_form_tag_handler($tag) {
        $tag = new WPCF7_FormTag($tag);

        if (empty($tag->name)) {
            return '';
        }

        $validation_error = wpcf7_get_validation_error($tag->name);

        $class = wpcf7_form_controls_class($tag->type);

        if ($validation_error) {
            $class .= ' wpcf7-not-valid';
        }

        $atts = array();

        $atts['class'] = $tag->get_class_option($class);
        $atts['id'] = $tag->get_id_option();
        $atts['tabindex'] = $tag->get_option('tabindex', 'int', true);

        if ($tag->has_option('readonly')) {
            $atts['readonly'] = 'readonly';
        }

        if ($tag->is_required()) {
            $atts['aria-required'] = 'true';
        }

        $atts['aria-invalid'] = $validation_error ? 'true' : 'false';

        $value = (string) reset($tag->values);

        if ($tag->has_option('placeholder') || $tag->has_option('watermark')) {
            $atts['placeholder'] = $value;
            $value = '';
        }

        $value = $tag->get_default_option($value);

        $value = wpcf7_get_hangover($tag->name, $value);

        $atts['value'] = $value;
        $atts['type'] = 'tel';
        $atts['name'] = $tag->name;
        
        // Add pattern that accepts E.164 format (with + at the beginning)
        // Simplified pattern to avoid browser regex issues
        $atts['pattern'] = '[\\+]?[0-9\\s\\(\\)\\-\\+\\.]+';
        $atts['title'] = esc_html__('Only numbers and phone characters (#, -, *, etc) are accepted.', 'ddi-phone-field');

        $atts = wpcf7_format_atts($atts);

        $html = sprintf(
            '<span class="wpcf7-form-control-wrap %1$s"><input %2$s />%3$s</span>',
            sanitize_html_class($tag->name),
            $atts,
            $validation_error
        );

        return $html;
    }

    /**
     * Add tag generator
     */
    public function add_tag_generator_phone() {
        if (!class_exists('WPCF7_TagGenerator')) {
            return;
        }

        $tag_generator = WPCF7_TagGenerator::get_instance();
        $tag_generator->add(
            'tel',
            __('Telefone Internacional', 'ddi-phone-field'),
            array($this, 'tag_generator_phone')
        );
    }

    /**
     * Tag generator for phone
     */
    public function tag_generator_phone($contact_form, $args = '') {
        $args = wp_parse_args($args, array());
        $type = $args['id'];

        $description = __('Gera um campo de telefone internacional com DDI e bandeira do país.', 'ddi-phone-field');

        ?>
        <div class="control-box">
            <fieldset>
                <legend><?php echo esc_html($description); ?></legend>

                <table class="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="<?php echo esc_attr($args['content'] . '-name'); ?>">
                                    <?php echo esc_html__('Nome do Campo', 'ddi-phone-field'); ?>
                                </label>
                            </th>
                            <td>
                                <input type="text" 
                                       name="name" 
                                       class="tg-name oneline" 
                                       id="<?php echo esc_attr($args['content'] . '-name'); ?>" />
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">
                                <label for="<?php echo esc_attr($args['content'] . '-values'); ?>">
                                    <?php echo esc_html__('Valor Padrão', 'ddi-phone-field'); ?>
                                </label>
                            </th>
                            <td>
                                <input type="text" 
                                       name="values" 
                                       class="oneline" 
                                       id="<?php echo esc_attr($args['content'] . '-values'); ?>" />
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">
                                <label for="<?php echo esc_attr($args['content'] . '-placeholder'); ?>">
                                    <?php echo esc_html__('Placeholder', 'ddi-phone-field'); ?>
                                </label>
                            </th>
                            <td>
                                <input type="text" 
                                       name="placeholder" 
                                       class="oneline" 
                                       id="<?php echo esc_attr($args['content'] . '-placeholder'); ?>" />
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">
                                <label for="<?php echo esc_attr($args['content'] . '-id'); ?>">
                                    <?php echo esc_html__('ID', 'ddi-phone-field'); ?>
                                </label>
                            </th>
                            <td>
                                <input type="text" 
                                       name="id" 
                                       class="idvalue oneline option" 
                                       id="<?php echo esc_attr($args['content'] . '-id'); ?>" />
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">
                                <label for="<?php echo esc_attr($args['content'] . '-class'); ?>">
                                    <?php echo esc_html__('Classe CSS', 'ddi-phone-field'); ?>
                                </label>
                            </th>
                            <td>
                                <input type="text" 
                                       name="class" 
                                       class="classvalue oneline option" 
                                       id="<?php echo esc_attr($args['content'] . '-class'); ?>" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
        </div>

        <div class="insert-box">
            <input type="text" name="<?php echo $type; ?>" class="tag code" readonly="readonly" onfocus="this.select()" />

            <div class="submitbox">
                <input type="button" class="button button-primary insert-tag" value="<?php echo esc_attr__('Inserir Tag', 'ddi-phone-field'); ?>" />
            </div>

            <br class="clear" />

            <p class="description mail-tag">
                <label for="<?php echo esc_attr($args['content'] . '-mailtag'); ?>">
                    <?php echo esc_html__('Para usar o valor deste campo em seu email, use este código:', 'ddi-phone-field'); ?>
                    <input type="text" class="mail-tag code" readonly="readonly" id="<?php echo esc_attr($args['content'] . '-mailtag'); ?>" onfocus="this.select()" />
                </label>
            </p>
        </div>
        <?php
    }

    /**
     * Validate phone field
     */
    public function validate_phone_field($result, $tag) {
        $tag = new WPCF7_FormTag($tag);

        $name = $tag->name;
        $value = isset($_POST[$name]) ? trim(wp_unslash(strval($_POST[$name]))) : '';

        if ($tag->is_required() && '' === $value) {
            $result->invalidate($tag, wpcf7_get_message('invalid_required'));
        }

        if ('' !== $value && !$this->is_valid_phone($value)) {
            $result->invalidate($tag, __('O campo aceita apenas números e caracteres de telefone (#, -, *, etc).', 'ddi-phone-field'));
        }

        return $result;
    }

    /**
     * Check if phone number is valid
     * Updated to accept E.164 format (with + at the beginning)
     */
    private function is_valid_phone($phone) {
        // Updated regex pattern to properly accept E.164 format (with + at the beginning)
        // Pattern: /^[\+]?[0-9\s\(\)\-\+\.\#\*\&\=]+$/
        if (preg_match('/^[\+]?[0-9\s\(\)\-\+\.\#\*\&\=]+$/', $phone) !== 1) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if Contact Form 7 is active
     */
    public static function is_cf7_active() {
        return class_exists('WPCF7');
    }

    /**
     * Get Contact Form 7 version
     */
    public static function get_cf7_version() {
        if (defined('WPCF7_VERSION')) {
            return WPCF7_VERSION;
        }
        return false;
    }
}
