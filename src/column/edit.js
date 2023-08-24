/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, context, clientId }) {
	const blockProps       = useBlockProps( { className: 'jivedig-column' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps );
	const blockIndex       = useSelect(
		(select) => {
			const { getBlockIndex } = select('core/block-editor');
			return getBlockIndex( clientId );
		},
		[clientId]
	);



	return (
		<div {...innerBlocksProps} />
	);
}
