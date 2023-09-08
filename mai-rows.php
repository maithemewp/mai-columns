<?php
/**
 * Plugin Name:       Mai Rows
 * Description:       Create simple and complex repeatable column arrangements quickly.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Bizbudding
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mai-rows
 */

// Prevent direct file access.
defined( 'ABSPATH' ) || die;

$block = new Mai_Rows_Block;

class Mai_Rows_Block {

	/**
	 * Construct the class.
	 */
	function __construct() {
		$this->hooks();
	}

	/**
	 * Add hooks.
	 *
	 * @since 0.1.0
	 *
	 * @return void
	 */
	function hooks() {
		add_action( 'init', [ $this, 'block_init' ] );
	}

	/**
	 * Registers the block using the metadata loaded from the `block.json` file.
	 * Behind the scenes, it registers also all assets so they can be enqueued
	 * through the block editor in the corresponding context.
	 *
	 * @since 0.1.0
	 *
	 * @return void
	 */
	function block_init() {
		register_block_type( __DIR__ . '/build/rows',
			[
				'render_callback' => [ $this, 'get_rows' ],
			]
		);

		register_block_type( __DIR__ . '/build/column',
			[
				'render_callback' => [ $this, 'get_column' ],
			]
		);
	}

	/**
	 * Get rows.
	 *
	 * @since 0.1.0
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block inner content.
	 * @param WP_Block $block      The block object.
	 *
	 * @return string
	 */
	function get_rows( $attributes, $content, $block ) {
		// Bail if in the editor.
		if ( is_admin() ) {
			return;
		}

		// Bail if no content.
		if ( ! $content ) {
			return sprintf( '<div class="mai-rows is-layout-flex">%s</div>', $content );
		}

		// Get arrangements.
		$arrangements = [
			'lg' => $attributes['sizesLg'],
			'md' => $attributes['sizesMd'],
			'sm' => $attributes['sizesSm'],
		];

		// Set fallbacks.
		foreach ( $arrangements as $key => $value ) {
			if ( ! $value ) {
				$keys                 = array_keys( $arrangements );
				$shift                = array_shift( $keys );
				$arrangements[ $key ] = $arrangements[ $shift ];
			}
		}

		// Get column nodes.
		$dom     = $this->get_dom_document( $content );
		$xpath   = new DOMXPath( $dom );
		$columns = $xpath->query( '/div[contains(concat(" ", normalize-space(@class), " "), " mai-column ")]' );

		// Bail if no columns.
		if ( ! $columns->length ) {
			return sprintf( '<div class="mai-rows is-layout-flex">%s</div>', $content );
		}

		// Start counter.
		$i = 0;

		// Loop through columns, adding styles.
		foreach ( $columns as $column ) {
			$columns = [];
			$flexes  = [];
			$styles  = (string) $column->getAttribute( 'style' );
			$styles  = explode( ';', $styles );
			$styles  = array_map( 'trim', $styles );
			$styles  = array_filter( $styles );

			// Loop through arrangements, setting custom properties by breakpoint.
			foreach ( $arrangements as $key => $values ) {
				$size      = $values ? $this->get_index_value_from_array( $i, $values ) : '';
				$columns[] = sprintf( '--size-%s:%s', $key, $this->get_fraction( $size ) ?: 1 );
				$flexes[]  = sprintf( '--flex-%s:%s', $key, $this->get_flex( $size ) );
			}

			// Merge styles.
			$styles = array_merge( $styles, $columns, $flexes );

			// Handle styles attribute.
			if ( $styles ) {
				$column->setAttribute( 'style', implode( ';', $styles ) );
			} else {
				$column->removeAttribute( 'style' );
			}

			// Increment counter.
			$i++;
		}

		// Save content.
		$content = $dom->saveHTML();

		// Build default atts.
		$style = [];
		$atts  = [
			'class' => 'mai-rows',
		];

		// Add align-items.
		if ( isset( $attributes['alignItems'] ) ) {
			$style[] = isset( $attributes['alignItems'] ) ? sprintf( '--align-items:%s;', $this->get_flex_css_value( $attributes['alignItems'] ) ) : 'initial';
		}

		// Add justify-content.
		if ( isset( $attributes['justifyContent'] ) ) {
			$style[] = isset( $attributes['justifyContent'] ) ? sprintf( '--justify-content:%s;', $this->get_flex_css_value( $attributes['justifyContent'] ) ) : 'initial';
		}

		// Add block gaps.
		if ( isset( $attributes['style']['spacing']['blockGap'] ) ) {
			$gap = $this->get_block_gap( $attributes['style']['spacing']['blockGap'] );

			if ( $gap ) {
				foreach ( $gap as $position => $value ) {
					$style[] = sprintf( '--%s-gap:%s;', $position, $value );
				}
			}
		}

		// Add inline styles.
		if ( $style ) {
			$atts['style'] = implode( '', $style );
		}

		// Get attributes with custom class first, and replace `wp-block-` with an emtpy string.
		$attr = get_block_wrapper_attributes( $atts );
		$attr = str_replace( ' wp-block-mai-rows', '', $attr );

		return sprintf( '<div %s>%s</div>', trim( $attr ), $content );
	}

