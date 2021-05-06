export class RepeatedParameterError extends Error {
	constructor(parameters) {
		super()
		this.parameters = parameters
	}
}

export class ParseError extends Error {
	constructor(message) {
		super(message)
	}
}

export class MalformedMediaType extends ParseError {
	constructor(mediaType) {
		super(`Malformed media type: ${mediaType}.`);
	}
}
