/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, useInnerBlocksProps, BlockControls, BlockVerticalAlignmentToolbar, InnerBlocks } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { getIndexValueFromArray, getFlex, getFlexCSSValue, getSize, reverseObject } from '../functions';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const { style, alignItems } = attributes;

	/**
	 * Gets block index of parent.
	 *
	 * @since 0.1.0
	 *
	 * @return {string}
	 */
	const blockIndex = useSelect((select) => {
		const { getBlockIndex } = select( 'core/block-editor' );
		return getBlockIndex( clientId );
	}, [clientId] );

	/**
	 * Gets the inner block count.
	 *
	 * @since 0.1.0
	 *
	 * @return {int}
	 */
	const blockCount = useSelect((select) => {
		return select( 'core/block-editor').getBlockCount( clientId );
	});

	/**
	 * Adds arrangements to the object.
	 *
	 * @since 0.1.0
	 *
	 * @param {object} arrangement
	 *
	 * @returns {object}
	 */
	const setFallbacks = ( arrangement ) => {
		// Set fallbacks.
		for ( const key in arrangements ) {
			if ( ! arrangements[ key ] ) {
				const keys  = Object.keys( arrangements );
				const shift = keys.shift();

				arrangements[ key ] = arrangements[ shift ];
			}
		}

		return arrangements;
	}

	/**
	 * Build inline styles from arrangements.
	 */
	let   arrangements = {};
	const inlineStyles = useBlockProps().style || {};
	const data         = [
		{
			break: 'lg',
			columns: context['mai/sizesLg'],
			default: '',
		},
		{
			break: 'md',
			columns: context['mai/sizesMd'],
			default: '',
		},
		{
			break: 'sm',
			columns: context['mai/sizesSm'],
			default: '',
		}
	];

	// Get arrangements.
	data.forEach( item => {
		arrangements[ item.break ] = getIndexValueFromArray( blockIndex, item.columns, item.default );
	});

	// Set standard fallbacks.
	arrangements = setFallbacks( arrangements );

	// Set reversed fallbacks.
	arrangements = setFallbacks( reverseObject( arrangements ) );

	// Reverse back.
	arrangements = reverseObject( arrangements );

	// Set sizes inline styles.
	Object.entries( arrangements ).forEach( ( [ key, value ] ) => {
		inlineStyles[`--size-${key}`] = getSize( value ) || 1;
	});

	// Set flex inline styles.
	Object.entries( arrangements ).forEach( ( [ key, value ] ) => {
		inlineStyles[`--flex-${key}`] = getFlex( value );
	});

	// Justify content is align items value since flex-direction is column.
	inlineStyles['--justify-content'] = getFlexCSSValue( alignItems );

	/**
	 * Define the appender to use.
	 * If no blocks, add the appender.
	 */
	const appenderToUse = () => {
		if ( ! blockCount ) {
			return <InnerBlocks.ButtonBlockAppender rootClientId={ clientId } style={{ alignSelf: 'auto' }}/>;
		}

		return false;
	};

	/**
	 * Set props.
	 */
	const props = {
		className: 'mai-column',
		style: inlineStyles
	};

	const blockProps       = useBlockProps( props );
	const innerBlocksProps = useInnerBlocksProps(
		blockProps,
		{
			renderAppender: appenderToUse,
		}
	);

	return (
		<>
			<BlockControls group="block">
				<BlockVerticalAlignmentToolbar
					value={ alignItems }
					onChange={ ( value ) => {
						setAttributes( { alignItems: value } );
					}}
				/>
			</BlockControls>
			<div {...innerBlocksProps} />
		</>
	);
}
