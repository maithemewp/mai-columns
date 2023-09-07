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
export default function Edit({ attributes, setAttributes, context, clientId }) {
	/**
	 * Gets flex value from column size.
	 *
	 * @since 0.1.0
	 *
	 * @param string size The size value from settings.
	 *
	 * @return string
	 */
	const getFlex = ( size ) => {
		if ( ! size ) {
			return '1';
		}

		switch ( size ) {
			case 'auto':
				return '0 1 0%';
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
	 * @param int   index   The current item index to get the value for.
	 * @param array array   The array to get index value from.
	 * @param mixed default The default value if there is no index.
	 *
	 * @return mixed
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
	 * @param string value
	 *
	 * @return string
	 */
	const getFraction = ( value ) => {
		if ( ! value ) {
			return false;
		}

		if ( [ 'auto', 'fill', 'full' ].includes( value )) {
			return false;
		}

		if ( isFraction( value ) ) {
			return value;
		}

		const percentage   = parseFloat( value.replace( '%', '' ) );
		const decimalValue = percentage / 100;
		const numerator    = Math.round( decimalValue * 100 );
		const denominator  = 100;
		const gcd          = getGcd( numerator, denominator );

		return `${numerator / gcd}/${denominator / gcd}`;
	}

	/**
	 * Gets the greatest common denominator.
	 *
	 * @since 0.1.0
	 *
	 * @param int a
	 * @param int b
	 *
	 * @return int
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
	 * @param string value
	 *
	 * @return bool
	 */
	const isFraction = ( value ) => {
		return /^\d+\/\d+$/.test( value );
	}

	/**
	 * Gets block index of parent.
	 *
	 * @return string
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
	const inlineStyles = {};
	const arrangements = {};
	const data         = [
		{
			break: 'xl',
			columns: context['mai/sizesXl'],
			default: '',
		},
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

	data.forEach(item => {
		arrangements[ item.break ] = getIndexValueFromArray( blockIndex, item.columns, item.default );
	});

	Object.entries( arrangements ).forEach( ( [ key, value ] ) => {
		inlineStyles[`--size-${key}`] = getFraction( value ) || 1;
	});

	Object.entries( arrangements ).forEach( ( [ key, value ] ) => {
		inlineStyles[`--flex-${key}`] = getFlex( value );
	});

	/**
	 * Set props.
	 */
	const props = {
		className: 'mai-row-item',
		style: inlineStyles
	};

	const blockProps       = useBlockProps( props );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<div {...innerBlocksProps} />
	);
}