# Changelog

## 0.2.0 (Unreleased)
* Fixed: Row composition follows the arrangement, never content — a fill column's wide content (long word, image) no longer forces unintended wraps (min-width: 0 on columns).
* Fixed: A parent's horizontal justify setting no longer bleeds into every column's vertical content alignment (custom-prop inheritance sealed at the column).
* Added: Border supports (color/radius/style/width) on both blocks.
* Added: Typography (font-family/weight/style/transform/decoration/letter-spacing + size/line-height), shadow, gradient/heading/button color, and client-navigation supports on both blocks — parity with core/columns. These use the `__experimental*` keys by design; see `docs/block-supports-keys.md` for why and when to flip them.
* Changed: Build tooling on `@wordpress/scripts` 32 (modern Sass API; clears the legacy-JS-API deprecation warnings).
* Fixed: Children now receive the full ancestry context (postId etc.) — context-consuming blocks like core/avatar rendered empty inside columns.
* Changed: Default column gap follows the theme's global block gap.
* Changed: Fixed-length columns (`300px`, `20rem`) are truly fixed — siblings never squeeze them (they wrap to a new row instead), shrinking only when the container itself is narrower than the fixed size.
* Added: Column blockGap renders as the column's content gap (children get the standard flex-layout margin reset — gap is the single spacing source, defaulting to the theme's global block gap).
* Added: Column ordering — per-bucket "Reverse" toggles on the parent and a per-column order value per bucket (visual order only; keyboard/screen reader order unchanged).
* Added: Tag-based updater (Plugin Update Checker v5) — sites see updates once releases are tagged.
* Changed: Rebuilt rendering — the parent block resolves the whole arrangement and passes each column its values. Duplicated blocks, repeated patterns, and nested columns all render correctly, and the editor no longer opens dirty.
* Changed: Width buckets respond to the container (container queries), not the viewport. Labels renamed Desktop/Tablet/Mobile → Wide/Medium/Narrow; boundaries 640/1024px.
* Changed: Editor preview and front-end render share one fixture-locked arrangement resolver.
* Fixed: Custom tokens can repeat without polluting the options list; fractions/percentages over 100% rejected.
* Changed: Requires WordPress 7.0+ / PHP 8.2+.
