import { useState, useEffect, useCallback } from "@wordpress/element";
import CreatableSelect from "react-select/creatable";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { arrayMove, verticalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SelectSortableItem from "./SelectSortableItem";

const SelectSortable = ({
	options = [],
	attributeKey,
	attributes,
	setAttributes,
	onCreateOption = null,
	isValidNewOption = null,
	placeholder = "Select or create items...",
}) => {
	const [sortableItems, setSortableItems] = useState([]);
	const [activeId, setActiveId] = useState(null);

	// Initialize sortable items from attributes
	useEffect(() => {
		if (attributes[attributeKey]) {
			const existingItems = attributes[attributeKey].map((value, index) => ({
				id: `${value}-${index}`,
				value: value,
			}));
			setSortableItems(existingItems);
		} else {
			setSortableItems([]);
		}
	}, [attributes, attributeKey]);

	// Update attributes when sortable items change
	const updateAttributes = useCallback((items) => {
		setAttributes({ [attributeKey]: items.map(item => item.value) });
	}, [setAttributes, attributeKey]);

	const handleChange = useCallback((selected) => {
		if (selected) {
			const newItems = selected.map((option) => ({
				id: `${option.value}-${Date.now()}`,
				value: option.value,
			}));

			const updatedItems = [...sortableItems, ...newItems];
			setSortableItems(updatedItems);
			updateAttributes(updatedItems);
		}
	}, [sortableItems, updateAttributes]);

	const handleCreateOption = useCallback((inputValue) => {
		if (isValidNewOption && !isValidNewOption(inputValue)) {
			return;
		}

		if (onCreateOption) {
			onCreateOption(inputValue);
		}

		const newItem = {
			id: `${inputValue}-${Date.now()}`,
			value: inputValue
		};

		const updatedItems = [...sortableItems, newItem];
		setSortableItems(updatedItems);
		updateAttributes(updatedItems);
	}, [sortableItems, updateAttributes, onCreateOption, isValidNewOption]);

	const handleDelete = useCallback((idToDelete) => {
		const updatedItems = sortableItems.filter(item => item.id !== idToDelete);
		setSortableItems(updatedItems);
		updateAttributes(updatedItems);
	}, [sortableItems, updateAttributes]);

	const handleDragEnd = useCallback((event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const activeIndex = sortableItems.findIndex(item => item.id === active.id);
			const overIndex = sortableItems.findIndex(item => item.id === over.id);

			const newItems = arrayMove(sortableItems, activeIndex, overIndex);
			setSortableItems(newItems);
			updateAttributes(newItems);
		}

		setActiveId(null);
	}, [sortableItems, updateAttributes]);

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
					MultiValue: ({ data, innerProps }) => (
						<div {...innerProps}>
							{data.label}
						</div>
					),
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
				placeholder={placeholder}
				value={[]}
				styles={customStyles}
				isValidNewOption={isValidNewOption}
			/>
			<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
				<SortableContext
					items={sortableItems.map(item => item.id)}
					strategy={verticalListSortingStrategy}
				>
					{sortableItems.map((item, index) => (
						<SelectSortableItem
							key={item.id}
							id={item.id}
							value={item.value}
							index={index}
							options={options}
							onDelete={handleDelete}
						/>
					))}
				</SortableContext>
				<DragOverlay>
					{activeId ? (
						<SelectSortableItem
							id={activeId}
							value={sortableItems.find(item => item.id === activeId)?.value}
							options={options}
							onDelete={handleDelete}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default SelectSortable;