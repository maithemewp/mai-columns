import { useCallback, useState, useMemo } from "@wordpress/element";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
	arrayMove,
	rectSwappingStrategy,
	SortableContext,
	useSortable,
} from "@dnd-kit/sortable";

/**
 * Creates a unique value by appending a counter for duplicate entries.
 *
 * @param {string} val - The base value.
 * @param {Array} existingValues - Array of existing values.
 * @return {string} - A unique value string.
 */
const createUniqueValue = (val, existingValues) => {
	let uniqueValue = val;
	let count = 1;

	while (existingValues.includes(uniqueValue)) {
		count += 1;
		uniqueValue = `${val}_${count}`;
	}

	return uniqueValue;
};

/**
 * MultiSelectSortableDuplicates Component
 *
 * @param {Array} options - Array of initial available options.
 * @param {Array} value - Array of selected values.
 * @param {function} onChange - Function to call when the selection changes.
 * @param {function} onCreateOption - Function to call when a new option is created.
 */
const MultiSelectSortableDuplicates = ({
	options = [],
	value = [],
	onChange = null,
	onCreateOption = null,
}) => {
	// Map value to options, assigning a unique identifier for each.
	const chosenOptions = useMemo(() => {
		const existingValues = [];
		return value.map((val) => {
			const uniqueValue = createUniqueValue(val, existingValues);
			existingValues.push(uniqueValue);

			// Add to options if it doesn't exist.
			if ( ! options.find((opt) => opt.label === val) ) {
				options.push({
					label: val,
					value: uniqueValue,
					actualValue: val,
				});
			}

			return {
				label: val,
				value: uniqueValue,
				actualValue: val,
			};
		});
	}, [value]);

	// State to manage the additional options created by the user
	const [additionalOptions, setAdditionalOptions] = useState([]);

	// Merge initial and additional options
	const allOptions = useMemo(() => [...options, ...additionalOptions], [
		options,
		additionalOptions,
	]);

	// Initialize the state for selected options.
	const [selectedOptions, setSelectedOptions] = useState(chosenOptions);

	/**
	 * Handles the end of a drag event, reordering the selected items.
	 *
	 * @param {object} event - The drag end event.
	 */
	const onDragEnd = useCallback(
		(event) => {
			const { active, over } = event;

			if (!active || !over) {
				return;
			}

			setSelectedOptions((items) => {
				const oldIndex = items.findIndex((item) => item.value === active.id);
				const newIndex = items.findIndex((item) => item.value === over.id);
				const reordered = arrayMove(items, oldIndex, newIndex);

				if (onChange) {
					onChange(reordered.map((obj) => obj.actualValue));
				}

				return reordered;
			});
		},
		[onChange],
	);

	/**
	 * Handles changes in the selection.
	 *
	 * @param {Array} changedOptions - Array of changed options.
	 */
	const handleChange = (changedOptions) => {
		const existingValues = selectedOptions.map((opt) => opt.value);

		const processedOptions = changedOptions.map((opt) => {
			const actualValue = opt.label;
			const uniqueValue = createUniqueValue(actualValue, existingValues);

			return {
				label: actualValue,
				value: uniqueValue,
				// actualValue: isNaN(actualValue) ? actualValue : `${actualValue}%`,
				actualValue: actualValue,
			};
		});

		setSelectedOptions(processedOptions);

		if (onChange) {
			const selectedValues = processedOptions.map((obj) => obj.actualValue);
			onChange(selectedValues);
		}
	};

	/**
	 * Handles the creation of a new option.
	 *
	 * @param {string} inputValue - The value of the new option.
	 */
	const handleCreate = (inputValue, options) => {
		// Ensure the new option has a unique value.
		const existingValues = selectedOptions.map((opt) => opt.value);
		const uniqueValue = createUniqueValue(inputValue, existingValues);

		const newOption = {
			label: inputValue,
			value: uniqueValue,
			actualValue: inputValue,
			// actualValue: isNaN(inputValue) ? inputValue : `${inputValue}%`,
		};

		// Add the new option to the selected options
		const newSelectedOptions = [...selectedOptions, newOption];
		setSelectedOptions(newSelectedOptions);

		console.log( inputValue, options);

		// If it doesn't exist, add to the options list.
		if ( ! allOptions.find((opt) => opt.label === inputValue) ) {
			setAdditionalOptions((prevOptions) => [...prevOptions, newOption]);
		}

		if (onChange) {
			onChange(newSelectedOptions.map((obj) => obj.actualValue));
		}

		if (onCreateOption) {
			onCreateOption(newOption.actualValue);
		}
	};

	/**
	 * Custom component for rendering each selected value with drag-and-drop capabilities.
	 *
	 * @param {object} props - The props for the component.
	 */
	const MultiValue = (props) => {
		const { attributes, listeners, setNodeRef, transform, transition } =
			useSortable({
				id: props.data.value,
			});
		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
		};

		return (
			<div style={style} ref={setNodeRef} {...attributes} {...listeners}>
				<components.MultiValue {...props} />
			</div>
		);
	};

	/**
	 * Custom component for rendering the remove button, preventing drag events on remove.
	 *
	 * @param {object} props - The props for the component.
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
			boxShadow: "none",
			border: state.isFocused ? "1px solid #1e1e1e" : provided.border,
		}),
	};

	return (
		<DndContext
			modifiers={[restrictToParentElement]}
			onDragEnd={onDragEnd}
			collisionDetection={closestCorners}
		>
			<SortableContext
				items={selectedOptions.map((o) => o.value)}
				strategy={rectSwappingStrategy}
			>
				<CreatableSelect
					isMulti
					hideSelectedOptions={false}
					isClearable={true}
					value={selectedOptions}
					onChange={handleChange}
					onCreateOption={handleCreate}
					options={allOptions}
					components={{
						MultiValue,
						MultiValueRemove,
						DropdownIndicator: () => null,
						IndicatorSeparator: () => null,
					}}
					// formatOptionLabel={(option) =>
					// 	!option.label || isNaN(option.label)
					// 		? option.label
					// 		: `${option.label}%`
					// }
					// formatCreateLabel={(inputValue) =>
					// 	inputValue ? `Add ${inputValue}` : ""
					// }
					styles={customStyles}
				/>
			</SortableContext>
		</DndContext>
	);
};

export default MultiSelectSortableDuplicates;