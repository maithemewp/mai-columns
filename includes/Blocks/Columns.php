<?php

declare( strict_types=1 );

namespace Mai\Columns\Blocks;

defined( 'ABSPATH' ) || exit;

use Mai\Columns\ArrangementResolver;
use WP_Block;

/**
 * Parent block. Registers with skip_inner_blocks (the core/post-template
 * pattern): WP does NOT pre-render children; render() resolves the
 * arrangement once and renders each child itself, injecting the child's
 * resolved styles via context and inserting break spans as real siblings.
 * No saved ids, no static state — duplication/nesting/repeat-render safe
 * by construction.
 */
final class Columns {

	/**
	 * Hooks block registration.
	 *
	 * @since 0.2.0
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	/**
	 * Registers the block.
	 *
	 * @since 0.2.0
	 *
	 * @return void
	 */
	public function register_block(): void {
		// Supports live in build/columns/block.json. Border + the six typography
		// sub-controls use the __experimental* keys on purpose — they're the only
		// keys WP 7.0's serializer reads. See docs/block-supports-keys.md before
		// "modernizing" them to the un-prefixed names.
		register_block_type(
			MAI_COLUMNS_DIR . 'build/columns',
			[
				'skip_inner_blocks' => true,
				'render_callback'   => [ $this, 'render' ],
			]
		);
	}

	/**
	 * Renders the container and its children.
	 *
	 * @since 0.2.0
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content. Always '' — skip_inner_blocks.
	 * @param WP_Block $block      The block instance.
	 *
	 * @return string
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$children = $block->parsed_block['innerBlocks'] ?? [];

		if ( ! $children ) {
			return '';
		}

		$resolved = ArrangementResolver::resolve(
			(array) ( $attributes['sizesLg'] ?? [] ),
			(array) ( $attributes['sizesMd'] ?? [] ),
			(array) ( $attributes['sizesSm'] ?? [] ),
			count( $children ),
			[
				'lg' => ! empty( $attributes['reverseLg'] ),
				'md' => ! empty( $attributes['reverseMd'] ),
				'sm' => ! empty( $attributes['reverseSm'] ),
			]
		);

		// Children need the FULL ancestry context, not the uses_context-filtered
		// $block->context — otherwise postId/postType vanish for descendants and
		// blocks like core/avatar render empty. The property is protected;
		// reflection beats core post-template's filter hack because our
		// children are arbitrary.
		$available = ( new \ReflectionProperty( WP_Block::class, 'available_context' ) )->getValue( $block );

		$inner = '';

		foreach ( array_values( $children ) as $i => $child ) {
			// Break spans copy their child's order props so a break stays
			// adjacent to the column it precedes when a bucket is reversed.
			$break_style = '';

			foreach ( $resolved[ $i ]['styles'] as $prop => $value ) {
				if ( str_starts_with( $prop, '--order-' ) ) {
					$break_style .= sprintf( '%s:%s;', $prop, esc_attr( $value ) );
				}
			}

			foreach ( $resolved[ $i ]['breaks'] as $bucket ) {
				$inner .= sprintf(
					'<span class="wp-block-mai-columns__break wp-block-mai-columns__break-%s"%s aria-hidden="true"></span>',
					esc_attr( $bucket ),
					$break_style ? sprintf( ' style="%s"', $break_style ) : ''
				);
			}

			$inner .= ( new WP_Block(
				$child,
				[ 'mai/columnStyles' => $resolved[ $i ]['styles'] ] + $available
			) )->render();
		}

		// Container-level custom props from block settings. ALWAYS emitted
		// (initial when unset): custom props inherit downward, so a nested
		// mai/columns would otherwise pick up an ancestor mai/column's
		// --justify-content. Explicit defaults seal the inheritance leak.
		$style = [
			sprintf( '--justify-content:%s;', esc_attr( self::flex_css_value( (string) ( $attributes['justifyContent'] ?? '' ) ) ) ),
			sprintf( '--align-items:%s;', esc_attr( self::flex_css_value( (string) ( $attributes['alignItems'] ?? '' ) ) ) ),
		];

		foreach ( self::block_gap( $attributes['style']['spacing']['blockGap'] ?? null ) as $axis => $value ) {
			$style[] = sprintf( '--%s-gap:%s;', $axis, esc_attr( $value ) );
		}

		$wrapper = self::wrapper_attributes( implode( '', $style ) );

		return sprintf( '<div %s>%s</div>', $wrapper, $inner );
	}

	/**
	 * get_block_wrapper_attributes() hardcodes style before class; rebuild
	 * with class first to match the order static blocks get from the JS
	 * serializer.
	 *
	 * @since 0.2.0
	 *
	 * @param string $style The inline style value to merge into the wrapper.
	 *
	 * @return string
	 */
	public static function wrapper_attributes( string $style ): string {
		$wrapper = get_block_wrapper_attributes( [ 'style' => $style ] );

		$tags = new \WP_HTML_Tag_Processor( "<div {$wrapper}>" );
		$tags->next_tag();

		$attributes = [];

		foreach ( (array) $tags->get_attribute_names_with_prefix( '' ) as $name ) {
			$attributes[ $name ] = $tags->get_attribute( $name );
		}

		$class = $attributes['class'] ?? null;
		unset( $attributes['class'] );

		if ( null !== $class ) {
			$attributes = [ 'class' => $class ] + $attributes;
		}

		$pairs = [];

		foreach ( $attributes as $name => $value ) {
			$pairs[] = true === $value ? $name : sprintf( '%s="%s"', $name, esc_attr( (string) $value ) );
		}

		return implode( ' ', $pairs );
	}

	/**
	 * Maps editor alignment tokens to flex CSS values.
	 *
	 * @since 0.2.0
	 *
	 * @param string $value The editor alignment token.
	 *
	 * @return string
	 */
	public static function flex_css_value( string $value ): string {
		return match ( $value ) {
			'top', 'left'      => 'flex-start',
			'middle', 'center' => 'center',
			'bottom', 'right'  => 'flex-end',
			'space-between'    => 'space-between',
			default            => 'initial',
		};
	}

	/**
	 * blockGap (single value or row/column array, preset slugs included) to
	 * row/column CSS values.
	 *
	 * @since 0.2.0
	 *
	 * @param string|array|null $gap The blockGap attribute value.
	 *
	 * @return array{row?:string,column?:string}
	 */
	public static function block_gap( string|array|null $gap ): array {
		if ( null === $gap ) {
			return [];
		}

		$to_css = static function ( string $value ): string {
			$parts = explode( '|', $value );
			$last  = array_pop( $parts );

			return count( $parts ) > 1 ? sprintf( 'var(--wp--preset--spacing--%s)', $last ) : $last;
		};

		if ( is_array( $gap ) ) {
			$out = [];

			if ( isset( $gap['top'] ) ) {
				$out['row'] = $to_css( (string) $gap['top'] );
			}

			if ( isset( $gap['left'] ) ) {
				$out['column'] = $to_css( (string) $gap['left'] );
			}

			return $out;
		}

		$css = $to_css( (string) $gap );

		return [
			'row'    => $css,
			'column' => $css,
		];
	}
}
