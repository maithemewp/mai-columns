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

defined( 'ABSPATH' ) || exit;

define( 'MAI_COLUMNS_FILE', __FILE__ );
define( 'MAI_COLUMNS_DIR', plugin_dir_path( __FILE__ ) );

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/includes/ArrangementResolver.php';
require_once __DIR__ . '/includes/Blocks/Columns.php';
require_once __DIR__ . '/includes/Blocks/Column.php';
require_once __DIR__ . '/includes/Updater.php';

( new Mai\Columns\Blocks\Columns() )->register();
( new Mai\Columns\Blocks\Column() )->register();
( new Mai\Columns\Updater() )->register();