	/**
	 * Get row items.
	 *
	 * @since 0.1.0
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block inner content.
	 * @param WP_Block $block      The block object.
	 *
	 * @return string
	 */
	function get_column( $attributes, $content, $block ) {
		// Bail if in the editor.
		if ( is_admin() ) {
			return;
		}

		// Build default atts.
		$style = [];
		$atts  = [
			'class' => 'mai-column',
		];

		// Justify content is align items value since flex-direction is column.
		if ( isset( $attributes['alignItems'] ) ) {
			$style[] = isset( $attributes['alignItems'] ) ? sprintf( '--justify-content:%s;', $this->get_flex_css_value( $attributes['alignItems'] ) ) : 'initial';
		}

		// Add inline styles.
		if ( $style ) {
			$atts['style'] = implode( '', $style );
		}

		// Get attributes with custom class first, and replace `wp-block-` with an emtpy string.
		$attr = get_block_wrapper_attributes( $atts );
		$attr = str_replace( ' wp-block-mai-column', '', $attr );

		return sprintf( '<div %s>%s</div>', trim( $attr ), $content );
	}

	/**
	 * Get the flex CSS value.
	 *
	 * @since 0.1.0
	 *
	 * @return string
	 */
	function get_flex_css_value( $value ) {
		switch ( $value ) {
			case 'top':
			case 'left':
				return 'flex-start';
			case 'middle':
			case 'center':
				return 'center';
			case 'bottom':
			case 'right':
				return 'flex-end';
			case 'space-between':
				return 'space-between';
			default:
				return 'initial';
		}
	}

	/**
	 * Converts blockGap values to CSS value.
	 *
	 * @since 0.1.0
	 *
	 * @param string|array $gap The blockGap value.
	 *
	 * @return string
	 */
	function get_block_gap( $gap ) {
		$return = [
			'row'    => 'initial',
			'column' => 'initial',
		];

		if ( is_array( $gap ) ) {
			foreach ( $gap as $position => $value ) {
				switch ( $position ) {
					case 'top':
					case 'bottom':
						$return['row'] = $this->get_block_gap_value( $value );
						break;
					case 'left':
					case 'right':
						$return['column'] = $this->get_block_gap_value( $value );
						break;
				}

			}
		} else {
			$value = $this->get_block_gap_value( $value );

			if ( $value ) {
				$return['row']    = $value;
				$return['column'] = $value;
			}
		}

		return $return;
	}

	/**
	 * Gets the CSS value from the blockGap value.
	 *
	 * @since 0.1.0
	 *
	 * @param string $gap The blockGap value.
	 *
	 * @return string
	 */
	function get_block_gap_value( $gap ) {
		$array = explode( '|', $gap );
		$last  = array_pop( $array );

		return count( $array ) > 1 ? sprintf( 'var(--wp--preset--spacing--%s)', $last ) : $last;
	}

