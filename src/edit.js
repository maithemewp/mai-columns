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
import { Panel, PanelBody, PanelRow, RangeControl, SelectControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Repeater } from '@10up/block-components';
import { close, plus } from "@wordpress/icons";

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
	const blockProps       = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps();
	const { columnsLg, columnsMd }        = attributes;
	// const [ item, setItem ] = useState( '' );

	function customAddButton(addItem) {
		return (
			<div className="repeater-controls">
				<div className="repeater-item-add">
					<Button variant="primary" icon={plus} onClick={addItem}/>
				</div>
			</div>
		);
	}

	return (
		<div>
			<InspectorControls key="setting">
				<PanelBody>
					<style>
						{`

						`}
					</style>
					{/* <p>{ __( 'Columns on Desktop' ) }</p> */}
					<Repeater attribute="columnsLg" addButton={customAddButton} allowReordering={true}>
						{( item, index, setItem, removeItem ) => (
							<div key={index} className="repeater-item">
								<SelectControl
									// label={ __( 'Select column size:' ) }
									value={item.columnsLgSize}
									onChange={(value) => {
										setItem({columnsLgSize: value})
									} }
									options={ [
										{ value: '', label: 'Sizes:', disabled: true },
										{ value: 'auto', label: 'Fit' },
										{ value: '1:5', label: '1/4' },
										{ value: '1:3', label: '1/3' },
										{ value: '1:2', label: '1/2' },
										{ value: '2:3', label: '2/3' },
										{ value: '3:4', label: '3/4' },
										{ value: '1', label: 'Full Width' },
									] }
									__nextHasNoMarginBottom
								/>
								<div className="repeater-item-remove">
									<Button icon={close} isDestructive label={ __('Remove') } onClick={removeItem} />
								</div>
							</div>
						)}
					</Repeater>
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
