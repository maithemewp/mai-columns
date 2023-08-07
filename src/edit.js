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
import { Panel, PanelBody, PanelRow, RangeControl, TextControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Repeater } from '@10up/block-components';

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
	// const { columnsLg, columnsMd, columnsSm, columnsXs } = attributes;
	const blockProps       = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps();
	const { items }        = attributes;

	return (
		<div>
			<InspectorControls key="setting">
				<PanelBody>
					<div>
						<Repeater attribute="items">
							{( item, index, setItem, removeItem ) => (
								<div key={index}>
									<RangeControl
										value={item}
										onChange={(value) =>
											setItem(value)
										}
										min={0}
										max={12}
									/>
									<Button
										icon={close}
										label={__('Remove')}
										onClick={removeItem}
									/>
								</div>
							)}
						</Repeater>
					</div>
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
