import {
	RepeatedParameterError,
	ParseError
} from './errors.js'

import {
	createParametersProxy,
	parametersMatch
} from './media-type-parameters.js'


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
	 *
	 * @throws {RepeatedParameterError} When any parameter is specified more than once
	 * 	(in different letter cases).
	 *//**
	 * Creates a new instance of MediaType.
	 *
	 * When no arguments specified, creates a wildcard media type (*//*).
	 * @param {string=} [type] - Type of this media type.
	 *		When not specified, creates a wildcard media type (*//*).
	 * @param {string} [subtype=*] - Subtype of this media type.
	 *		When not specified, creates a media type with a wildcard subtype (type//*).
	 * @param {object=} [parameters] - Parameters of this media type.
	 *
	 * @throws {RepeatedParameterError} When any parameter is specified more than once
	 * 	(in different letter cases).
	 */
	constructor(type, subtype, parameters = {}) {
		let suffix = null
		if (arguments.length === 1
			&& typeof arguments[0] === 'object') {
			({
				type = 'application',
				subtype,
				suffix,
				parameters = {}
			} = arguments[0])
		}

		/**
		 * Type of this media type.
		 * @type {string}
		 */
		this.type = type || '*'

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
		 *
		 * Both property accessors and 'in' operator are case insensitive. However,
		 * retrieving all parameter names (keys), as well as parameter iteration
		 * preserves letter case of parameter names from constructor or parse method
		 * arguments.
		 *
		 * @type {object}
		 */
		ensureParametersDistinct(parameters)
		this.parameters = createParametersProxy(parameters)
	}

	/**
	 * Returns a new instance of MediaType parsed from the specified textual
	 * representation of a media type.
	 *
	 * This implementation is less restrictive than media type specification in
	 * RFC 6838 section 4.2. It allows any characters other than white space and / to be
	 * used in type, subtype and suffix, as well as does not impose any length limits on
	 * those values.
	 *
	 * When an optional callback for processing media type parameters is specified, its
	 * output is stored as a value of corresponding parameters. When this callback does
	 * not return a value the corresponding parameter is ignored. This callback can be
	 * used to e.g. convert media type parameters from text to JavaScript types, apply
	 * formatting, ignore unwanted parameters, etc.
	 *
	 * @param {string} text - Textual representation of a media type.
	 * @param {function(string, string): *=} processParameter - An optional callback for
	 * 	additional processing media type parameter values. It is called for each
	 * 	parameter of the parsed media type with parameter name and value as its
	 * 	arguments.
	 * 	The callback should return the processed parameter value. When no value is
	 * 	returned, the processed parameter is ignored and will not be present in the
	 * 	parsed media type.
	 * 	When this callback is not specified, all parameter values are stored as strings.
	 *
	 * @returns {MediaType} Parsed instance of a MediaType.
	 * @throws {ParseError} When the specified textual representation of a media type is
	 * malformed.
	 * @throws {RepeatedParameterError} When any parameter is specified more than once
	 * 	(including different letter cases).
	 */
	static parse(text, processParameter) {
		if (processParameter == null) {
			processParameter = (parameter, value) => value
		}

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
		const sameCaseRepeatedParameters = []

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
				// throw an error when parameter is repeated
				if (parameter in parameters) {
					sameCaseRepeatedParameters.push(parameter)
				}
				else {
					parameters[parameter] = processedValue
				}
			}
		}

		// ensure no repeated parameters present
		ensureParametersDistinct(parameters, sameCaseRepeatedParameters)

		// create a parsed media type instance
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
	 * IANA registration tree type of this media type.
	 *
	 * When this media type has an unknown registration tree prefix, this property
	 * contains the prefix.
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

		const entries = Object.entries(this.parameters)
		for (const [parameter, value] of entries) {
			formatted += `; ${parameter}=${value}`
		}

		return formatted
	}

	/**
	 * Checks whether this media type is equal to the specified one.
	 *
	 * All media type parameter values are compared with strict equality operator (===).
	 * When an optional callback is specified, it is used instead to determine parameter
	 * value equality. This callback can be used to e.g. do additional processing in
	 * parameter values comparison, or ignore certain parameters when checking for media
	 * types equality.
	 *
	 * @param {MediaType} mediaType - A media type, with which this media is being
	 * 	compared for equality.
	 * @param {function(string, *, *): boolean=} compareParameters - An optional callback
	 * 	for custom comparison of parameter values of the compared media types.
	 * 	This callback receives parameter name as its first argument, and parameter values
	 * 	of this and compared media types as the second and the third argument
	 * 	respectively. When a parameter appears only in one of the compared media types,
	 * 	this callback receives undefined as the argument for parameter value of the media
	 * 	type where parameter is absent.
	 * 	The callback should return a boolean indicating whether the values of a parameter
	 * 	are equal. When no value is returned, the values are compared with strict
	 * 	equality operator (===).
	 * 	When no callback is specified, all values of common parameters are compared with
	 * 	strict equality operator (===).
	 * @returns {boolean} Returns true when this media type is equal to the
	 *		specified one; returns false otherwise.
	 */
	equals(mediaType, compareParameters) {
		if (compareParameters == null) {
			compareParameters = (parameter, value1, value2) =>
				value1 === value2
		}

		return this.type === mediaType.type
			&& this.subtype === mediaType.subtype
			&& this.suffix === mediaType.suffix
			&& parametersMatch(this.parameters, mediaType.parameters, compareParameters)
	}

	/**
	 * Checks whether this media type is compatible with (i.e. matches) the specified
	 * one.
	 *
	 * This method is similar to equals() method, except it accounts for wildcards (*)
	 * in media type properties. It is better suited for HTTP content negotiation.
	 *
	 * Media types are matched according to the following rules:
	 * 	- wildcard media type (*\/*) matches any media type;
	 * 	- media type with wildcard subtype (type\/*) matches media iff their type and
	 * 		parameters are equal;
	 * 	- media type without wildcards matches any media type without wildcards iff
	 * 		they are equal;
	 *
	 * @param {MediaType} mediaType - Media type with which this media type is being
	 *	compared for compatibility.
	 * @param {function(string, *, *): boolean=} compareParameters - An optional callback
	 * 	for custom comparison of parameter values of the compared media types.
	 * 	This callback receives parameter name as its first argument, and parameter values
	 * 	of this and compared media types as the second and the third argument
	 * 	respectively. When a parameter appears only in one of the compared media types,
	 * 	this callback receives undefined as the argument for parameter value of the media
	 * 	type where parameter is absent.
	 * 	The callback should return a boolean indicating whether the values of a parameter
	 * 	are equal. When no value is returned, the values are compared with strict
	 * 	equality operator (===).
	 * 	When no callback is specified, all values of common parameters are compared with
	 * 	strict equality operator (===).
	 * @returns {boolean} Returns true when this media type is compatible with the
	 *	specified one; returns false otherwise.
	 */
	matches(mediaType, compareParameters) {
		if (compareParameters == null) {
			compareParameters = (parameter, value1, value2) =>
				value1 === value2
		}

		if (this.type === '*' || mediaType.type === '*') {
			// wildcard media type matches any media type
			return true
		}
		else if (this.subtype === '*' || mediaType.subtype === '*') {
			// media type with wildcard subtype matches any media with same type and
			// parameters
			// note: media type suffix is not allowed with wildcard subtype
			return this.type === mediaType.type
				&& parametersMatch(this.parameters, mediaType.parameters, compareParameters)
		}
		else {
			return this.equals(mediaType)
		}
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

function findIndex(text, character, start = 0, end = text.length) {
	let index = start
	for (; index < end; ++index) {
		if (text.charAt(index) === character) {
			break
		}
	}

	return index;
}

function ensureParametersDistinct(parameters, sameCaseParameters = []) {
	const repeatedParameters = sameCaseParameters || []
	const distinctParameters = new Set()

	for (const parameter of Object.keys(parameters)) {
		const formattedParameter = parameter.toLowerCase()
		if (distinctParameters.has(formattedParameter)) {
			repeatedParameters.push(parameter)
		}
		else {
			distinctParameters.add(formattedParameter)
		}
	}

	if (repeatedParameters.length > 0) {
		throw new RepeatedParameterError(repeatedParameters)
	}
}
