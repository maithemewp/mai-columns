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
 * Gets flex value from column size.
 *
 * @since 0.1.0
 *
 * @param {string} size The size value from settings.
 *
 * @return {string}
 */
export const getFlex = (size) => {
	if (!size) {
		return "1";
	}

	switch (size) {
		case "fit":
			return "0 1 auto";
		case "fill":
			return "1 0 0";
	}

	return "0 1 var(--flex-basis)";
};

/**
 * Gets the fraction value from a given value.
 *
 * @param {string} value
 *
 * @return {string}
 */
export const getSize = (value) => {
	if (!value) {
		return false;
	}

	if (["fit", "fill", "break"].includes(value)) {
		return false;
	}

	if (isFraction(value)) {
		return value;
	}

	if (isPercentage(value)) {
		const percentage   = parseFloat(value.replace("%", ""));
		const decimalValue = percentage / 100;
		const numerator    = Math.round(decimalValue * 100);
		const denominator  = 100;
		const gcd          = getGcd(numerator, denominator);

		return `${numerator / gcd}/${denominator / gcd}`;
	}

	// TODO: Check if valid CSS value?
	if (isValidCSSValue(value)) {
		return value;
	}

	return false;
};

/**
 * Get the flex CSS value.
 * TODO: This is duplicated in edit.js of the other block.
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
 * Gets the greatest common denominator.
 *
 * @since 0.1.0
 *
 * @param {int} a
 * @param {int} b
 *
 * @return {int}
 */
export const getGcd = (a, b) => {
	if (0 === b) {
		return a;
	} else {
		return getGcd(b, a % b);
	}
};

/**
 * Gets the correct column value from the repeated arrangement array.
 *
 * @since 0.1.0
 *
 * @param {int}   index   The current item index to get the value for.
 * @param {array} array   The array to get index value from.
 * @param {mixed} default The default value if there is no index.
 *
 * @return {mixed}
 */
export const getIndexValueFromArray = function (
	index,
	array,
	defaultVal = null,
) {
	if (undefined !== array[index]) {
		return array[index];
	}

	if (1 === array.length) {
		return array[0];
	}

	return array[index % array.length] ?? defaultVal;
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

/**
 * Reverses an object.
 * Convert the object to an array of [key, value] pairs.
 * Reverses the array.
 * Convert the reversed array back to an object.
 *
 * @since 0.1.0
 *
 * @param {object} obj The object to reverse.
 *
 * @returns {object}
 */
export const reverseObject = (obj) => {
	return Object.fromEntries(Object.entries(obj).reverse());
};

export const mapValuesToLabels = (values, options) => {
	return values.map((value) => {
		const option = options.find((opt) => opt.value === value);
		return option ? option.label : value;
	});
};

export const mapLabelsToValues = (values, options) => {
	return values.map((value) => {
		const option = options.find((opt) => opt.label === value);
		return option ? option.value : value;
	});
};
