export default class MediaType {
	constructor(parameters) {
		if (parameters == null) {
			this.type = '*'
			this.subtype = '*'
			this.suffix = null
			this.parameters = {}
		}
		else if (typeof parameters === 'object') {
			this.type = parameters.type || 'application'
			this.subtype = parameters.subtype || '*'
			this.suffix = parameters.suffix || null
			this.parameters = parameters.parameters || {}
		}
	}

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
}
