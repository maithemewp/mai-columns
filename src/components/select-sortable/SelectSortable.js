import { useState, useEffect } from "@wordpress/element";
import CreatableSelect from "react-select/creatable";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { arrayMove, verticalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Helper component for sortable items
const SortableItem = ({ id, value, options, index }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		marginTop: index === 0 ? "4px" : "0", // Add top margin only to the first item.
		marginBottom: "4px",
		padding: "8px",
		backgroundColor: "#f9f9f9",
		border: "1px solid #ddd",
		borderRadius: "3px",
		cursor: "grab",
		...attributes.style,
	};

	// Find the label for the item
	const label = options.find(option => option.value === value)?.label || value;

	return (
		<div ref={setNodeRef} {...attributes} {...listeners} style={style}>
			{label}
		</div>
	);
};

const SelectSortable = ({
	options = [],
	attributeKey,
	attributes,
	setAttributes,
	onChange = null,
	onCreateOption = null,
	isValidNewOption = null, // Add isValidNewOption prop
}) => {
	const [sortableItems, setSortableItems] = useState([]);
	const [activeId, setActiveId] = useState(null);

	useEffect(() => {
		if (attributes[attributeKey]) {
			// Create sortable items with unique IDs
			const existingItems = attributes[attributeKey].map((value, index) => ({
				id: `${value}-${index}`, // Use value and index for unique ID
				value: value,
			}));

			setSortableItems(existingItems);
		}
	}, [attributes, attributeKey, options]);

	const handleChange = (selected) => {
		if (selected) {
			const newItems = selected.map((option) => ({
				id: `${option.value}-${Date.now()}`, // Use timestamp for unique ID
				value: option.value,
			}));

			setSortableItems((prev) => [...prev, ...newItems]);

			// Update block attributes with unique IDs
			setAttributes({ [attributeKey]: [...(attributes[attributeKey] || []), ...newItems.map(item => item.value)] });
		}
	};

	const handleCreateOption = (inputValue) => {
		if (isValidNewOption && !isValidNewOption(inputValue)) {
			return; // If invalid, do nothing
		}

		if (onCreateOption) {
			onCreateOption(inputValue);
		}
		const newOption = { label: inputValue, value: inputValue };
		const newItem = { id: `${newOption.value}-${Date.now()}`, value: newOption.value };

		setSortableItems((prev) => [...prev, newItem]);

		// Update block attributes with unique IDs
		setAttributes({ [attributeKey]: [...(attributes[attributeKey] || []), newItem.value] });
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const activeIndex = sortableItems.findIndex(item => item.id === active.id);
			const overIndex = sortableItems.findIndex(item => item.id === over.id);

			const newItems = arrayMove(sortableItems, activeIndex, overIndex);
			setSortableItems(newItems);

			// Update block attributes with only values, not IDs
			setAttributes({ [attributeKey]: newItems.map(item => item.value) });
		}

		setActiveId(null);
	};

	const customStyles = {
		control: (provided, state) => ({
			...provided,
			boxShadow: "none",
			border: state.isFocused ? "1px solid #1e1e1e" : provided.border,
		}),
	};

	return (
		<div>
			<CreatableSelect
				isMulti
				options={options}
				onChange={handleChange}
				onCreateOption={handleCreateOption}
				components={{
					MultiValue: ({ data, innerProps }) => {
						return (
							<div {...innerProps}>
								{data.label}
							</div>
						);
					},
					MultiValueRemove: (props) => (
						<div
							{...props.innerProps}
							onMouseDown={(e) => e.stopPropagation()}
						>
							×
						</div>
					),
					DropdownIndicator: () => null,
					IndicatorSeparator: () => null,
				}}
				placeholder="Select or create sizes..."
				value={[]}  // Keep the select field always empty
				styles={customStyles}
				isValidNewOption={isValidNewOption} // Pass validation function here
			/>
			<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
				<SortableContext
					items={sortableItems.map(item => item.id)}
					strategy={verticalListSortingStrategy}
				>
					{sortableItems.map((item, index) => (
						<SortableItem key={item.id} id={item.id} value={item.value} index={index} options={options} />
					))}
				</SortableContext>
				<DragOverlay>
					{activeId ? (
						<SortableItem
							id={activeId}
							value={sortableItems.find(item => item.id === activeId)?.value}
							options={options}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default SelectSortable;