/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InnerBlocks, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save() {
	// const blockProps       = useBlockProps.save();
	// const innerBlocksProps = useInnerBlocksProps.save();

	// return (
	// 	<div { ...blockProps }>
	// 		<div {...innerBlocksProps} />
	// 	</div>
	// );

	// const blockProps       = useBlockProps.save();
	// const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	// return (
	// 	<div {...innerBlocksProps} />
	// );

	// return <InnerBlocks.Content/>;

// 	const blockProps = useBlockProps.save();

// 	return (
// 		<div { ...blockProps }>
// 			<InnerBlocks.Content />
// 		</div>
// 	);

	// const blockProps = useBlockProps.save();

	// return (
	// 	// <div { ...blockProps }>
	// 	<div { ...innerBlocksProps }>
	// 		<InnerBlocks.Content />
	// 	</div>
	// );

	return <InnerBlocks.Content />

	// const blockProps       = useBlockProps.save( { className: 'jivedig-columns' } );
	// const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	// return <div { ...innerBlocksProps } />;
}
