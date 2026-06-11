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

	public function register(): void {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	public function register_block(): void {
		register_block_type(
			MAI_COLUMNS_DIR . 'build/columns',
			[
				'skip_inner_blocks' => true,
				'render_callback'   => [ $this, 'render' ],
			]
		);
	}

	/**
	 * @param array    $attributes
	 * @param string   $content Always '' — skip_inner_blocks.
	 * @param WP_Block $block
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

		// Children must receive the FULL ancestry context, not this block's
		// uses_context-filtered $block->context — otherwise template-level
		// defaults (postId, postType, …) vanish for every descendant and
		// blocks like core/avatar render empty. Core hits the same wall in
		// post-template and works around the protected property with a
		// render_block_context filter for the two keys it knows it needs;
		// our children are arbitrary, so forward everything.
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
					'<span class="mai-column__break mai-column__break-%s"%s aria-hidden="true"></span>',
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

		$wrapper = get_block_wrapper_attributes(
			[
				'class' => 'mai-columns',
				'style' => implode( '', $style ),
			]
		);

		return sprintf( '<div %s>%s</div>', $wrapper, $inner );
	}

	/**
	 * Maps editor alignment tokens to flex CSS values.
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
