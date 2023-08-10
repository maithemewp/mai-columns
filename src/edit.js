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
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { InspectorControls } from '@wordpress/editor';
import { Panel, PanelBody, PanelRow, FormTokenField } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Repeater } from '@10up/block-components';
import { close, plus, settings } from "@wordpress/icons";

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
	const blockProps                      = useBlockProps();
	const innerBlocksProps                = useInnerBlocksProps();
	const { columnsLg, columnsMd }        = attributes;
	// const [ columns, setColumns ]         = useState( '1/3' );
	// const [ showCustomSize, setCustomSize ] = useState( false );
	// const [ showCustomSize, setCustomSize ] = useState(
		// value !== undefined && ! isValuePreset( value )
		// false
	// );
	const [ selectedContinents, setSelectedContinents ] = useState( [] );

	// const [ item, setItem ] = useState( '' );
	const options = [
		{ label: 'Fit Content', value: 'auto' },
		{ label: 'Fill', value: 'fill' },
		{ label: '1/4', value: '1/4' },
		{ label: '1/3', value: '1/3' },
		{ label: '1/2', value: '1/2' },
		{ label: '2/3', value: '2/3' },
		{ label: 'Full', value: '1/1' },
	];

	const sizes = [
		// {
		// 	value: 'auto',
		// 	name: 'Fit Content',
		// },
		// {
		// 	value: 'fill',
		// 	name: 'Fill Space',
		// },
		{
			name: 'Fit',
			value: -1,
		},
		{
			name: 'Fill',
			value: 0,
		},
		// {
		// 	name: '10',
		// 	value: 10,
		// },
		{
			name: '1/4',
			value: .25,
		},
		{
			name: '1/3',
			value: .33,
		},
		{
			name: '1/2',
			value: .50,
		},
		{
			name: '2/3',
			value: .66,
		},
		// {
		// 	name: '3/4',
		// 	value: .75,
		// },
		// {
		// 	name: 'Full',
		// 	value: 1,
		// },
	];

	const suggestionsOG = [
		{ 'auto': 'Fit Content' },
		{ 'fill': 'Fill' },
		{ '1/4': '1/4' },
		{ '1/3': '1/3' },
		{ '1/2': '1/2' },
		{ '2/3': '2/3' },
		{ '1/1': 'Full' },
	];

	const suggestionss = {
		'item-1': {
			value: '1/3',
			title: '1/3',
		},
		'item-2': {
			value: '1/2',
			title: '1/2',
		}
	};

	// const suggestions = [
	// 	{
	// 		value: 'okay',
	// 		title: 'Okay',
	// 	},
	// 	{
	// 		value: 'another',
	// 		title: 'Another',
	// 	}
	// ];

	const suggestions = [
		'Equal Widths',
		'1/4',
		'1/3',
		'1/2',
		'2/3',
		'3/4',
		'Fit Content',
		'Fill Space',
	];

	// const suggestions = [
	// 	{ label: 'Option 1', value: 'option1' },
	// 	{ label: 'Option 2', value: 'option2' },
	// 	{ label: 'Option 3', value: 'option3' },
	// ];

	return (
		<div>
			<InspectorControls key="setting">
				<PanelBody>
					<style>
						{`

						`}
					</style>
					{/* <FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label="Select size(s)"
						onChange={function noRefCheck(){}}
						suggestions={[
							'Africa',
							'America',
							'Antarctica',
							'Asia',
							'Europe',
							'Oceania'
						]}
						value={[]}
					/> */}
					<FormTokenField
						__experimentalAutoSelectFirstMatch
						__experimentalExpandOnFocus
						label={ __( 'Select size(s)' ) }
						value={ selectedContinents }
						onChange={ ( tokens ) => setSelectedContinents( tokens ) }
						suggestions={ suggestions }
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<div className="mai-rows">
					<div {...innerBlocksProps} />
				</div>
			</div>
		</div>
	);
}
