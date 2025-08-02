<?php
/**
 * WooCommerce Integration Class
 *
 * @package DDI_Phone_Field
 * @since 1.0.1
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DDI_Phone_Field_WooCommerce_Integration
 */
class DDI_Phone_Field_WooCommerce_Integration {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('woocommerce_after_checkout_billing_form', array($this, 'add_phone_field_script'));
        add_action('woocommerce_after_edit_account_form', array($this, 'add_phone_field_script'));
        add_action('woocommerce_after_register_form', array($this, 'add_phone_field_script'));
        add_filter('woocommerce_checkout_fields', array($this, 'modify_checkout_fields'));
        add_filter('woocommerce_account_fields', array($this, 'modify_account_fields'));
        add_filter('woocommerce_register_form_fields', array($this, 'modify_register_fields'));
        add_action('woocommerce_checkout_update_order_meta', array($this, 'save_phone_field'));
        add_action('woocommerce_save_account_details', array($this, 'save_account_phone_field'));
        add_action('woocommerce_register_form', array($this, 'add_register_phone_field'));
    }

    /**
     * Add phone field script
     */
    public function add_phone_field_script() {
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Initialize phone fields for WooCommerce
            $('input[name="billing_phone"], input[name="shipping_phone"], input[name="phone"]').each(function() {
                if (!$(this).hasClass('iti__tel-input')) {
                    const phoneInput = window.intlTelInput(this, {
                        initialCountry: "br",
                        separateDialCode: true,
                        preferredCountries: ["br"],
                        hiddenInput: "full",
                        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
                    });

                    // Apply mask
                    $(this).mask('(00) 0000-00009', {
                        onKeyPress: function(val, e, field, options) {
                            field.mask(val.length > 14 ? '(00) 00000-0000' : '(00) 0000-00009', options);
                        }
                    });

                    // Update hidden input on form submission
                    $(this).closest('form').on('submit', function() {
                        const fullNumber = phoneInput.getNumber(intlTelInputUtils.numberFormat.E164);
                        $(this).val(fullNumber);
                    });
                }
            });
        });
        </script>
        <?php
    }

    /**
     * Modify checkout fields
     */
    public function modify_checkout_fields($fields) {
        if (isset($fields['billing']['billing_phone'])) {
            $fields['billing']['billing_phone']['type'] = 'tel';
            $fields['billing']['billing_phone']['class'] = array('form-row-wide', 'ddi-phone-field');
            $fields['billing']['billing_phone']['custom_attributes'] = array(
                'data-phone-field' => 'true'
            );
        }

        if (isset($fields['shipping']['shipping_phone'])) {
            $fields['shipping']['shipping_phone']['type'] = 'tel';
            $fields['shipping']['shipping_phone']['class'] = array('form-row-wide', 'ddi-phone-field');
            $fields['shipping']['shipping_phone']['custom_attributes'] = array(
                'data-phone-field' => 'true'
            );
        }

        return $fields;
    }

    /**
     * Modify account fields
     */
    public function modify_account_fields($fields) {
        if (isset($fields['billing_phone'])) {
            $fields['billing_phone']['type'] = 'tel';
            $fields['billing_phone']['class'] = array('form-row-wide', 'ddi-phone-field');
            $fields['billing_phone']['custom_attributes'] = array(
                'data-phone-field' => 'true'
            );
        }

        return $fields;
    }

    /**
     * Modify register fields
     */
    public function modify_register_fields($fields) {
        if (isset($fields['phone'])) {
            $fields['phone']['type'] = 'tel';
            $fields['phone']['class'] = array('form-row-wide', 'ddi-phone-field');
            $fields['phone']['custom_attributes'] = array(
                'data-phone-field' => 'true'
            );
        }

        return $fields;
    }

    /**
     * Add register phone field
     */
    public function add_register_phone_field() {
        ?>
        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
            <label for="reg_phone"><?php echo esc_html__('Telefone', 'ddi-phone-field'); ?> <span class="required">*</span></label>
            <input type="tel" 
                   class="woocommerce-Input woocommerce-Input--text input-text ddi-phone-field" 
                   name="phone" 
                   id="reg_phone" 
                   autocomplete="tel"
                   data-phone-field="true"
                   placeholder="<?php echo esc_attr__('Digite seu telefone', 'ddi-phone-field'); ?>" />
        </p>
        <?php
    }

    /**
     * Save phone field on checkout
     */
    public function save_phone_field($order_id) {
        if (!empty($_POST['billing_phone'])) {
            $phone = sanitize_text_field($_POST['billing_phone']);
            update_post_meta($order_id, '_billing_phone_international', $phone);
        }

        if (!empty($_POST['shipping_phone'])) {
            $phone = sanitize_text_field($_POST['shipping_phone']);
            update_post_meta($order_id, '_shipping_phone_international', $phone);
        }
    }

    /**
     * Save account phone field
     */
    public function save_account_phone_field($user_id) {
        if (!empty($_POST['billing_phone'])) {
            $phone = sanitize_text_field($_POST['billing_phone']);
            update_user_meta($user_id, 'billing_phone_international', $phone);
        }
    }

    /**
     * Validate phone field
     */
    public function validate_phone_field($phone) {
        // Updated regex pattern to properly accept E.164 format (with + at the beginning)
        // Pattern: /^[\+]?[0-9\s\(\)\-\+\.\#\*\&\=]+$/
        if (preg_match('/^[\+]?[0-9\s\(\)\-\+\.\#\*\&\=]+$/', $phone) !== 1) {
            return false;
        }
        
        return true;
    }

    /**
     * Add phone field to order details
     */
    public function add_phone_to_order_details($order) {
        $billing_phone = get_post_meta($order->get_id(), '_billing_phone_international', true);
        $shipping_phone = get_post_meta($order->get_id(), '_shipping_phone_international', true);

        if ($billing_phone) {
            echo '<p><strong>' . esc_html__('Telefone de Cobrança:', 'ddi-phone-field') . '</strong> ' . esc_html($billing_phone) . '</p>';
        }

        if ($shipping_phone) {
            echo '<p><strong>' . esc_html__('Telefone de Entrega:', 'ddi-phone-field') . '</strong> ' . esc_html($shipping_phone) . '</p>';
        }
    }

    /**
     * Add phone field to admin order details
     */
    public function add_phone_to_admin_order_details($order) {
        $billing_phone = get_post_meta($order->get_id(), '_billing_phone_international', true);
        $shipping_phone = get_post_meta($order->get_id(), '_shipping_phone_international', true);

        if ($billing_phone) {
            echo '<p><strong>' . esc_html__('Telefone de Cobrança (Internacional):', 'ddi-phone-field') . '</strong> ' . esc_html($billing_phone) . '</p>';
        }

        if ($shipping_phone) {
            echo '<p><strong>' . esc_html__('Telefone de Entrega (Internacional):', 'ddi-phone-field') . '</strong> ' . esc_html($shipping_phone) . '</p>';
        }
    }

    /**
     * Check if WooCommerce is active
     */
    public static function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }

    /**
     * Get WooCommerce version
     */
    public static function get_woocommerce_version() {
        if (defined('WC_VERSION')) {
            return WC_VERSION;
        }
        return false;
    }
}

// Add hooks for order details
add_action('woocommerce_order_details_after_customer_details', array('DDI_Phone_Field_WooCommerce_Integration', 'add_phone_to_order_details'));
add_action('woocommerce_admin_order_data_after_billing_address', array('DDI_Phone_Field_WooCommerce_Integration', 'add_phone_to_admin_order_details'));
add_action('woocommerce_admin_order_data_after_shipping_address', array('DDI_Phone_Field_WooCommerce_Integration', 'add_phone_to_admin_order_details'));