	/**
	 * Gets flex value from column size.
	 *
	 * @since 0.1.0
	 *
	 * @param string $size The size value from settings.
	 *
	 * @return string
	 */
	function get_flex( $size ) {
		if ( ! $size ) {
			return '1';
		}

		switch ( $size ) {
			// No longer using 'auto', as this is the "empty" default, same as '1'.
			// case 'auto':
			// 	return '0 1 0%';
			case 'fit':
				return '0 1 auto';
			case 'fill':
				return '1 0 0';
		}

		return '0 1 var(--flex-basis)';
	}

	/**
	 * Gets the correct column value from the repeated arrangement array.
	 * Alternate, but slower, versions below.
	 *
	 * // Slower.
	 * $array = array_merge(...array_fill( 0, $index, $array ));
	 * return $array[ $index ] ?? $default;
	 *
	 * // Slowest.
	 * $array = [];
	 * for ( $i = 0; $i < ( $index + 1) / count( $pattern ); $i++ ) {
	 * 	$array = array_merge( $array, $pattern );
	 * }
	 * return $array[ $index ] ?? $default;
	 *
	 * @since 0.1.0
	 *
	 * @param int   $index   The current item index to get the value for.
	 * @param array $array   The array to get index value from.
	 * @param mixed $default The default value if there is no index.
	 *
	 * @return mixed
	 */
	function get_index_value_from_array( $index, $array, $default = null ) {
		// If index is already available, return it.
		if ( isset( $array[ $index ] ) ) {
			return $array[ $index ];
		}

		// If only 1 item in array, return the first.
		if ( 1 === count( $array ) ) {
			return reset( $array );
		}

		return $array[ $index % count( $array ) ] ?? $default;
	}

	/**
	 * Gets the fraction value from a given value.
	 *
	 * @param string $value
	 *
	 * @return string
	 */
	function get_fraction( $value ) {
		if ( ! $value ) {
			return false;
		}

		if ( in_array( $value, [ 'auto', 'fit', 'fill' ] ) ) {
			return false;
		}

		if ( $this->is_fraction( $value ) ) {
			return $value;
		}

		// If not a fraction, it's a percentage. Convert to fraction and reduce.
		$percentage   = floatval( str_replace( '%', '', $value ) );
		$decimalValue = $percentage / 100;
		$numerator    = intval( round( $decimalValue * 100 ) );
		$denominator  = 100;
		$gcd          = $this->get_gcd( $numerator, $denominator );

		return sprintf( '%s/%s', $numerator / $gcd, $denominator / $gcd);
	}

	/**
	 * Gets the greatest common denominator.
	 *
	 * @since 0.1.0
	 *
	 * @param int $a
	 * @param int $b
	 *
	 * @return int
	 */
	function get_gcd( $a, $b ) {
		if ( 0 === $b ) {
			return $a;
		}

		return $this->get_gcd( $b, $a % $b );
	}

	/**
	 * Checks if a value is a fraction.
	 *
	 * @since 0.1.0
	 *
	 * @param string $value
	 *
	 * @return bool
	 */
	function is_fraction( $value ) {
		return preg_match( '/^\\d+\\/\\d+$/', $value );
	}

	/**
	 * Gets DOMDocument object.
	 *
	 * @since 0.1.0
	 *
	 * @param string $html Any given HTML string.
	 *
	 * @return DOMDocument
	 */
	function get_dom_document( $html ) {
		// Create the new document.
		$dom = new DOMDocument();

		// Modify state.
		$libxml_previous_state = libxml_use_internal_errors( true );

		// Encode.
		$html = mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' );

		// Load the content in the document HTML.
		$dom->loadHTML( "<div>$html</div>" );

		// Handle wraps.
		$container = $dom->getElementsByTagName('div')->item(0);
		$container = $container->parentNode->removeChild( $container );

		while ( $dom->firstChild ) {
			$dom->removeChild( $dom->firstChild );
		}

		while ( $container->firstChild ) {
			$dom->appendChild( $container->firstChild );
		}

		// Handle errors.
		libxml_clear_errors();

		// Restore.
		libxml_use_internal_errors( $libxml_previous_state );

		return $dom;
	}
}