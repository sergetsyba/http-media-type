export default class MediaType {
	constructor(parameters) {
		this.type = parameters.type || 'application'
		this.subtype = parameters.subtype || '*'
		this.suffix = parameters.suffix || null
		this.parameters = parameters.parameters || {}
	}
}
