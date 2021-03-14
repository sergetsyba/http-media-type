import ParseError from './parse-error.js'

export default class MediaType {
	/**
	 * Creates a new instance of MediaType.
	 *
	 * @param {object} properties
	 * @param {string} [properties.type=application] - Type of this media type.
	 * 		When not specified, uses 'application' type.
	 * @param {string} [properties.subtype=*] - Subtype of this media type.
	 * 		When not specified, uses wildcard subtype (type/*)
	 * @param {string} [properties.suffix=null] - Suffix of this media type.
	 * 		When not specified, uses null.
	 * @param {object=} [properties.properties] - Parameters of this media type.
	 *//**
	 * Creates a new instance of MediaType.
	 *
	 * When no arguments specified, creates a wildcard media type (*//*).
	 * @param {string=} [type] - Type of this media type.
	 *		When not specified, creates a wildcard media type (*//*).
	 * @param {string} [subtype=*] - Subtype of this media type.
	 *		When not specified, creates a media type with a wildcard subtype (type//*).
	 * @param {object=} [parameters] - Parameters of this media type.
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
	 * Returns a new instance of MediaType parsed from the specified textual
	 * representation of a media type.
	 *
	 * This implementation is less restrictive than media type specification
	 * in RFC 6838 section 4.2. It allows any characters other than white
	 * space and / to be used in type, subtype and suffix, as well as does
	 * not impose any length limits on those values.
	 *
	 * When an optional callback for processing media type parameters is specified,
	 * the output of this function is stored as a value of corresponding parameters.
	 * When this function does not return a value the corresponding parameter is
	 * ignored. This callback can be used to e.g. convert media type parameters
	 * from text to JavaScript types, apply formatting, ignore unwanted parameters,
	 * etc.
	 *
	 * @param {string} text - Textual representation of a media type.
	 * @param {function(string, string): *=} processParameter - An optional callback
	 * 	for processing media type parameter values. It is called for each parameter
	 * 	of the parsed media type with parameter name and value as arguments; it is
	 * 	expected to return the processed parameter value. When no value is returned,
	 *	the processed parameter is ignored. When this callback is not specified,
	 *	all parameter values are stored as strings.
	 *
	 * @returns {MediaType} Parsed instance of a MediaType.
	 * @throws {ParseError} When the specified textual representation of a media
	 * 	type is malformed.
	 */
	static parse(text, processParameter = (parameter, value) => value) {
		const parametersIndex = findIndex(text, ';')

		// ensure base text does not include white space
		const mediaType = text.substring(0, parametersIndex)
		if (/\s/.test(text.substring(0, parametersIndex))) {
			throw new ParseError('Malformed media type: ' + text)
		}

		// ensure base text includes only a single slash
		let [type, subtype, ...rest] = mediaType.split('/')
		if (rest.length > 0) {
			throw new ParseError('Malformed media type: ' + text)
		}

		let suffix = null
		const suffixIndex = subtype.lastIndexOf('+')
		if (suffixIndex > -1) {
			suffix = subtype.substring(suffixIndex + 1)
			subtype = subtype.substring(0, suffixIndex)
		}

		const parameters = {}
		for (let parameterIndex = parametersIndex; parameterIndex < text.length; ) {
			const valueIndex = findIndex(text, '=', parameterIndex + 1)
			const parameter = text.substring(parameterIndex + 1, valueIndex)
				.trim()

			parameterIndex = findIndex(text, ';', valueIndex)
			const value = text.substring(valueIndex + 1, parameterIndex)

			// apply an optional callback to process the parameter value
			const processedValue = processParameter(parameter, value)
			// keep parameter only when the callback returns a value
			if (processedValue != null) {
				parameters[parameter] = processedValue
			}
		}

		return new MediaType({
			type,
			subtype,
			suffix,
			parameters
		})
	}

	/**
	 * IANA registration tree types.
	 * @type {object}
	 */
	static get RegistrationTree() {
		return RegistrationTree
	}

	/**
	 * IANA registration tree type of this media type. When this media type
	 * has an unknown registration tree prefix, this property contains the prefix.
	 * Note: whenever subtype this media type contains dots, character sequence
	 * until the first dot is considered a registration tree prefix.
	 *
	 * @type {(RegistrationTree|string)}
	 */
	get registrationTree() {
		const dotIndex = this.subtype.indexOf('.')
		if (dotIndex < 0) {
			return RegistrationTree.standards
		}

		const treePrefix = this.subtype.substring(0, dotIndex)
		switch (treePrefix) {
			case 'vnd':
				return RegistrationTree.vendor
			case 'prs':
				return RegistrationTree.personal
			case 'x':
				return RegistrationTree.unregistered
			default:
				return treePrefix
		}
	}

	/**
	 * Textual representation of this media type.
	 * @type {string}
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
	 *
	 * @param {MediaType} mediaType
	 * @returns {boolean} Returns true when this media type is equal to the
	 *		specified one; returns false otherwise.
	 */
	equals(mediaType) {
		return this.type === mediaType.type
			&& this.subtype === mediaType.subtype
			&& this.suffix === mediaType.suffix
			&& isObjectsMatch(this.parameters, mediaType.parameters,
				(parameter1, parameter2) =>
					parameter1 === parameter2)
	}
}

/**
 * @typedef {(standards|vendor|personal|unregistered)} RegistrationTree
 */

/**
 * Enumerated types of IANA registration trees.
 * @type {object}
 * @enum
 */
const RegistrationTree = Object.freeze({
	standards: 'standards',
	vendor: 'vendor',
	personal: 'personal',
	unregistered: 'unregistered'
})

function isObjectsMatch(object1, object2, isValuesMatch) {
	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)
	if (keys1.length !== keys2.length) {
		return false
	}

	return keys1.every((key) =>
		isValuesMatch(object1[key], object2[key]))
}

function findIndex(text, character, start = 0, end = text.length) {
	let index = start
	for (; index < end; ++index) {
		if (text.charAt(index) === character) {
			break
		}
	}

	return index;
}
