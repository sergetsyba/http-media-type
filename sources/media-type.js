import {createParametersProxy, parametersMatch} from './parameters.js'
import {parseMediaType} from './parser.js'
import {RepeatedParameterError} from './errors.js'

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
		let parametersProcessed = false

		if (arguments.length === 1
			&& typeof arguments[0] === 'object') {
			({
				// public properties
				type = 'application',
				subtype,
				suffix = null,
				parameters = {},

				// private properties
				parametersProcessed = false
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
		 * Parameters are case insensitive with property accessor [...] and 'in'
		 * operator. Parameters preserve letter case from constructor or parse function
		 * arguments when iterated or accessed all at once.
		 *
		 * @type {object}
		 */
		this.parameters = parametersProcessed
			? parameters
			: processParameters(parameters)
	}

	/**
	 * Returns a new instance of MediaType parsed from the specified textual
	 * representation of a media type.
	 *
	 * This implementation is less restrictive than media type specification in
	 * RFC 6838 section 4.2 and RFC 7231 section 5.3.2. In addition these specifications
	 * this implementation
	 * 	- allows any characters in type, except /
	 * 	- allows any characters in subtype, except ;
	 * 	- imposes no length restriction on type and subtype
	 * 	- allows white space around = in parameters
	 *
	 * An optional callback can be specified for additional parameter value processing.
	 * This allows converting parameter values to other types, ignoring some parameters,
	 * etc.
	 *
	 * @param {string} text - Textual representation of a media type.
	 * @param {function(string, string): *=} processParameter - An optional callback for
	 * 	additional processing of media type parameter values.
	 * 	This callback is called for each of the parsed parameters with parameter name and
	 * 	value as its arguments. It should return the processed parameter value. When no
	 * 	value is returned, the processed parameter is ignored and will not be present in
	 * 	the parsed media type.
	 * 	When this callback is not specified, all parameter values are stored as strings.
	 *
	 * @returns {MediaType} Parsed instance of a MediaType.
	 * @throws {ParseError} When the specified textual representation of a media type is
	 * malformed.
	 * @throws {RepeatedParameterError} When any parameter is specified more than once
	 * 	(including different letter cases).
	 */
	static parse(text, processParameter) {
		// note: also covers when processParameter == null
		if (typeof processParameter !== 'function') {
			processParameter = (parameter, value) => value
		}

		// parse media type and regroup parameters into an object
		const mediaType = parseMediaType(text)
		const parameters = processParsedParameters(mediaType.parameters, processParameter)

		// create an instance of media type and flag that parameters are already wrapped
		// into a case insensitive proxy
		return new MediaType({
			...mediaType,
			parameters,
			parametersProcessed: true
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
	 * An optional callback can be specified for custom parameter comparison. It allows
	 * to compare parameter values of different types, ignore some parameters, etc.
	 *
	 * @param {MediaType} mediaType - A media type, with which this media is being
	 * 	compared for equality.
	 * @param {function(string, *, *): boolean=} compareParameter - An optional callback
	 * 	for custom comparison of parameter values of the compared media types.
	 * 	This callback is called for each parameter with parameter name as its first
	 * 	argument, and parameter values of this and compared media types as the second and
	 * 	the third argument respectively. When a parameter appears only in one of the
	 * 	compared media types, this callback is called with undefined as the argument for
	 * 	parameter value of the media type where parameter is absent.
	 * 	The callback should return a boolean indicating whether the values of a parameter
	 * 	are equal. When no value is returned, the values are compared with strict
	 * 	equality operator (===).
	 * 	When no callback is specified, all values of common parameters are compared with
	 * 	strict equality operator (===).
	 * @returns {boolean} Returns true when this media type is equal to the
	 *		specified one; returns false otherwise.
	 */
	equals(mediaType, compareParameter) {
		// note: also covers when processParameter == null
		if (typeof compareParameter !== 'function') {
			compareParameter = (parameter, value1, value2) =>
				value1 === value2
		}

		return this.type === mediaType.type
			&& this.subtype === mediaType.subtype
			&& this.suffix === mediaType.suffix
			&& parametersMatch(this.parameters, mediaType.parameters, compareParameter)
	}

	/**
	 * Checks whether this media type is compatible with (i.e. matches) the specified
	 * one.
	 *
	 * This method is similar to equals() method, except it accounts for wildcards (*)
	 * in media type properties. It is better suited for HTTP content negotiation.
	 *
	 * An optional callback can be specified for custom parameter comparison. It allows
	 * to compare parameter values of different types, ignore some parameters, etc.
	 *
	 * Media types are matched as follows:
	 * 	- wildcard media type (*\/*) matches any media type;
	 * 	- media type with wildcard subtype (type\/*) matches media iff their type and
	 * 		parameters are equal;
	 * 	- media type without wildcards matches any media type without wildcards iff
	 * 		they are equal;
	 *
	 * @param {MediaType} mediaType - Media type with which this media type is being
	 *	compared for compatibility.
	 * @param {function(string, *, *): boolean=} compareParameter - An optional callback
	 * 	for custom comparison of parameter values of the compared media types.
	 * 	This callback is called for each parameter with parameter name as its first
	 * 	argument, and parameter values of this and compared media types as the second and
	 * 	the third argument respectively. When a parameter appears only in one of the
	 * 	compared media types, this callback is called with undefined as the argument for
	 * 	parameter value of the media type where parameter is absent.
	 * 	The callback should return a boolean indicating whether the values of a parameter
	 * 	are equal. When no value is returned, the values are compared with strict
	 * 	equality operator (===).
	 * 	When no callback is specified, all values of common parameters are compared with
	 * 	strict equality operator (===).
	 * @returns {boolean} Returns true when this media type is compatible with the
	 *	specified one; returns false otherwise.
	 */
	matches(mediaType, compareParameter) {
		if (typeof compareParameter !== 'function') {
			compareParameter = (parameter, value1, value2) =>
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
				&& parametersMatch(this.parameters, mediaType.parameters, compareParameter)
		}
		else {
			return this.equals(mediaType, compareParameter)
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


function processParameters(parameters) {
	const repeatedParameters = []
	parameters = Object.entries(parameters)
		.reduce((parameters, [parameter, value]) => {
			if (parameter in parameters) {
				repeatedParameters.push(parameter)
			}

			parameters[parameter] = value
			return parameters
		}, createParametersProxy({}))

	// ensure no repeated parameters present
	if (repeatedParameters.length > 0) {
		throw new RepeatedParameterError(repeatedParameters)
	}

	return parameters
}

function processParsedParameters(parameters, processParameter) {
	const repeatedParameters = []
	parameters = parameters
		.reduce((parameters, {parameter, value}) => {
			value = processParameter(parameter, value)
			if (value != null) {
				if (parameter in parameters) {
					repeatedParameters.push(parameter)
				}
				parameters[parameter] = value
			}

			return parameters
		}, createParametersProxy({}))

	// ensure no repeated parameters present
	if (repeatedParameters.length > 0) {
		throw new RepeatedParameterError(repeatedParameters)
	}

	return parameters
}
