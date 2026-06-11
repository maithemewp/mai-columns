<?php

declare( strict_types=1 );

namespace Mai\Columns\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Child block: a dumb shell. Its per-bucket size/flex custom props arrive
 * fully resolved via the 'mai/columnStyles' context the parent injects at
 * render — this class holds zero layout logic.
 */
final class Column {

	public function register(): void {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	public function register_block(): void {
		register_block_type(
			MAI_COLUMNS_DIR . 'build/column',
			[
				'render_callback' => [ $this, 'render' ],
			]
		);
	}

	/**
	 * @param array    $attributes
	 * @param string   $content
	 * @param WP_Block $block
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$style = '';

		foreach ( (array) ( $block->context['mai/columnStyles'] ?? [] ) as $prop => $value ) {
			$style .= sprintf( '%s:%s;', $prop, esc_attr( (string) $value ) );
		}

		// Content props (vertical alignment + gap) are ALWAYS emitted, with
		// defaults when unset — custom props inherit, so a nested column
		// would otherwise pick up an ancestor column's values. Same sealing
		// rule as the container's props. Distinct --content-* names because
		// this element also inherits the parent's --column-gap for the
		// --flex-basis math — container names can never be reused here.
		$gap = Columns::block_gap( $attributes['style']['spacing']['blockGap'] ?? null );

		$style .= sprintf( '--content-justify:%s;', esc_attr( Columns::flex_css_value( (string) ( $attributes['alignItems'] ?? '' ) ) ) );
		$style .= sprintf( '--content-gap:%s;', esc_attr( $gap['row'] ?? 'var(--wp--style--block-gap, 1em)' ) );

		// Per-column order overrides; later duplicate props win in CSS, so
		// these beat any parent-injected reverse order for the same bucket.
		foreach ( [ 'lg' => 'orderLg', 'md' => 'orderMd', 'sm' => 'orderSm' ] as $bucket => $key ) {
			if ( isset( $attributes[ $key ] ) && is_numeric( $attributes[ $key ] ) ) {
				$style .= sprintf( '--order-%s:%d;', $bucket, (int) $attributes[ $key ] );
			}
		}

		$wrapper = get_block_wrapper_attributes(
			[
				'class' => 'mai-column',
				'style' => $style,
			]
		);

		return sprintf( '<div %s>%s</div>', $wrapper, $content );
	}
}
