/**
 * Converts blockGap values to CSS value.
 *
 * @since 0.1.0
 *
 * @param {string|array} gap The blockGap value.
 *
 * @return {string}
 */
export const getBlockGap = (gap) => {
	const returnObj = {
		row: "initial",
		column: "initial",
	};

	if (typeof gap === "object") {
		if (gap.top) {
			returnObj.row = getBlockGapValue(gap.top);
		}

		if (gap.left) {
			returnObj.column = getBlockGapValue(gap.left);
		}
	} else {
		returnObj.row = returnObj.column = getBlockGapValue(gap);
	}

	return returnObj;
};

/**
 * Gets the CSS value from the blockGap value.
 *
 * @since 0.1.0
 *
 * @param {string} gap The blockGap value.
 *
 * @return {string}
 */
export const getBlockGapValue = (gap) => {
	const array = gap.split("|");
	const last  = array.pop();

	return array.length > 1 ? `var(--wp--preset--spacing--${last})` : last;
};

/**
 * Get the flex CSS value.
 *
 * @since 0.1.0
 *
 * @param {string} value
 *
 * @return {string}
 */
export const getFlexCSSValue = (value) => {
	switch (value) {
		case "top":
		case "left":
			return "flex-start";
		case "middle":
		case "center":
			return "center";
		case "bottom":
		case "right":
			return "flex-end";
		case "space-between":
			return "space-between";
		default:
			return "initial";
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
export const isFraction = (value) => {
	return /^\d+\/\d+$/.test(value);
};

/**
 * Checks if a value is a percentage.
 *
 * @since 0.1.0
 *
 * @param {string} value
 *
 * @return {bool}
 */
export const isPercentage = (value) => {
	return /^\d+%$/.test(value);
};

/**
 * Checks if a value is a valid CSS value for a property.
 *
 * @since 0.1.0
 *
 * @param {string} value    The value to check.
 * @param {string} property The CSS property to check against.
 *
 * @returns {bool}
 */
export function isValidCSSValue(value, property = "flex-basis") {
	const style = document.createElement("div").style;
	style[property] = value;
	return value === style[property];
}

