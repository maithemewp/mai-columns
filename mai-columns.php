<?php
/**
 * Plugin Name:       Mai Columns
 * Description:       Repeatable, per-width column arrangements with simple and complex layouts.
 * Requires at least: 7.0
 * Requires PHP:      8.2
 * Version:           0.2.0
 * Author:            BizBudding
 * Author URI:        https://bizbudding.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mai-columns
 */

declare( strict_types=1 );

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

defined( 'ABSPATH' ) || exit;

define( 'MAI_COLUMNS_DIR', plugin_dir_path( __FILE__ ) );

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/includes/ArrangementResolver.php';
require_once __DIR__ . '/includes/Blocks/Columns.php';
require_once __DIR__ . '/includes/Blocks/Column.php';

( new Mai\Columns\Blocks\Columns() )->register();
( new Mai\Columns\Blocks\Column() )->register();

/**
 * Tag-based updater (no setBranch): sites only see an update when a GitHub
 * release/tag exists, so wiring this pre-release is inert until we tag.
 */
add_action( 'plugins_loaded', function (): void {
	if ( ! class_exists( PucFactory::class ) ) {
		return;
	}

	$updater = PucFactory::buildUpdateChecker( 'https://github.com/maithemewp/mai-columns/', __FILE__, 'mai-columns' );

	// Maybe set github api token.
	if ( defined( 'MAI_GITHUB_API_TOKEN' ) ) {
		$updater->setAuthentication( MAI_GITHUB_API_TOKEN );
	}

	// Add icons for Dashboard > Updates screen.
	$updater->addResultFilter(
		function ( $info ) {
			$info->icons = [
				'1x' => plugins_url( 'assets/img/icon-128x128.png', __FILE__ ),
				'2x' => plugins_url( 'assets/img/icon-256x256.png', __FILE__ ),
			];

			return $info;
		}
	);
} );
