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
import { useEffect } from "@wordpress/element";
import {
	PanelBody,
	BaseControl,
	ToolbarButton,
	ToolbarGroup,
} from "@wordpress/components";

import {
	getFlexCSSValue,
	getBlockGap,
	isFraction,
	isPercentage,
	isValidCSSValue,
	mapValuesToLabels,
	mapLabelsToValues,
} from "../functions";

import SelectSortable from "../components/SelectSortable";
import MultiSelectSortableDuplicates from "../components/MultiSelectSortableDuplicates";

export default function Edit({ clientId, attributes, setAttributes }) {
	const { style, justifyContent, alignItems, sizesLg, sizesMd, sizesSm } = attributes;

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
	 * No need to check for auto, fit, fill because those are predefined.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} value
	 *
	 * @return {bool}
	 */
	const isValidNew = ( value ) => {
		return value && ( isFraction( value ) || isValidCSSValue( value ) );
	}

	// Get the dispatch function to insert a block
	const { insertBlock } = useDispatch("core/block-editor");

	// Function to insert a new column block
	const insertColumn = () => {
		// Create the new block
		const newBlock = createBlock("mai/column", {});
		// Insert the new block inside the current block (identified by clientId)
		insertBlock(newBlock, undefined, clientId);
	};

	// Set the clientId as an attribute to identify the block
	useEffect(() => {
		setAttributes({ id: clientId });
	}, [clientId, setAttributes]);

	// Build inline styles based on attributes
	const inlineStyles = useBlockProps().style || {};
	inlineStyles["--justify-content"] = getFlexCSSValue(justifyContent);
	inlineStyles["--align-items"] = getFlexCSSValue(alignItems);

	if (style && style.spacing.blockGap) {
		const gaps = getBlockGap(style.spacing.blockGap);
		inlineStyles["--row-gap"] = gaps.row;
		inlineStyles["--column-gap"] = gaps.column;
	} else {
		inlineStyles["--row-gap"] = "2rem";
		inlineStyles["--column-gap"] = "2rem";
	}

	// Set block props and inner block props
	const blockProps = useBlockProps({
		className: "mai-columns",
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
							"Custom arrangements will repeat in the sequence you set here. Set just one value if you want all sizes to be the same width. Leave empty to have equal widths based on the number of items. An empty field preceded by a non-empty field will inherit the previous field's settings."
						)}
					/>
					<BaseControl label={__("Desktop")}>
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
					<BaseControl label={__("Tablet")}>
						{/* <MultiSelectSortableDuplicates
							key="sizesMd"
							options={options}
							value={mapValuesToLabels(sizesMd, options)}
							onChange={(values) => {
								setAttributes({ sizesMd: mapLabelsToValues(values, options) });
							}}
							onCreateOption={(value) => {
								setAttributes({ sizesMd: [...sizesMd, value] });
							}}
							isValidNewOption={ isValidNew }
						/> */}
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
					<BaseControl label={__("Mobile")}>
						{/* <MultiSelectSortableDuplicates
							key="sizesSm"
							options={options}
							value={mapValuesToLabels(sizesSm, options)}
							onChange={(values) => {
								setAttributes({ sizesSm: mapLabelsToValues(values, options) });
							}}
							onCreateOption={(value) => {
								setAttributes({ sizesSm: [...sizesSm, value] });
							}}
							isValidNewOption={ isValidNew }
						/> */}
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
			</InspectorControls>
			<div {...innerBlocksProps} />
		</>
	);
}