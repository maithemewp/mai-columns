/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

import {
	useCallback,
	useState,
	useMemo
} from '@wordpress/element';

import Select, {
	components,
	MultiValueProps,
	MultiValueRemoveProps,
	OnChangeValue,
} from 'react-select';

import CreatableSelect from 'react-select/creatable';

import {
	restrictToParentElement
} from '@dnd-kit/modifiers';

import {
	CSS
} from '@dnd-kit/utilities';

import {
	closestCorners,
	DndContext,
	DragEndEvent
} from '@dnd-kit/core';

import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from '@dnd-kit/sortable';

import {
	isFraction,
	isValidCSSValue,
	isPercentage,
} from '../../functions';

/**
 * Make sure a value is valid new option.
 * No need to check for auto, fit, fill because those are predefined.
 *
 * @since 0.1.0
 *
 * @param {string} value
 *
 * @return {bool}
 */
const isValidNew = ( value ) => {
	if ( ! value ) {
		return false;
	}

	// Check if value is a valid number larger then  0 and less than or equal to 100.
	if ( ! isNaN( value ) && value > 0 && value <= 100 ) {
		return true;
	}

	// Check if it's a valid fraction.
	if ( isFraction( value ) ) {
		return true;
	}

	// If it's a valid CSS value.
	if ( isValidCSSValue( value ) ) {
		return true;
	}

	return false;
}

/**
 * Format the label for a newly created sizes.
 *
 * @param {string} inputValue
 */
const formatCreateLabel = ( inputValue ) => {
	return inputValue ? `${__( 'Add' )} ${isPercentage( inputValue ) ? `${inputValue}%` : inputValue}` : '';
}

/**
 * Setup component.
 *
 * @since 0.1.0
 */
const MultiSelectSortDuplicates = ({
		options        = [],
		value          = [],
		onChange       = null,
		onCreateOption = null
	}) => {

	// Extract the current option values for easier comparison.
	const currentOptionValues = useMemo(() => options.map( option => option.value ), [options] );

	// Map values to options, with a unique identifier for each.
	const valueOptions = useMemo(() => value.map((val, index) => {
		return {
			label: val,
			value: currentOptionValues.includes(val) ? val : `${val}_${index}`,
			actualValue: val
		};
	}), [value, currentOptionValues]);

	// Initialize the states.
	const [ selectedOptions, setSelectedOptions ] = useState( valueOptions );

	/**
	 * Set the selected options after reordering.
	 */
	const onDragEnd = useCallback((event) => {
		const { active, over } = event;

		if ( ! active || ! over ) {
			return;
		}

		setSelectedOptions((items) => {
			console.log( items );
			const oldIndex = items.findIndex((item) => item.value === active.id);
			const newIndex = items.findIndex((item) => item.value === over.id);

			return arrayMove(items, oldIndex, newIndex);
		});
	}, [setSelectedOptions]);

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
		setSelectedOptions( changedOptions );

		console.log( changedOptions, selectedValues, onChange );

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
		setSelectedOptions( newOptions );

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
	 * Custom MultiValue component for handling sorting.
	 */
	const MultiValue = (props) => {
		const innerProps = {...props.innerProps};
		const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
			id: props.data.value,
		});
		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
		};

		return (
			<div style={style} ref={setNodeRef} {...attributes} {...listeners}>
				<components.MultiValue {...props} innerProps={innerProps} />
			</div>
		);
	};

	/**
	 * Custom MultiValueRemove component to prevent drag events on remove.
	 */
	const MultiValueRemove = (props) => {
		return (
		  <components.MultiValueRemove
			{...props}
			innerProps={{
				onPointerDown: (e) => e.stopPropagation(),
				...props.innerProps,
			}}
		  />
		);
	};

	// Custom styles for the select component.
	const customStyles = {
		control: (provided, state) => ({
			...provided,
			boxShadow: 'none', // Remove the default box shadow
			// Remove the default border if focused, otherwise keep it.
			border: state.isFocused ? '1px solid #1e1e1e' : provided.border,
		}),
	};

	return (
		<>
			{/* <style>
				{`
					.ValueContainer {
						margin-bottom: 100%;
					}
					.ValueContainer input[id*="react-select"],
					.ValueContainer input[id*="react-select"]:focus {
						min-height: unset !important;
						border: none !important;
						box-shadow: none !important;
					}
				`}
			</style> */}
			<DndContext
				modifiers={[restrictToParentElement]}
				onDragEnd={onDragEnd}
				collisionDetection={closestCorners}
			>
				<SortableContext
					items={selectedOptions.map((o) => o.value)}
					strategy={horizontalListSortingStrategy}
				>
					<CreatableSelect
						isMulti
						hideSelectedOptions={false}
						isClearable={true}
						value={selectedOptions}
						onChange={handleChange}
						onCreateOption={handleCreate}
						options={options.map(op => ({
							...op,
							actualValue: op.value,
							value: `${op.value}_${Date.now()}`,
						}))}
						components={{
							MultiValue,
							MultiValueRemove,
							DropdownIndicator : () => null,
							IndicatorSeparator: () => null,
						}}
						formatOptionLabel={option => ! option.label || isFraction( option.label ) || isValidCSSValue( option.label ) || isNaN( option.label ) ? option.label : `${option.label}%`}
						formatCreateLabel={formatCreateLabel}
						isValidNewOption={isValidNew}
						styles={customStyles}
					/>
				</SortableContext>
			</DndContext>
		</>
	);
};

export default MultiSelectSortDuplicates;
