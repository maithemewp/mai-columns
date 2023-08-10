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
import { useBlockProps, useInnerBlocksProps, BlockControls, JustifyContentControl, BlockVerticalAlignmentToolbar } from '@wordpress/block-editor';

import { InspectorControls } from '@wordpress/editor';
import { Panel, PanelBody, PanelRow, FormTokenField } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Repeater } from '@10up/block-components';
import { close, plus, settings, justifyCenter, justifyLeft, justifyRight } from "@wordpress/icons";

// TODO: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/columns/edit.js

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

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

	const blockProps = useBlockProps({
		className: 'mai-rows',
	});

	const innerBlocksProps = useInnerBlocksProps();
	const suggestions      = {
		'auto': __( 'Equal Widths' ),
		'1/4': __( '1/4' ),
		'1/3': __( '1/3' ),
		'1/2': __( '1/2' ),
		'2/3': __( '2/3' ),
		'3/4': __( '3/4' ),
		'fit': __( 'Fit Content' ),
		'fill': __( 'Fill Space' ),
	};

	const reversed = Object.entries( suggestions ).reduce(
		( acc, [key, value] ) => {
			acc[value] = key;
			return acc;
		},
		{}
	);

	function mapValues( values, reverse = false ) {
		let mapped = [];
		let array  = reverse ? reversed : suggestions;

		values.forEach( ( value ) => {
			mapped.push( value in array ? array[ value ] : value );
		});

		return mapped;
	}

	return (
		<div>
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
			<InspectorControls key="setting">
				<PanelBody>
					<h2 className="column-widths-heading">{ __( 'Column Width(s)' ) }</h2>
					<FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label={ __( 'Desktop' ) }
						value={ mapValues( columnsLg, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsLg: mapValues( values, true ) } );
						}}
					/>
					<FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label={ __( 'Large Tablet' ) }
						value={ mapValues( columnsMd, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsMd: mapValues( values, true ) } );
						}}
					/>
					<FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label={ __( 'Small Tablet' ) }
						value={ mapValues( columnsSm, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsSm: mapValues( values, true ) } );
						}}
					/>
					<FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label={ __( 'Mobile' ) }
						value={ mapValues( columnsSm, false ) }
						suggestions={ Object.values( suggestions ) }
						onChange={ ( values ) => {
							setAttributes( { columnsSm: mapValues( values, true ) } );
						}}
					/>
					<p>{ __( 'Custom arrangements will repeat in the sequence you set here. Only set one value if you want all columns to be the same.' ) }</p>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
