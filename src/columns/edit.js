/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InspectorControls, useBlockProps, useInnerBlocksProps, BlockControls, JustifyContentControl, BlockVerticalAlignmentToolbar } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, BaseControl, TextControl, FormTokenField } from '@wordpress/components';
import MaiMultiSelectDuplicate from './select-duplicate';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { style, justifyContent, alignItems, sizesLg, sizesMd, sizesSm } = attributes;

	/**
	 * Set default options for the select field.
	 */
	const options = [
		{
			value: '1/4',
			label: __( '25' ),
		},
		{
			value: '1/3',
			label: __( '33' ),
		},
		{
			value: '1/2',
			label: __( '50' ),
		},
		{
			value: '2/3',
			label: __( '66' ),
		},
		{
			value: '3/4',
			label: __( '75' ),
		},
		{
			value: '1/1',
			label: __( '100' ),
		},
		{
			value: 'fit',
			label: __( 'Fit Content' ),
		},
		{
			value: 'fill',
			label: __( 'Fill Space' ),
		},
	];

	/**
	 * Map values to labels.
	 *
	 * @since 0.1.0
	 *
	 * @return {string}
	 */
	const mapValuesToLabels = ( values ) => {
		return values.map( value => {
			const option = options.find( opt => opt.value === value );
			return option ? option.label : value;
		});
	}

	/**
	 * Map labels to values.
	 *
	 * @since 0.1.0
	 *
	 * @return {string}
	 */
	const mapLabelsToValues = ( values ) => {
		return values.map( value => {
			const option = options.find( opt => opt.label === value );
			return option ? option.value : value;
		});
	}

	/**
	 * Get the flex CSS value.
	 * TODO: This is duplicated in edit.js of the other block.
	 *
	 * @since 0.1.0
	 *
	 * @return {string}
	 */
	const getFlexCSSValue = ( value ) => {
		switch ( value ) {
			case 'top':
			case 'left':
				return 'flex-start';
			case 'middle':
			case 'center':
				return 'center';
			case 'bottom':
			case 'right':
				return 'flex-end';
			case 'space-between':
				return 'space-between';
			default:
				return 'initial';
		}
	};

	/**
	 * Converts blockGap values to CSS value.
	 *
	 * @since 0.1.0
	 *
	 * @param {string|array} gap The blockGap value.
	 *
	 * @return {string}
	 */
	const getBlockGap = ( gap ) => {
		const returnObj = {
			row: "initial",
			column: "initial",
		};

		if ( typeof gap === 'object' ) {
			if ( gap.top ) {
				returnObj.row = getBlockGapValue( gap.top );
			}

			if ( gap.left ) {
				returnObj.column = getBlockGapValue( gap.left );
			}
		} else {
			returnObj.row = returnObj.column = getBlockGapValue( gap );
		}

		return returnObj;
	};

	/**
	 * Gets the CSS value from the blockGap value.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} gap The blockGap value.
	 *
	 * @return {string}
	 */
	const getBlockGapValue = ( gap ) => {
		const array = gap.split( '|' );
		const last  = array.pop();

		return array.length > 1 ? `var(--wp--preset--spacing--${last})` : last;
	};

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
	const innerBlocksProps = useInnerBlocksProps(
		blockProps,
		{
			allowedBlocks: [ 'mai/column' ],
			orientation: 'horizontal',
			template: [
				[ 'mai/column' ],
				[ 'mai/column' ],
			]
		}
	);

	return (
		<>
			<BlockControls group="block">
				<JustifyContentControl
					value={ justifyContent }
					onChange={ ( value ) => {
						setAttributes( { justifyContent: value } );
					} }
				/>
				<BlockVerticalAlignmentToolbar
					value={ alignItems }
					onChange={ ( value ) => {
						setAttributes( { alignItems: value } );
					}}
				/>
			</BlockControls>
			<InspectorControls key="Sizes">
				<PanelBody>
					<h2>{ __( 'Column Arrangements' ) }</h2>
					<BaseControl
						help={ __( 'Custom arrangements will repeat in the sequence you set here. Set just one value if you want all sizes to be the same width. Leave empty to have equal widths based on the number of items. An empty field preceded by a non-empty field will inherit the previous field\'s settings.' ) }
					></BaseControl>
					<BaseControl label={ __( 'Large Tablet' ) }>
						<MaiMultiSelectDuplicate
							key="sizesLg"
							options={ options }
							value={ mapValuesToLabels( sizesLg ) }
							onChange={ ( values ) => {
								setAttributes( { sizesLg: mapLabelsToValues( values ) } );
							}}
							onCreateOption={ ( value ) => {
								setAttributes( { sizesLg: [ ...sizesLg, value ] } );
							}}
						/>
					</BaseControl>
					<BaseControl label={ __( 'Small Tablet' ) }>
						<MaiMultiSelectDuplicate
							key="sizesMd"
							options={ options }
							value={ mapValuesToLabels( sizesMd ) }
							onChange={ ( values ) => {
								setAttributes( { sizesMd: mapLabelsToValues( values ) } );
							}}
							onCreateOption={ ( value ) => {
								setAttributes( { sizesMd: [ ...sizesMd, value ] } );
							}}
						/>
					</BaseControl>
					<BaseControl label={ __( 'Mobile' ) }>
						<MaiMultiSelectDuplicate
							key="sizesSm"
							options={ options }
							value={ mapValuesToLabels( sizesSm ) }
							onChange={ ( values ) => {
								setAttributes( { sizesSm: mapLabelsToValues( values ) } );
							}}
							onCreateOption={ ( value ) => {
								setAttributes( { sizesSm: [ ...sizesSm, value ] } );
							}}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
