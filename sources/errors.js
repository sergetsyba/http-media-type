export class RepeatedParameterError extends Error {
	constructor(parameter) {
		super()
		this.parameter = parameter
	}
}

export class ParseError extends Error {
	constructor(message) {
		super(message)
	}
}
