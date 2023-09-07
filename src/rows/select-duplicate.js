/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

import { useState, useMemo } from '@wordpress/element';
import CreatableSelect from 'react-select/creatable';
// import { useDraggable } from "@dnd-kit/core";

/**
 * Make sure a value is valid.
 *
 * @since 0.1.0
 *
 * @param {string} value
 *
 * @return bool
 */
const isValid = ( value ) => {
	const validStrings = [ 'auto', 'fill', 'full' ];

	// It's an allowed predefined value.
	if ( validStrings.includes( value ) ) {
		return true;
	}

	// Check if value is a valid number larger then  0 and less than or equal to 100.
	if ( value && ! isNaN( value ) && value > 0 && value <= 100 ) {
		return true;
	}

	// Check if it's a valid fraction.
	if ( value && isFraction( value ) ) {
		return true;
	}

	return false;
}

/**
 * If a value is a fraction.
 *
 * @since 0.1.0
 *
 * @param {string} value
 *
 * @return boolean
 */
const isFraction = ( value ) => {
	// Split the string into parts based on the '/' character.
	const parts = value.split( '/' );

	// Ensure there are exactly two parts.
	if ( 2 !== parts.length ) {
		return false;
	}

	// Parse the numerator and denominator.
	const numerator   = parseInt( parts[0] );
	const denominator = parseInt( parts[1] );

	// Bail if either parts are not valid integers.
	if ( isNaN( numerator ) || isNaN( denominator ) ) {
		//console.log( __( 'Numerator or denominator is not an integer.' ) );
		return false;
	}

	// Bail if numerator is larger than denominator.
	return numerator <= denominator;
}

/**
 * Setup component.
 *
 * @since 0.1.0
 */
const MaiMultiSelectDuplicate = ( { options = [], value = [], onChange = null, onCreateOption = null } ) => {
	// Extract the current option values for easier comparison.
	const currentOptionValues = useMemo(() => options.map( option => option.value ), [options] );

	// Map values to options, with a unique identifier for each.
	const valueOptions = value.map(( val, index ) => {
		return {
			label: val,
			value: currentOptionValues.includes( val ) ? val : `${val}_${index}`,
			actualValue: val
		};
	});

	// Initialize the states.
	const [ selectedOptions, setSelectOption ] = useState( valueOptions );

	/**
	 * This function handles the change event of the `CreatableSelect` component.
	 *
	 * @param {Array} changedOptions - This is an array of objects representing the options
	 *                                 that are currently selected in the `CreatableSelect` component.
	 *                                 Each object typically has a structure like { label: "Option Label", value: "unique-id", actualValue: "Option Value" }
	 */
	const handleChange = ( changedOptions ) => {
		// Map through the changedOptions array to extract the 'actualValue' property from each object.
		// The 'actualValue' contains the true value of the option, as opposed to the 'value' property which
		// may have a unique identifier appended to handle duplicates.
		const selectedValues = changedOptions.map( op => op.actualValue );

		// Update the state `selectedOptions` with the newly changed options.
		// This will cause the component to re-render with the new selections.
		setSelectOption( changedOptions );

		// Check if the 'onChange' callback is provided as a prop to the MaiMultiSelectDuplicate component.
		if ( onChange ) {
			// If it is provided, invoke the 'onChange' callback function, passing the extracted 'selectedValues'
			// (the actual values of the selected options without any unique identifiers).
			onChange( selectedValues );
		}
	};

	/**
	 * This function handles the creation of a new option in the `CreatableSelect` component.
	 *
	 * @param {string} inputValue - The string value of the newly created option. This comes from the user's input.
	 */
	const handleCreate = inputValue => {
		// Log the creation of a new option to the console for debugging purposes.
		console.log( 'Creating new option:', inputValue );

		// Create a new option object for the newly entered value.
		// - The 'label' will be what is displayed in the dropdown menu.
		// - The 'value' will be a unique identifier, created by combining the inputValue and the current timestamp
		//   (using Date.now()). This ensures that even if a user creates two identical options, they have distinct
		//   identifiers so they can be treated as separate.
		// - The 'actualValue' retains the original inputValue without any added identifiers, which can be used
		//   elsewhere in the application logic if needed.
		const newOption = {
			label: inputValue,
			value: `${inputValue}_${Date.now()}`,  // Unique identifier using current time
			actualValue: inputValue
		};

		// Create a new array containing all the previously selected options (from the 'selectedOptions' state)
		// and add the newly created option to the end of this array.
		const newOptions = [ ...selectedOptions, newOption ];

		// Update the 'selectedOptions' state with this new array of options.
		// This will cause the component to re-render, displaying the newly created option as selected.
		setSelectOption( newOptions );

		// Check if the 'onChange' callback function is provided as a prop to the MaiMultiSelectDuplicate component.
		if ( onChange ) {
			// If provided, call the 'onChange' function, passing in an array of the 'actualValue' properties
			// from the newOptions array. This informs the parent component of the change.
			onChange( newOptions.map((obj) => obj.actualValue ) );
		}

		// Check if the 'onCreateOption' callback function is provided as a prop to the MaiMultiSelectDuplicate component.
		if ( onCreateOption ) {
			// If provided, call the 'onCreateOption' function, passing in the inputValue.
			// This can be useful if the parent component wants to take additional actions when a new option is created.
			onCreateOption( inputValue );
		}
	};

	/**
	 * Format the label for a newly created sizes.
	 *
	 * @param {string} inputValue
	 */
	const formatCreateLabel = ( inputValue ) => {
		return inputValue ? `${__( 'Add' )} ${isFraction( inputValue ) || isNaN( inputValue ) ? inputValue : `${inputValue}%`}` : '';
	}

	return (
		<CreatableSelect
			isMulti
			hideSelectedOptions={ false }
			isClearable={ true }
			value={ selectedOptions }
			onChange={ handleChange }
			onCreateOption={ handleCreate }
			options={ options.map( op => ( { ...op, actualValue: op.value, value: `${op.value}_${Date.now()}` } ) ) }
			formatOptionLabel={ option => ! option.label || isFraction( option.label ) || isNaN( option.label ) ? option.label : `${option.label}%` }
			formatCreateLabel={ formatCreateLabel }
			components={ { DropdownIndicator:() => null, IndicatorSeparator:() => null } }
			isValidNewOption={ isValid }
			// styles={{
			// 	input: (providedStyles, props) => ({
			// 		...providedStyles,
			// 		boxShadow: 0,
			// 		maxHeight: 'unset',
			// 		border: '1px dashed red',
			// 	}),
			// }}
		/>
	);
};

export default MaiMultiSelectDuplicate;
