/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
// import { useEffect } from 'react';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const getIndexOfArray = function( index, array, defaultVal = null ) {
		if ( undefined === array ) {
			return defaultVal
		}

		if ( undefined !== array[index] ) {
			return array[index];
		}

		if ( 1 === array.length ) {
			return array[0];
		}

		return array[index % array.length] ?? defaultVal;
	};

	const getFlex = ( size ) => {
		if ( ! size ) {
			return '1';
		}

		switch (size) {
			case 'auto':
				return '0 1 0%';
			case 'fit':
				return '0 1 auto';
			case 'fill':
				return '1 0 0';
		}

		return '0 1 var(--flex-basis)';
	};

	const isFraction = ( value ) => /^\d+\/\d+$/.test( value );

	const getFraction = ( value ) => {
		if ( ! value ) {
			return false;
		}

		if ( [ 'equal', 'auto', 'fill', 'full' ].includes(value)) {
			return false;
		}

		if ( isFraction( value ) ) {
			return value;
		}

		const percentage   = parseFloat( value.replace( '%', '' ) );
		const decimalValue = percentage / 100;
		const gcd          = (a, b) => (b === 0 ? a : gcd( b, a % b ));
		const numerator    = Math.round( decimalValue * 100 );
		const denominator  = 100;
		const divisor      = gcd( numerator, denominator );

		return `${numerator / divisor}/${denominator / divisor}`;
	}

	const blockIndex = useSelect(
		(select) => {
			const { getBlockIndex } = select( 'core/block-editor' );
			return getBlockIndex( clientId );
		},
		[clientId]
	);

	const inlineStyles = {};
	const arrangements = {};
	const data         = [
		{
			break: 'xl',
			columns: context['mai/columnsXl'],
			default: '',
		},
		{
			break: 'lg',
			columns: context['mai/columnsLg'],
			default: '',
		},
		{
			break: 'md',
			columns: context['mai/columnsMd'],
			default: '',
		},
		{
			break: 'sm',
			columns: context['mai/columnsSm'],
			default: '',
		}
	];

	data.forEach(item => {
		arrangements[item.break] = getIndexOfArray( blockIndex, item.columns, item.default );
	});

	Object.entries( arrangements ).forEach( ( [key, value] ) => {
		const flex     = getFlex(value);
		const fraction = getFraction(value);

		inlineStyles[`--flex-${key}`] = flex;

		if ( fraction ) {
			inlineStyles[`--columns-${key}`] = fraction;
		}
	});

	const props = {
		className: 'jivedig-column',
		style: inlineStyles
	};

	const blockProps       = useBlockProps( props );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<div {...innerBlocksProps} />
	);
}
