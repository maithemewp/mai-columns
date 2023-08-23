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
import { Panel, PanelBody, PanelRow, TextControl, FormTokenField } from '@wordpress/components';
import { useState } from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';
// import Select from 'react-select'
import ReactMultiSelectDuplicate from './select-duplicates';
// import { Repeater } from '@10up/block-components';
import { close, plus, settings, justifyCenter, justifyLeft, justifyRight } from "@wordpress/icons";

// TODO: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/columns/edit.js

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

// import './tom-select.js';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { justifyContent, alignItems, columnsLg, columnsMd, columnsSm, columnsXs } = attributes;

	const blockProps       = useBlockProps( { className: 'jivedig-columns' } );
	const innerBlocksProps = useInnerBlocksProps(
		blockProps,
		{
			allowedBlocks: [ 'mai/column' ],
			orientation: "horizontal",
			template: [
				[ 'mai/column' ],
				[ 'mai/column' ],
			]
		}
	);

	const options = [
		{
			value: 'auto',
			label: __( 'Equal Widths' ),
		},
		{
			value: '1/4',
			label: __( '1/4' ),
		},
		{
			value: '1/3',
			label: __( '1/3' ),
		},
		{
			value: '1/2',
			label: __( '1/2' ),
		},
		{
			value: '2/3',
			label: __( '2/3' ),
		},
		{
			value: '3/4',
			label: __( '3/4' ),
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

	// const suggestions = {
	// 	'auto': __( 'Equal Widths' ),
	// 	'1:4': __( '1/4' ),
	// 	'1:3': __( '1/3' ),
	// 	'1:2': __( '1/2' ),
	// 	'2:3': __( '2/3' ),
	// 	'3:4': __( '3/4' ),
	// 	'fit': __( 'Fit Content' ),
	// 	'fill': __( 'Fill Space' ),
	// };

	// const reversed = Object.entries( suggestions ).reduce(
	// 	( acc, [key, value] ) => {
	// 		acc[value] = key;
	// 		return acc;
	// 	},
	// 	{}
	// );

	// const getSuggestions = ( values ) => {
	// 	if ( values.includes( 'auto' ) ) {
	// 		return [];
	// 	}

	// 	return Object.values( suggestions );
	// }

	// const getKey = ( value ) => {
	// 	// const handleChange = ( changedOptions ) => {
	// 	// 	const newOptions = changedOptions.map( op => ( { ...op, value: Math.random() * Math.random() } ) );

	// 	// 	setSelectOption( newOptions );

	// 	// 	if ( onChange ) {
	// 	// 		onChange( newOptions.map( ( obj ) => obj.actualValue ) );
	// 	// 	}
	// 	// };

	// 	// reversed.map( op => ({
	// 	// 	...op,
	// 	// 	actualValue: op.value,
	// 	// 	value: Math.random() * Math.random()
	// 	// }));

	// 	// console.log( mapValues( [ value ], true )[0] );

	// 	value = value.replace( ':', '/' );

	// 	if ( isValue( value ) ) {
	// 		return value;
	// 	}

	// 	return mapValues( [ value ], true )[0];
	// }

	// const getValue = ( value ) => {
	// 	return mapValues( [ value ], false )[0];
	// }

	// const mapValues = ( values, reverse = false ) => {
	// 	let mapped = [];
	// 	let array  = reverse ? reversed : suggestions;

	// 	values.forEach( ( value ) => {
	// 		mapped.push( value in array ? array[ value ] : value );
	// 	});

	// 	return mapped;
	// }

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
			<InspectorControls key="Columns">
				<PanelBody>
					<style>
						{`
							.column-widths-heading ~ .components-form-token-field:not(:first-of-type) .components-form-token-field__input-container {
								margin-bottom: 16px;
							}
							.column-widths-heading ~ .components-form-token-field:not(:first-of-type) .components-form-token-field__help {
								display: none;
							}
						`}
					</style>
					<h2 className="column-widths-heading">{ __( 'Column Width(s)' ) }</h2>
					<ReactMultiSelectDuplicate
						key="columnsLg"
						options={ options }
						value={ columnsLg }
						onChange={ ( values ) => {
							setAttributes( { columnsLg: values } );
						}}
						onCreateOption={ ( value ) => {
							setAttributes( { columnsLg: columnsLg } );
						}}
					/>
					{/* <ReactMultiSelectDuplicate
						key="columnsMd"
						options={ options }
						onChange={ ( values ) => {
							setAttributes( { columnsMd: values } );
						}}
					/>
					<ReactMultiSelectDuplicate
						key="columnsSm"
						options={ options }
						onChange={ ( values ) => {
							setAttributes( { columnsSm: values } );
						}}
					/>
					<ReactMultiSelectDuplicate
						key="columnsXs"
						options={ options }
						onChange={ ( values ) => {
							setAttributes( { columnsXs: values } );
						}}
					/> */}
					{/* <FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						__experimentalValidateInput={ isValue }
						label={ __( 'Desktop' ) }
						value={ columnsLg }
						suggestions={ getSuggestions( columnsLg ) }
						displayTransform={ getValue }
						saveTransform={ getKey }
						onChange={ ( values ) => {
							setAttributes( { columnsLg: values } );
						}}
					/> */}
					{/* <FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						__experimentalValidateInput={ isValue }
						label={ __( 'Large Tablet' ) }
						value={ columnsMd }
						suggestions={ getSuggestions( columnsMd ) }
						displayTransform={ getValue }
						saveTransform={ getKey }
						multiple={ true }
						onChange={ ( values ) => {
							setAttributes( { columnsMd: values } );
						}}
					/> */}
					{/* <FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						key="columnsSm"
						label={ __( 'Small Tablet' ) }
						value={ mapValues( columnsSm, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsSm: mapValues( values, true ) } );
						}}
					/> */}
					{/* <FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						key="columnsXs"
						label={ __( 'Mobile' ) }
						value={ mapValues( columnsXs, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsXs: mapValues( values, true ) } );
						}}
					/> */}
					<p>{ __( 'Custom arrangements will repeat in the sequence you set here. Only set one value if you want all columns to be the same size.' ) }</p>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
