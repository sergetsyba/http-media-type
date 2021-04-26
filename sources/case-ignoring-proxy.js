export function createCaseIgnoringProxy(object) {
	return new Proxy(object, {
		has(target, key) {
			key = getKeyIgnoringCase(target, key)
			return key != null
		},
		get(target, key) {
			key = getKeyIgnoringCase(target, key)
			return target[key]
		},
		deleteProperty(target, key) {
			key = getKeyIgnoringCase(target, key)
			delete target[key]
			return true
		}
	})
}

function getKeyIgnoringCase(object, key) {
	if (key in object) {
		return key
	}
	if (typeof key === 'symbol') {
		key = key.toString()
	}
	key = key.toLowerCase()

	return Object.keys(object)
		.find((key2) =>
			key2.toLowerCase() === key)
}
