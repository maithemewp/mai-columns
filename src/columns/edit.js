import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InspectorControls, BlockControls, JustifyContentControl, BlockVerticalAlignmentToolbar } from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { PanelBody, BaseControl } from '@wordpress/components';
import { getFlexCSSValue } from '../functions';
import MultiSelectSortDuplicates from '../components/multiselect-sortable-duplicates/MultiSelectSortDuplicates';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { style, justifyContent, alignItems, sizesLg, sizesMd, sizesSm } = attributes;

	const options = [
		{ value: '1/4', label: __( '25' ) },
		{ value: '1/3', label: __( '33' ) },
		{ value: '1/2', label: __( '50' ) },
		{ value: '2/3', label: __( '66' ) },
		{ value: '3/4', label: __( '75' ) },
		{ value: '1/1', label: __( '100' ) },
		{ value: 'fit', label: __( 'Fit Content' ) },
		{ value: 'fill', label: __( 'Fill Space' ) },
		{ value: 'break', label: __( 'Row Break' ) },
	];

	const mapValuesToLabels = (values) => {
		return values.map(value => {
			const option = options.find(opt => opt.value === value);
			return option ? option.label : value;
		});
	};

	const mapLabelsToValues = (values) => {
		return values.map(value => {
			const option = options.find(opt => opt.label === value);
			return option ? option.value : value;
		});
	};

	/**
	 * Sets client ID as block ID.
	 */
	useEffect(() => {
		setAttributes({ id: clientId });
	}, [clientId]);

	/**
	 * Build inline styles.
	 */
	const inlineStyles = useBlockProps().style || {};

	inlineStyles['--justify-content'] = getFlexCSSValue( justifyContent );
	inlineStyles['--align-items']     = getFlexCSSValue( alignItems );

	if ( style && style.spacing.blockGap ) {
		const gaps = getBlockGap( style.spacing.blockGap );

		inlineStyles['--row-gap']    = gaps.row;
		inlineStyles['--column-gap'] = gaps.column;
	}

	/**
	 * Set block props.
	 */
	const props = {
		className: 'mai-columns',
		style: inlineStyles
	};

	const blockProps       = useBlockProps( props );
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: ['mai/column'],
		template: [['mai/column'], ['mai/column']],
	});

	return (
		<>
			<BlockControls group="block">
				<JustifyContentControl
					value={justifyContent}
					onChange={(value) => {
						setAttributes({ justifyContent: value });
					}}
				/>
				<BlockVerticalAlignmentToolbar
					value={alignItems}
					onChange={(value) => {
						setAttributes({ alignItems: value });
					}}
				/>
			</BlockControls>
			<InspectorControls key="Sizes">
				<PanelBody>
					<h2>{__( 'Column Arrangements' )}</h2>
					<BaseControl
						help={__( 'Custom arrangements will repeat in the sequence you set here. Set just one value if you want all sizes to be the same width. Leave empty to have equal widths based on the number of items. An empty field preceded by a non-empty field will inherit the previous field\'s settings.' )}
					/>
					<BaseControl label={__( 'Large Tablet' )}>
						<MultiSelectSortDuplicates
							key="sizesLg"
							options={options}
							value={mapValuesToLabels(sizesLg)}
							onChange={(values) => {
								setAttributes({ sizesLg: mapLabelsToValues(values) });
							}}
							onCreateOption={(value) => {
								setAttributes({ sizesLg: [...sizesLg, value] });
							}}
						/>
					</BaseControl>
					<BaseControl label={__( 'Small Tablet' )}>
						<MultiSelectSortDuplicates
							key="sizesMd"
							options={options}
							value={mapValuesToLabels(sizesMd)}
							onChange={(values) => {
								setAttributes({ sizesMd: mapLabelsToValues(values) });
							}}
							onCreateOption={(value) => {
								setAttributes({ sizesMd: [...sizesMd, value] });
							}}
						/>
					</BaseControl>
					<BaseControl label={__( 'Mobile' )}>
						<MultiSelectSortDuplicates
							key="sizesSm"
							options={options}
							value={mapValuesToLabels(sizesSm)}
							onChange={(values) => {
								setAttributes({ sizesSm: mapLabelsToValues(values) });
							}}
							onCreateOption={(value) => {
								setAttributes({ sizesSm: [...sizesSm, value] });
							}}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<div {...innerBlocksProps} />
		</>
	);
}