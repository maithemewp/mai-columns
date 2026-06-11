<?php

declare( strict_types=1 );

namespace Mai\Columns;

defined( 'ABSPATH' ) || exit;

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

/**
 * Tag-based updater (no setBranch): sites only see an update when a GitHub
 * release/tag exists, so wiring this pre-release is inert until we tag.
 */
final class Updater {

	/**
	 * Hooks the updater.
	 *
	 * @since 0.2.0
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'plugins_loaded', [ $this, 'init' ] );
	}

	/**
	 * Builds the update checker.
	 *
	 * @since 0.2.0
	 *
	 * @uses https://github.com/YahnisElsts/plugin-update-checker/
	 *
	 * @return void
	 */
	public function init(): void {
		if ( ! class_exists( PucFactory::class ) ) {
			return;
		}

		$updater = PucFactory::buildUpdateChecker( 'https://github.com/maithemewp/mai-columns/', MAI_COLUMNS_FILE, 'mai-columns' );

		// Maybe set github api token.
		if ( defined( 'MAI_GITHUB_API_TOKEN' ) ) {
			$updater->setAuthentication( MAI_GITHUB_API_TOKEN );
		}

		// Add icons for Dashboard > Updates screen.
		$updater->addResultFilter(
			function ( $info ) {
				$info->icons = [
					'1x' => plugins_url( 'assets/img/icon-128x128.png', MAI_COLUMNS_FILE ),
					'2x' => plugins_url( 'assets/img/icon-256x256.png', MAI_COLUMNS_FILE ),
				];

				return $info;
			}
		);
	}
}
