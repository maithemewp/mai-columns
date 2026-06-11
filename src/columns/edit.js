import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	JustifyContentControl,
	BlockVerticalAlignmentToolbar,
} from "@wordpress/block-editor";
import { createBlock } from "@wordpress/blocks";
import { useDispatch } from "@wordpress/data";
import {
	PanelBody,
	BaseControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from "@wordpress/components";

import {
	getFlexCSSValue,
	getBlockGap,
	isFraction,
	isPercentage,
	isValidCSSValue,
} from "../functions";

import SelectSortable from "../components/SelectSortable";

export default function Edit({ clientId, attributes, setAttributes }) {
	const { style, justifyContent, alignItems, reverseLg, reverseMd, reverseSm } = attributes;

	const options = [
		{ value: "1/4", label: __("25%") },
		{ value: "1/3", label: __("33%") },
		{ value: "1/2", label: __("50%") },
		{ value: "2/3", label: __("66%") },
		{ value: "3/4", label: __("75%") },
		{ value: "1/1", label: __("100%") },
		{ value: "fit", label: __("Fit Content") },
		{ value: "fill", label: __("Fill Space") },
		{ value: "break", label: __("Row Break") },
	];

	/**
	 * Make sure a value is valid new option.
	 * No need to check for fit, fill, break because those are predefined.
	 * Fractions and percentages are capped at 100% — a column wider than its
	 * row is never a layout, it's a typo.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} value
	 *
	 * @return {bool}
	 */
	const isValidNew = (value) => {
		if (!value) {
			return false;
		}

		if (isFraction(value)) {
			const [numerator, denominator] = value.split("/").map(Number);
			return numerator <= denominator;
		}

		if (isPercentage(value)) {
			return parseFloat(value) <= 100;
		}

		return isValidCSSValue(value);
	};

	const { insertBlock } = useDispatch("core/block-editor");

	/**
	 * Inserts a new mai/column inside this block (toolbar "Add Column").
	 */
	const insertColumn = () => {
		insertBlock(createBlock("mai/column", {}), undefined, clientId);
	};

	// Container props mirror the front-end render: always emitted (defaults
	// when unset) so a nested block never inherits an ancestor's values.
	const inlineStyles = {
		"--justify-content": getFlexCSSValue(justifyContent),
		"--align-items": getFlexCSSValue(alignItems),
	};

	const gaps = style?.spacing?.blockGap
		? getBlockGap(style.spacing.blockGap)
		: { row: "var(--wp--style--block-gap, 0.5em)", column: "var(--wp--style--block-gap, 0.5em)" };
	inlineStyles["--row-gap"] = gaps.row;
	inlineStyles["--column-gap"] = gaps.column;

	const blockProps = useBlockProps({
		style: inlineStyles,
	});
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: ["mai/column"],
		template: [["mai/column"], ["mai/column"]],
	});

	return (
		<>
			<BlockControls group="block">
				<JustifyContentControl
					value={justifyContent}
					onChange={(value) => setAttributes({ justifyContent: value })}
				/>
				<BlockVerticalAlignmentToolbar
					value={alignItems}
					onChange={(value) => setAttributes({ alignItems: value })}
				/>
				<ToolbarGroup>
					<ToolbarButton onClick={insertColumn}>
						{__("Add Column")}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls key="Sizes">
				<PanelBody>
					<h2>{__("Column Arrangements")}</h2>
					<BaseControl
						help={__(
							"Arrangements respond to the space the columns sit in, not the device. Values repeat in the sequence you set. One value sizes all columns; an empty field inherits the next-wider setting."
						)}
					/>
					<BaseControl label={__("Wide")}>
						<SelectSortable
							key="sizesLg"
							attributeKey="sizesLg"
							attributes={attributes}
							setAttributes={setAttributes}
							options={options}
							isValidNewOption={(inputValue) => {
								return isValidNew( inputValue );
							}}
							formatCreateLabel={(inputValue) => {
								return inputValue && isValidNew(inputValue) ? `Add ${inputValue}` : "";
							}}
						/>
					</BaseControl>
					<BaseControl label={__("Medium")}>
						<SelectSortable
							key="sizesMd"
							attributeKey="sizesMd"
							attributes={attributes}
							setAttributes={setAttributes}
							options={options}
							isValidNewOption={(inputValue) => {
								return isValidNew( inputValue );
							}}
							formatCreateLabel={(inputValue) => {
								return inputValue && isValidNew(inputValue) ? `Add ${inputValue}` : "";
							}}
						/>
					</BaseControl>
					<BaseControl label={__("Narrow")}>
						<SelectSortable
							key="sizesSm"
							attributeKey="sizesSm"
							attributes={attributes}
							setAttributes={setAttributes}
							options={options}
							isValidNewOption={(inputValue) => {
								return isValidNew( inputValue );
							}}
							formatCreateLabel={(inputValue) => {
								return inputValue && isValidNew(inputValue) ? `Add ${inputValue}` : "";
							}}
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody title={__("Order")} initialOpen={false}>
					<BaseControl
						help={__(
							"Reverses the visual order of the columns in that width bucket. Keyboard and screen reader order is unchanged."
						)}
					/>
					<ToggleControl
						label={__("Reverse on Wide")}
						checked={reverseLg}
						onChange={(value) => setAttributes({ reverseLg: value })}
					/>
					<ToggleControl
						label={__("Reverse on Medium")}
						checked={reverseMd}
						onChange={(value) => setAttributes({ reverseMd: value })}
					/>
					<ToggleControl
						label={__("Reverse on Narrow")}
						checked={reverseSm}
						onChange={(value) => setAttributes({ reverseSm: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...innerBlocksProps} />
		</>
	);
}