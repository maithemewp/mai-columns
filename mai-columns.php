<?php
/**
 * Plugin Name:       Mai Columns
 * Description:       Create simple and complex repeatable column arrangements quickly.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Bizbudding
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mai-columns
 */

// Autoload Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

// Prevent direct file access.
defined( 'ABSPATH' ) || die;

$block = new Mai_Columns_Block;

class Mai_Columns_Block {
	public static $arrangements = [];
	public static $no_breaks    = [];
	public static $indexes      = [];

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
		register_block_type( __DIR__ . '/build/columns',
			[
				'render_callback' => [ $this, 'get_columns' ],
			]
		);

		register_block_type( __DIR__ . '/build/column',
			[
				'render_callback' => [ $this, 'get_column' ],
			]
		);
	}

	/**
	 * Get columns.
	 *
	 * @since 0.1.0
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block inner content.
	 * @param WP_Block $block      The block object.
	 *
	 * @return string
	 */
	function get_columns( $attributes, $content, $block ) {
		// return '<h2>Columns</h2>';

		// Bail if in the editor.
		// if ( is_admin() ) {
		// 	return;
		// }

		// // Bail if no content.
		// if ( ! $content ) {
		// 	return sprintf( '<div class="mai-columns">%s</div>', $content );
		// }

		// // Maybe arrangements.
		// if ( ! isset( self::$arrangements[ $attributes['id'] ] ) ) {
		// 	self::$arrangements[ $attributes['id'] ] = [
		// 		'lg' => $attributes['sizesLg'],
		// 		'md' => $attributes['sizesMd'],
		// 		'sm' => $attributes['sizesSm'],
		// 	];

		// 	// Get arrangement.
		// 	$arrangement = self::$arrangements[ $attributes['id'] ];

		// 	// Set fallbacks large to small.
		// 	foreach ( self::$arrangements[ $attributes['id'] ] as $key => $value ) {
		// 		if ( ! $value ) {
		// 			$keys                = array_keys( self::$arrangements[ $attributes['id'] ] );
		// 			$shift               = array_shift( $keys );
		// 			self::$arrangements[ $attributes['id'] ][ $key ] = self::$arrangements[ $attributes['id'] ][ $shift ];
		// 		}
		// 	}

		// 	// Set fallbacks in reverse.
		// 	self::$arrangements[ $attributes['id'] ] = array_reverse( self::$arrangements[ $attributes['id'] ] );

		// 	// Set fallbacks small to large, if any empty.
		// 	foreach ( self::$arrangements[ $attributes['id'] ] as $key => $value ) {
		// 		if ( ! $value ) {
		// 			$keys                = array_keys( self::$arrangements[ $attributes['id'] ] );
		// 			$shift               = array_shift( $keys );
		// 			self::$arrangements[ $attributes['id'] ][ $key ] = self::$arrangements[ $attributes['id'] ][ $shift ];
		// 		}
		// 	}

		// 	// Reverse back arrangement.
		// 	self::$arrangements[ $attributes['id'] ] = array_reverse( self::$arrangements[ $attributes['id'] ] );
		// }

		// ray( $block );

		// // Set up tag processor.
		// $tags = new WP_HTML_Tag_Processor( $content);

		// // Loop through tags.
		// while ( $tags->next_tag( [ 'tag_name' => 'div', 'class_name' => 'some-class' ] ) ) {
		// 	$class = $tags->get_attribute( 'class' );
		// 	$tags->remove_attribute( 'href' );
		// 	$tags->set_attribute( 'data-something', 'nice value' );
		// }

		// return $tags->get_updated_html();

		// // Get arrangements.
		// $arrangements = [
		// 	'lg' => $attributes['sizesLg'],
		// 	'md' => $attributes['sizesMd'],
		// 	'sm' => $attributes['sizesSm'],
		// ];

		// // Set fallbacks.
		// foreach ( $arrangements as $key => $value ) {
		// 	if ( ! $value ) {
		// 		$keys                 = array_keys( $arrangements );
		// 		$shift                = array_shift( $keys );
		// 		$arrangements[ $key ] = $arrangements[ $shift ];
		// 	}
		// }

		// // Get column nodes.
		// $dom     = $this->get_dom_document( $content );
		// $xpath   = new DOMXPath( $dom );
		// $columns = $xpath->query( '/div[contains(concat(" ", normalize-space(@class), " "), " mai-column ")]' );

		// // Bail if no columns.
		// if ( ! $columns->length ) {
		// 	return sprintf( '<div class="mai-columns">%s</div>', $content );
		// }

		// // Start counter.
		// $i = 0;

		// // Loop through columns, adding styles.
		// foreach ( $columns as $column ) {
		// 	$columns = [];
		// 	$flexes  = [];
		// 	$styles  = (string) $column->getAttribute( 'style' );
		// 	$styles  = explode( ';', $styles );
		// 	$styles  = array_map( 'trim', $styles );
		// 	$styles  = array_filter( $styles );

		// 	// Loop through arrangements, setting custom properties by breakpoint.
		// 	foreach ( $arrangements as $key => $values ) {
		// 		$size      = $values ? $this->get_index_value_from_array( $i, $values ) : '';
		// 		$columns[] = sprintf( '--size-%s:%s', $key, $this->get_size( $size ) ?: 1 );
		// 		$flexes[]  = sprintf( '--flex-%s:%s', $key, $this->get_flex( $size ) );
		// 	}

		// 	// Merge styles.
		// 	$styles = array_merge( $styles, $columns, $flexes );

		// 	// Handle styles attribute.
		// 	if ( $styles ) {
		// 		$column->setAttribute( 'style', implode( ';', $styles ) );
		// 	} else {
		// 		$column->removeAttribute( 'style' );
		// 	}

		// 	// Increment counter.
		// 	$i++;
		// }

		// // Save content.
		// $content = $this->get_dom_html( $dom );

		// Build default atts.
		$style = [];
		$atts  = [
			'class' => 'mai-columns',
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
				foreach ( (array) $gap as $position => $value ) {
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
		$attr = str_replace( ' wp-block-mai-columns', '', $attr );
		$html = sprintf( '<div %s>%s</div>', trim( $attr ), $content );

		return $html;
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
		// return '<h2>Column</h2>';

		// Bail if in the editor.
		// if ( is_admin() ) {
		// 	return;
		// }

		// // // Maybe set first instance.
		// if ( ! isset( $this->instances[ $block->context['mai/id'] ] ) ) {
		// 	$this->instances[ $block->context['mai/id'] ] = 0;
		// }

		// ray( self::$arrangements );

		// // Start HTML.
		// $html = '';

		// Build default atts.
		$style = [];
		$atts  = [
			'class'           => 'mai-column',
			// 'data-columns-id' => $block->context['mai/id'],
		];

		// Start static variables.
		// static $arrangements = [];
		// static $no_breaks    = [];

		// Maybe arrangements.
		if ( ! isset( self::$arrangements[ $block->context['mai/id'] ] ) ) {
			self::$arrangements = [];

			self::$arrangements[ $block->context['mai/id'] ] = [
				'lg' => $block->context['mai/sizesLg'],
				'md' => $block->context['mai/sizesMd'],
				'sm' => $block->context['mai/sizesSm'],
			];

			// Get arrangement.
			$arrangement = self::$arrangements[ $block->context['mai/id'] ];

			// Set fallbacks large to small.
			foreach ( self::$arrangements[ $block->context['mai/id'] ] as $key => $value ) {
				if ( ! $value ) {
					$keys                = array_keys( self::$arrangements[ $block->context['mai/id'] ] );
					$shift               = array_shift( $keys );
					self::$arrangements[ $block->context['mai/id'] ][ $key ] = self::$arrangements[ $block->context['mai/id'] ][ $shift ];
				}
			}

			// Set fallbacks in reverse.
			self::$arrangements[ $block->context['mai/id'] ] = array_reverse( self::$arrangements[ $block->context['mai/id'] ] );

			// Set fallbacks small to large, if any empty.
			foreach ( self::$arrangements[ $block->context['mai/id'] ] as $key => $value ) {
				if ( ! $value ) {
					$keys                = array_keys( self::$arrangements[ $block->context['mai/id'] ] );
					$shift               = array_shift( $keys );
					self::$arrangements[ $block->context['mai/id'] ][ $key ] = self::$arrangements[ $block->context['mai/id'] ][ $shift ];
				}
			}

			// Reverse back arrangement.
			self::$arrangements[ $block->context['mai/id'] ] = array_reverse( self::$arrangements[ $block->context['mai/id'] ] );
		}

		// If no nobreaks, filter them out.
		if ( ! isset( self::$no_breaks[ $block->context['mai/id'] ] ) ) {
			self::$no_breaks[ $block->context['mai/id'] ] = array_filter( self::$arrangements[ $block->context['mai/id'] ], function( $value ) {
				return 'break' !== $value;
			});

			// If any empty breaks, use '1/1';
			foreach ( self::$no_breaks[ $block->context['mai/id'] ] as $key => $value ) {
				if ( ! $value ) {
					self::$no_breaks[ $block->context['mai/id'] ][ $key ] = '1/1';
				}
			}
		}

		// If no index, set it.
		if ( ! isset( self::$indexes[ $block->context['mai/id'] ] ) ) {
			self::$indexes[ $block->context['mai/id'] ] = 0;
		}

		// Start columns and flexes.
		$columns = [];
		$flexes  = [];

		// Loop through no_breaks, setting custom properties by breakpoint.
		foreach ( self::$no_breaks[ $block->context['mai/id'] ] as $break => $values ) {
			// If values value is an array, skip it.
			// Temporary while i'm breaking things in JS.
			// foreach ( $values as $value ) {
			// 	if ( is_array( $value ) ) {
			// 		continue 2;
			// 	}
			// }

			// ray( $values );

			$size      = $this->get_index_value_from_array( self::$indexes[ $block->context['mai/id'] ], $values );
			$columns[] = sprintf( '--size-%s:%s;', $break, $this->get_size( $size ) ?: 1 );
			$flexes[]  = sprintf( '--flex-%s:%s;', $break, $this->get_flex( $size ) );
		}

		// Merge styles.
		$style = array_merge( $columns, $flexes );

		// ray( $style );

		// Justify content is align items value since flex-direction is column.
		if ( isset( $attributes['alignItems'] ) ) {
			$style[] = isset( $attributes['alignItems'] ) ? sprintf( '--justify-content:%s;', $this->get_flex_css_value( $attributes['alignItems'] ) ) : 'initial';
		}

		// Add inline styles.
		if ( $style ) {
			$atts['style'] = implode( '', $style );
		}

		// ray( $atts );

		// Get attributes with custom class first, and replace `wp-block-` with an emtpy string.
		$attr = is_admin() ? $this->get_attributes( $atts ) : get_block_wrapper_attributes( $atts );
		// $attr = get_block_wrapper_attributes( $atts );
		// ray( $attr );
		$attr = str_replace( ' wp-block-mai-column', '', $attr );
		$html = sprintf( '<div %s>%s</div>', trim( $attr ), $content );

		// Loop through arrangements and add the breaks.
		foreach ( self::$arrangements[ $block->context['mai/id'] ] as $break => $values ) {
			$size = $this->get_index_value_from_array( self::$indexes[ $block->context['mai/id'] ], $values );

			if ( 'break' === $size ) {
				$html = sprintf( '<span class="mai-column__break mai-column__break-%s"></span>', $break ) . $html;
			}
		}

		// Increment index.
		self::$indexes[ $block->context['mai/id'] ]++;

		return $html;
	}

	/**
	 * Get attributes string.
	 *
	 * @since 0.1.0
	 *
	 * @param array $atts The attributes array.
	 *
	 * @return string
	 */
	function get_attributes( $atts ) {
		$string = '';

		foreach ( $atts as $key => $value ) {
			$string .= sprintf( ' %s="%s"', $key, $value );
		}

		return $string;
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
			$value = $this->get_block_gap_value( $gap );

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
			case 'fit':
				return '0 1 auto';
			case 'fill':
				return '1 0 0';
		}

		if ( ! $this->is_fraction( $size ) ) {
			return sprintf( '0 1 %s', $size );
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
	 * Gets the size value from a given value.
	 *
	 * @since 0.1.0
	 *
	 * @param string $value
	 *
	 * @return string
	 */
	function get_size( $value ) {
		if ( ! $value ) {
			return false;
		}

		// If it's a fit, fill, or break, return false.
		if ( in_array( $value, [ 'fit', 'fill', 'break' ] ) ) {
			return false;
		}

		// If it's a fraction, return it.
		if ( $this->is_fraction( $value ) ) {
			return $value;
		}

		// If it's a percentage, convert to fraction and reduce.
		if ( $this->is_percentage( $value ) ) {
			$percentage   = floatval( str_replace( '%', '', $value ) );
			$decimalValue = $percentage / 100;
			$numerator    = intval( round( $decimalValue * 100 ) );
			$denominator  = 100;
			$gcd          = $this->get_gcd( $numerator, $denominator );

			return sprintf( '%s/%s', $numerator / $gcd, $denominator / $gcd);
		}

		// Return the raw value.
		return $value;
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
		// This should always be a string. I added this check while building and breaking things.
		return $value && is_string( $value ) ? preg_match( '/^\\d+\\/\\d+$/', $value ) : $value;
	}

	/**
	 * Checks if a value is a percentage.
	 *
	 * @since 0.1.0
	 *
	 * @param string $value
	 *
	 * @return bool
	 */
	function is_percentage( $value ) {
		return preg_match( '/^-?\d+(\.\d+)?%$/', trim( $value ) );
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
		$html = mb_encode_numericentity( $html, [0x80, 0x10FFFF, 0, ~0], 'UTF-8' );

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

	/**
	 * Saves HTML from DOMDocument and decode entities.
	 *
	 * @since TBD
	 *
	 * @param DOMDocument $dom
	 *
	 * @return string
	 */
	function get_dom_html( $dom ) {
		$html = $dom->saveHTML();
		$html = mb_convert_encoding( $html, 'UTF-8', 'HTML-ENTITIES' );

		return $html;
	}
}
