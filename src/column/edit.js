/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, useInnerBlocksProps, BlockControls, BlockVerticalAlignmentToolbar, InnerBlocks } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

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
	 * Gets flex value from column size.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} size The size value from settings.
	 *
	 * @return {string}
	 */
	const getFlex = ( size ) => {
		if ( ! size ) {
			return '1';
		}

		switch ( size ) {
			case 'fit':
				return '0 1 auto';
			case 'fill':
				return '1 0 0';
		}

		return '0 1 var(--flex-basis)';
	};

	/**
	 * Gets the correct column value from the repeated arrangement array.
	 *
	 * @since 0.1.0
	 *
	 * @param {int}   index   The current item index to get the value for.
	 * @param {array} array   The array to get index value from.
	 * @param {mixed} default The default value if there is no index.
	 *
	 * @return {mixed}
	 */
	const getIndexValueFromArray = function( index, array, defaultVal = null ) {
		if ( undefined !== array[index] ) {
			return array[index];
		}

		if ( 1 === array.length ) {
			return array[0];
		}

		return array[ index % array.length ] ?? defaultVal;
	};

	/**
	 * Gets the fraction value from a given value.
	 *
	 * @param {string} value
	 *
	 * @return {string}
	 */
	const getSize = ( value ) => {
		if ( ! value ) {
			return false;
		}

		if ( [ 'fit', 'fill', 'break' ].includes( value )) {
			return false;
		}

		if ( isFraction( value ) ) {
			return value;
		}

		if ( isPercentage( value ) ) {
			const percentage   = parseFloat( value.replace( '%', '' ) );
			const decimalValue = percentage / 100;
			const numerator    = Math.round( decimalValue * 100 );
			const denominator  = 100;
			const gcd          = getGcd( numerator, denominator );

			return `${numerator / gcd}/${denominator / gcd}`;
		}

		// TODO: Check if valid CSS value?
		if ( isValidCSSValue( value ) ) {
			return value;
		}

		return false;
	}

	/**
	 * Gets the greatest common denominator.
	 *
	 * @since 0.1.0
	 *
	 * @param {int} a
	 * @param {int} b
	 *
	 * @return {int}
	 */
	const getGcd = ( a, b ) => {
		if ( 0 === b ) {
			return a;
		} else {
			return getGcd( b, a % b );
		}
	};

	/**
	 * Checks if a value is a fraction.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} value
	 *
	 * @return {bool}
	 */
	const isFraction = ( value ) => {
		return /^\d+\/\d+$/.test( value );
	}

	/**
	 * Checks if a value is a percentage.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} value
	 *
	 * @return {bool}
	 */
	const isPercentage = ( value ) => {
		return /^\d+%$/.test( value );
	}

	function isValidCSSValue( value, property = 'flex-basis' ) {
		const style = document.createElement('div').style;
		style[property] = value;
		return value === style[property];
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
	 * Adds arrangements to the object.
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
	 * Reverses an object.
	 * Convert the object to an array of [key, value] pairs.
	 * Reverses the array.
	 * Convert the reversed array back to an object.
	 *
	 * @param {object} obj The object to reverse.
	 *
	 * @returns {object}
	 */
	const reverseObject = ( obj ) => {
		return Object.fromEntries( Object.entries( obj ).reverse() );
	}

	/**
	 * Gets block index of parent.
	 *
	 * @since 0.1.0
	 *
	 * @return {string}
	 */
	const blockIndex = useSelect(
		(select) => {
			const { getBlockIndex } = select( 'core/block-editor' );
			return getBlockIndex( clientId );
		},
		[clientId]
	);

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
	 * Gets the inner block count.
	 *
	 * @since 0.1.0
	 *
	 * @return {int}
	 */
	const blockCount = useSelect(
		(select) => {
			return select( 'core/block-editor').getBlockCount( clientId );
		}
	);

	/**
	 * Define the appender to use.
	 */
	const appenderToUse = () => { return ! blockCount ? <InnerBlocks.ButtonBlockAppender rootClientId={ clientId } style={{ alignSelf: 'auto' }}/> : false };

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
