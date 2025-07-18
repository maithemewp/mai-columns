import { Button } from '@wordpress/components';
import { Icon, handle, close } from '@wordpress/icons';
import { useCallback, useState } from "@wordpress/element";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SelectSortableItem = ({ id, value, options, index, onDelete }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
	const [isHovered, setIsHovered] = useState(false);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		display: "flex",
		gap: "4px",
		alignItems: "center",
		justifyContent: "start",
		marginTop: index === 0 ? "4px" : "0", // Add top margin only to the first item.
		marginBottom: "4px",
		padding: "2px 2px 2px 4px",
		fontsize: "20px",
		backgroundColor: "#f9f9f9",
		border: "1px solid #ddd",
		borderRadius: "4px",
		cursor: "grab",
		...attributes.style,
	};

	// Find the label for the item
	const label = options.find(option => option.value === value)?.label || value;

	const handleDeleteClick = useCallback((e) => {
		e.stopPropagation();
		onDelete(id);
	}, [onDelete, id]);

	return (
		<div ref={setNodeRef} style={style}>
			<div {...attributes} {...listeners} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, cursor: "grab" }}>
				<Icon icon={handle} />
				{label}
			</div>
			<Button
				icon={close}
				iconSize={16}
				label="Remove item"
				size="small"
				style={{
					marginLeft: 'auto',
					transition: 'all 0.2s ease',
					backgroundColor: isHovered ? '#fee2e2' : 'transparent',
					color: isHovered ? '#dc2626' : 'inherit',
					borderRadius: '2px',
					padding: '2px',
				}}
				onClick={handleDeleteClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			/>
		</div>
	);
};

export default SelectSortableItem;