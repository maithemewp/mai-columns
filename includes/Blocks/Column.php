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

		// Vertical alignment: flex-direction is column, so alignItems maps to justify-content.
		if ( ! empty( $attributes['alignItems'] ) ) {
			$style .= sprintf( '--justify-content:%s;', esc_attr( Columns::flex_css_value( (string) $attributes['alignItems'] ) ) );
		}

		// Content gap from blockGap. Distinct prop name — the parent's
		// --row-gap/--column-gap inherit into this element and must not bleed
		// into the column's own content spacing.
		$gap = Columns::block_gap( $attributes['style']['spacing']['blockGap'] ?? null );

		if ( isset( $gap['row'] ) ) {
			$style .= sprintf( '--content-gap:%s;', esc_attr( $gap['row'] ) );
		}

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
