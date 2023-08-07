<?php
/**
 * Plugin Name:       Mai Rows
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mai-rows
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_mai_rows_block_init() {
	register_block_type( __DIR__ . '/build',
		[
			'render_callback' => 'mai_do_rows_block',
		]
	);
}
add_action( 'init', 'create_block_mai_rows_block_init' );


function mai_do_rows_block( $block_attributes, $content ) {
	$attributes = get_block_wrapper_attributes();
	ray( $block_attributes, $content );
	return sprintf( '<div class="mai-rows">%s</div>', $content );
}