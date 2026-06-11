<?php
// Plain-PHP harness for Mai\Columns\ArrangementResolver. Runs the shared fixtures.
declare( strict_types=1 );

define( 'ABSPATH', __DIR__ . '/../../' );

require_once __DIR__ . '/../../includes/ArrangementResolver.php';

use Mai\Columns\ArrangementResolver;

$fixtures = json_decode( (string) file_get_contents( __DIR__ . '/../fixtures/arrangements.json' ), true );
$pass     = 0;
$fail     = 0;

foreach ( $fixtures['cases'] as $case ) {
	$got = ArrangementResolver::resolve( $case['lg'], $case['md'], $case['sm'], $case['count'], $case['reverse'] ?? [] );

	if ( $got === $case['expected'] ) {
		$pass++;
		echo "PASS: {$case['name']}\n";
	} else {
		$fail++;
		echo "FAIL: {$case['name']}\n";
		var_export( $got );
		echo "\n";
	}
}

echo "\n{$pass} passed, {$fail} failed\n";
exit( $fail > 0 ? 1 : 0 );
