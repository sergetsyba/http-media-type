
export default class MediaType {
	/**
	 * Creates a new instance of MediaType.
	 * @param {object} properties
	 * @param {string} [properties.type] - Type of this media type.
	 * 		When not specified, uses 'application' type.
	 * @param {string} [properties.subtype] - Subtype of this media type.
	 * 		When not specified, uses wildcard subtype (type/*)
	 * @param {string} [properties.suffix] - Suffix of this media type.
	 * 		When not specified, uses null.
	 * @param {object} [properties.properties] - Parameters of this media type.
	 *//**
	 * Creates a new instance of MediaType.
	 * When no arguments specified, creates a wildcard media type (*//*).
	 * @param {string} [type] - Type of this media type.
	 *		When not specified, creates a wildcard media type (*//*).
	 * @param {string} [subtype] - Subtype of this media type.
	 *		When not specified, creates a media type with a wildcard subtype (type//*).
	 * @param {object} [parameters] - Parameters of this media type.
	 */
	constructor(type, subtype, parameters) {
		if (arguments.length === 1
			&& typeof arguments[0] === 'object') {
			const {type, subtype, suffix, parameters} = arguments[0]

			/**
			 * Type of this media type.
			 * @type {string}
			 */
			this.type = type || 'application'
			/**
			 * Subtype of this media type.
			 * @type {string}
			 */
			this.subtype = subtype || '*'
			/**
			 * Suffix of this media type.
			 * @type {string}
			 */
			this.suffix = suffix || null
			/**
			 * Parameters of this media type.
			 * @type {object}
			 */
			this.parameters = parameters || {}
		}
		else {
			this.type = type || '*'
			this.subtype = subtype || '*'
			this.suffix = null
			this.parameters = parameters || {}
		}
	}

	/**
	 * @returns {string} Textual representation of this media type.
	 */
	get formatted() {
		let formatted = this.type + '/' + this.subtype
		if (this.suffix != null) {
			formatted += '+' + this.suffix
		}
		for (const parameter in this.parameters) {
			formatted += '; ' + parameter
				+ '=' + this.parameters[parameter]
		}

		return formatted
	}

	/**
	 * Checks whether this media type is equal to the specified one.
	 * @param {MediaType} mediaType
	 * @returns {boolean} Returns true when this media type is equal to the
	 *		specified one; returns false otherwise.
	 */
	isEqual(mediaType) {
		return this.type === mediaType.type
			&& this.subtype === mediaType.subtype
			&& this.suffix === mediaType.suffix
			&& isObjectsMatch(this.parameters, mediaType.parameters,
				(parameter1, parameter2) =>
					parameter1 === parameter2)
	}
}

function isObjectsMatch(object1, object2, isValuesMatch) {
	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)
	if (keys1.length !== keys2.length) {
		return false
	}

	return keys1.every((key) =>
		isValuesMatch(object1[key], object2[key]))
}
