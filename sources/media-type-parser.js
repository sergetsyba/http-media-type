import {MalformedMediaType} from "./errors.js";


const baseRegex = /^\s*(?<type>[^\/\s]+)\/(?<subtype>[^\/;\s]+)\s*($|;)/
const parameterRegex = /;\s*(?<parameter>[^=]+)\s*=\s*(("(?<quotedValue>[^"]+)")|(?<value>[^;]+))/g

export function parseMediaType(text) {
	const match = baseRegex.exec(text)
	if (match == null) {
		throw new MalformedMediaType(text)
	}

	let {type, subtype} = match.groups
	let suffix = null

	// note: media type suffix starts at the last occurrence of + in subtype, where
	// subtype can have other + occurrences;
	// todo: consider improving regex to parse suffix together with type and subtype
	const suffixIndex = subtype.lastIndexOf('+')
	if (suffixIndex > -1) {
		suffix = subtype.substring(suffixIndex + 1)
		subtype = subtype.substring(0, suffixIndex)
	}

	return {
		type,
		subtype,
		suffix,
		parameters: parseParameters(text)
	}
}

function parseParameters(text) {
	const parameters = []

	let match = parameterRegex.exec(text)
	while (match != null) {
		const {parameter, quotedValue, value} = match.groups
		match = parameterRegex.exec(text)

		parameters.push({
			parameter,
			value: quotedValue || value
		})
	}

	return parameters
}
