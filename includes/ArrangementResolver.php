<?php

declare( strict_types=1 );

namespace Mai\Columns;

defined( 'ABSPATH' ) || exit;

/**
 * Pure arrangement math — no WP functions, harness-locked against the shared
 * fixtures (tests/fixtures/arrangements.json) that the editor's arrangement.js
 * also consumes, so PHP render and editor preview cannot drift.
 *
 * Fractions serialize SPACED ("1 / 2", never "1/2"): a recipe plugin's
 * fraction-beautifier once regex-replaced bare 1/2 inside style="" with a ½
 * glyph on a Mai Engine site. Spaced form is equally valid in calc().
 */
final class ArrangementResolver {

	private const BUCKETS = [ 'lg', 'md', 'sm' ];

	/**
	 * Resolves per-child styles and break markers for all buckets.
	 *
	 * Reversed buckets emit per-child --order-{bucket} props (count down to 1)
	 * — CSS `order` applies before flex line wrapping, so it reverses rows and
	 * stacked layouts alike, and the render can copy a child's order onto its
	 * break spans to keep breaks adjacent under reversal.
	 *
	 * @param array<string>      $lg
	 * @param array<string>      $md
	 * @param array<string>      $sm
	 * @param array<string,bool> $reverse Per-bucket reverse flags, e.g. [ 'sm' => true ].
	 *
	 * @return array<int,array{styles:array<string,string>,breaks:array<int,string>}>
	 */
	public static function resolve( array $lg, array $md, array $sm, int $count, array $reverse = [] ): array {
		$buckets = self::with_fallbacks( [ 'lg' => $lg, 'md' => $md, 'sm' => $sm ] );
		$result  = [];

		for ( $i = 0; $i < $count; $i++ ) {
			$result[ $i ] = [ 'styles' => [], 'breaks' => [] ];
		}

		foreach ( self::BUCKETS as $bucket ) {
			$pattern = array_values( $buckets[ $bucket ] );
			$tokens  = array_filter( $pattern, fn( $t ) => 'break' !== $t );

			// A pattern of only breaks degrades to full-width, no breaks.
			if ( ! $tokens ) {
				$pattern = [ '1/1' ];
			}

			$p = 0;
			$n = count( $pattern );

			for ( $i = 0; $i < $count; $i++ ) {
				// Consume break markers: they flag the NEXT child.
				while ( 'break' === $pattern[ $p % $n ] ) {
					if ( ! in_array( $bucket, $result[ $i ]['breaks'], true ) ) {
						$result[ $i ]['breaks'][] = $bucket;
					}
					$p++;
				}

				$token = (string) $pattern[ $p % $n ];
				$p++;

				$result[ $i ]['styles'][ "--size-{$bucket}" ] = self::size( $token );
				$result[ $i ]['styles'][ "--flex-{$bucket}" ] = self::flex( $token );

				if ( ! empty( $reverse[ $bucket ] ) ) {
					$result[ $i ]['styles'][ "--order-{$bucket}" ] = (string) ( $count - $i );
				}
			}
		}

		// Group each child's props lg, md, sm (the order the fixtures pin).
		foreach ( $result as $i => $entry ) {
			$ordered = [];

			foreach ( self::BUCKETS as $bucket ) {
				$ordered[ "--size-{$bucket}" ] = $entry['styles'][ "--size-{$bucket}" ];
				$ordered[ "--flex-{$bucket}" ] = $entry['styles'][ "--flex-{$bucket}" ];

				if ( isset( $entry['styles'][ "--order-{$bucket}" ] ) ) {
					$ordered[ "--order-{$bucket}" ] = $entry['styles'][ "--order-{$bucket}" ];
				}
			}

			$result[ $i ]['styles'] = $ordered;
		}

		return $result;
	}

	/**
	 * Nearest-defined fallback, preferring the larger bucket; all-empty
	 * degrades to full width.
	 *
	 * @param array<string,array<string>> $buckets
	 *
	 * @return array<string,array<string>>
	 */
	private static function with_fallbacks( array $buckets ): array {
		$lg = $buckets['lg'] ?: ( $buckets['md'] ?: $buckets['sm'] );
		$md = $buckets['md'] ?: ( $buckets['lg'] ?: $buckets['sm'] );
		$sm = $buckets['sm'] ?: ( $buckets['md'] ?: $buckets['lg'] );

		return [
			'lg' => $lg ?: [ '1/1' ],
			'md' => $md ?: [ '1/1' ],
			'sm' => $sm ?: [ '1/1' ],
		];
	}

	/**
	 * Spaced fraction for fractional tokens; "1" (full flex share) otherwise.
	 */
	private static function size( string $token ): string {
		$fraction = self::to_fraction( $token );

		return $fraction ?: '1';
	}

	/**
	 * Flex shorthand per token type.
	 */
	private static function flex( string $token ): string {
		if ( 'fit' === $token ) {
			return '0 1 auto';
		}

		if ( 'fill' === $token ) {
			return '1 0 0';
		}

		if ( self::to_fraction( $token ) ) {
			return '0 1 var(--flex-basis)';
		}

		// Arbitrary CSS length (300px, 20rem, …).
		return sprintf( '0 1 %s', $token );
	}

	/**
	 * Normalizes "1/2", "1 / 2", and "50%" to the SPACED fraction "1 / 2".
	 * Empty means full width. Returns '' for non-fractional tokens
	 * (fit/fill/lengths).
	 */
	private static function to_fraction( string $token ): string {
		$token = trim( $token );

		if ( '' === $token ) {
			return '1 / 1';
		}

		if ( preg_match( '#^(\d+)\s*/\s*(\d+)$#', $token, $m ) ) {
			return sprintf( '%d / %d', (int) $m[1], (int) $m[2] );
		}

		// Percentages round to the nearest integer percent, then reduce.
		if ( preg_match( '/^\d+(\.\d+)?%$/', $token ) ) {
			$numerator   = (int) round( (float) rtrim( $token, '%' ) );
			$denominator = 100;
			$gcd         = self::gcd( $numerator, $denominator );

			return sprintf( '%d / %d', intdiv( $numerator, $gcd ), intdiv( $denominator, $gcd ) );
		}

		return '';
	}

	private static function gcd( int $a, int $b ): int {
		return 0 === $b ? $a : self::gcd( $b, $a % $b );
	}
}
