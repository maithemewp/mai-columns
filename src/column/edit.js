/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	InnerBlocks,
} from "@wordpress/block-editor";

import { useSelect } from "@wordpress/data";

import { getFlexCSSValue } from "../functions";
import { resolve } from "../functions/arrangement.mjs";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * The per-bucket size/flex custom props come from the shared arrangement
 * resolver — the same fixture-locked math the PHP render runs — so the canvas
 * preview cannot drift from the front end.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const { alignItems } = attributes;

	/**
	 * Gets this column's index among its siblings and the sibling count,
	 * the two inputs the resolver needs beyond the parent's size arrays.
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
	 * Gets the inner block count, for the appender.
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
	)[blockIndex];

	const inlineStyles = { ...(resolved?.styles ?? {}) };

	// Justify content is align items value since flex-direction is column.
	inlineStyles["--justify-content"] = getFlexCSSValue(alignItems);

	/**
	 * Define the appender to use.
	 * If no blocks, add the appender.
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

	/**
	 * Set props.
	 */
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
			<div {...innerBlocksProps} />
		</>
	);
}
