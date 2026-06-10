# Changelog

## 0.2.0 (Unreleased)
* Added: Column ordering — per-bucket "Reverse" toggles on the parent and a per-column order value per bucket (visual order only; keyboard/screen reader order unchanged).
* Added: Tag-based updater (Plugin Update Checker v5) — sites see updates once releases are tagged.
* Changed: Rebuilt rendering — the parent block resolves the whole arrangement and passes each column its values. Duplicated blocks, repeated patterns, and nested columns all render correctly, and the editor no longer opens dirty.
* Changed: Width buckets respond to the container (container queries), not the viewport. Labels renamed Desktop/Tablet/Mobile → Wide/Medium/Narrow; boundaries 640/1024px.
* Changed: Editor preview and front-end render share one fixture-locked arrangement resolver.
* Fixed: Custom tokens can repeat without polluting the options list; fractions/percentages over 100% rejected.
* Changed: Requires WordPress 7.0+ / PHP 8.2+.
