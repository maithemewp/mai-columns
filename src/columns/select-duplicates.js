import { useState } from "react";
// import Select from "react-select";
import CreatableSelect from 'react-select/creatable';

const isValue = ( value ) => {
	// value = mapValues( [ value ], true )[0];

	const validStrings = [ 'auto', 'fill', 'full' ];

	// It's an allowed predefined value.
	if ( validStrings.includes( value ) ) {
		return true;
	}

	// Check if it's a valid percent.
	if ( isPercent( value ) ) {
		return true;
	}

	// Check if it's a valid fraction.
	if ( isFraction( value ) ) {
		return true;
	}
}

const isPercent = ( value ) => {
	const regex = /^\d+(\.\d+)?%$/;
	return regex.test( value );
}

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
		console.log( __( 'Numerator or denominator is not an integer.' ) );
		return false;
	}

	// Bail if numerator is larger than denominator.
	if ( numerator > denominator ) {
		console.log( __( 'Numerator is larger than denominator.' ) );
		return false;
	}

	return true;
}

const ReactMultiSelectDuplicate = ( { options = [], onChange = null } ) => {
	const [ selectedOptions, setSelectOption ] = useState( [] );

	const handleChange = ( changedOptions ) => {
		const newOptions = changedOptions.map( op => ( { ...op, value: Math.random() * Math.random() } ) );

		setSelectOption( newOptions );

		if ( onChange ) {
			onChange( newOptions.map( ( obj ) => obj.actualValue ) );
		}
	};

	const handleCreate = inputValue => {
		const newOption = {
			label: inputValue,
			actualValue: inputValue,
			value: Math.random() * Math.random(),
		}

		const newOptions = [ ...selectedOptions, newOption ];

		setSelectOption( newOptions );
		onChange( newOptions.map( ( obj ) => obj.actualValue ) );
	};

	return (
		<CreatableSelect
			isMulti
			hideSelectedOptions={ false }
			// isClearable={ true }
			value={ selectedOptions }
			onChange={ handleChange }
			onCreateOption={ handleCreate }
			options={ options.map( op => ( { ...op, actualValue: op.value, value: Math.random() * Math.random() } ) ) }
			isValidNewOption={ ( value ) => {
				return isValue( value );
			}}
		/>
	);
};

export default ReactMultiSelectDuplicate;
