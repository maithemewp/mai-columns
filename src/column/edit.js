import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	InnerBlocks,
	InspectorControls,
} from "@wordpress/block-editor";
import { PanelBody, BaseControl, TextControl } from "@wordpress/components";

import { useSelect } from "@wordpress/data";

import { getFlexCSSValue, getBlockGap } from "../functions";
import { resolve } from "../functions/arrangement.mjs";

/**
 * The edit function, describing the block in the editor.
 *
 * The per-bucket size/flex custom props come from the shared arrangement
 * resolver — the same fixture-locked math the PHP render runs — so the
 * canvas preview cannot drift from the front end.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const { alignItems, orderLg, orderMd, orderSm, style } = attributes;

	/**
	 * Gets this column's index and its sibling count — the two resolver
	 * inputs beyond the parent's size arrays.
	 */
	const { blockIndex, siblingCount } = useSelect(
		(select) => {
			const { getBlockIndex, getBlockRootClientId, getBlockCount } =
				select("core/block-editor");

			return {
				blockIndex: getBlockIndex(clientId),
				siblingCount: getBlockCount(getBlockRootClientId(clientId)),
			};
		},
		[clientId],
	);

	/**
	 * Gets the inner block count — the appender only shows on an empty column.
	 */
	const blockCount = useSelect(
		(select) => select("core/block-editor").getBlockCount(clientId),
		[clientId],
	);

	/**
	 * Build inline styles from the resolved arrangement.
	 */
	const resolved = resolve(
		context["mai/sizesLg"] ?? [],
		context["mai/sizesMd"] ?? [],
		context["mai/sizesSm"] ?? [],
		siblingCount,
		{
			lg: !!context["mai/reverseLg"],
			md: !!context["mai/reverseMd"],
			sm: !!context["mai/reverseSm"],
		},
	)[blockIndex];

	const inlineStyles = { ...(resolved?.styles ?? {}) };

	// Justify content is align items value since flex-direction is column.
	inlineStyles["--content-justify"] = getFlexCSSValue(alignItems);

	// Always set, like the front end: ancestor columns' values must not
	// inherit into this column's content spacing.
	inlineStyles["--content-gap"] = style?.spacing?.blockGap
		? getBlockGap(style.spacing.blockGap).row
		: "var(--wp--style--block-gap, 1em)";

	// Per-column order overrides beat any parent reverse order.
	for (const [bucket, value] of [["lg", orderLg], ["md", orderMd], ["sm", orderSm]]) {
		if (undefined !== value && "" !== value) {
			inlineStyles[`--order-${bucket}`] = String(value);
		}
	}

	const orderControl = (label, key, value) => (
		<TextControl
			label={label}
			type="number"
			value={value ?? ""}
			onChange={(next) => {
				setAttributes({ [key]: "" === next ? undefined : Number(next) });
			}}
		/>
	);

	/**
	 * Show the appender only when the column is empty.
	 */
	const appenderToUse = () => {
		if (!blockCount) {
			return (
				<InnerBlocks.ButtonBlockAppender
					rootClientId={clientId}
					style={{ alignSelf: "auto" }}
				/>
			);
		}

		return false;
	};

	const blockProps = useBlockProps({
		className: "mai-column",
		style: inlineStyles,
	});
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		renderAppender: appenderToUse,
	});

	return (
		<>
			<BlockControls group="block">
				<BlockVerticalAlignmentToolbar
					value={alignItems}
					onChange={(value) => {
						setAttributes({ alignItems: value });
					}}
				/>
			</BlockControls>
			<InspectorControls key="Order">
				<PanelBody title={__("Order")} initialOpen={false}>
					<BaseControl
						help={__(
							"Visual order of this column within its width bucket — lower numbers come first. Keyboard and screen reader order is unchanged."
						)}
					/>
					{orderControl(__("Wide"), "orderLg", orderLg)}
					{orderControl(__("Medium"), "orderMd", orderMd)}
					{orderControl(__("Narrow"), "orderSm", orderSm)}
				</PanelBody>
			</InspectorControls>
			<div {...innerBlocksProps} />
		</>
	);
}
