export function createParametersProxy(object) {
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

export function parametersMatch(object1, object2, valuesMatch) {
	// collect all distinct parameters
	const keys = new Set([
		...Object.keys(object1),
		...Object.keys(object2)
	])

	for (const key of keys) {
		let match = valuesMatch(key, object1[key], object2[key])

		// needs explicit check for null, since simplifying with || operator would return
		// incorrect result when raw values are equal, but set unequal explicitly in the
		// value comparator
		if (match == null) {
			match = object1[key] === object2[key]
		}
		if (match === false) {
			return false
		}
	}

	return true
}
