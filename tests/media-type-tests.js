import MediaType from '../sources/media-type.js'
import {RepeatedParameterError} from '../sources/errors.js'
import {strict as assert} from 'assert'

describe('MediaType', () => {
	describe('creates media type from separate arguments', () => {
		it('with all arguments', () => {
			const mediaType = new MediaType('text', 'plain', {
				charset: 'utf-8'
			})

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'text',
				subtype: 'plain',
				suffix: null,
				parameters: {
					charset: 'utf-8'
				}
			})
		})

		it('with type and subtype arguments', () => {
			const mediaType = new MediaType('text', 'plain')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'text',
				subtype: 'plain',
				suffix: null,
				parameters: {}
			})
		})

		it('with type argument', () => {
			const mediaType = new MediaType('text')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'text',
				subtype: '*',
				suffix: null,
				parameters: {}
			})
		})

		it('with no arguments', () => {
			const mediaType = new MediaType()

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: '*',
				subtype: '*',
				suffix: null,
				parameters: {}
			})
		})

		it('fails with repeated parameters', () => {
			assert.throws(() => {
				new MediaType('application', 'vnd.company.content', {
					charset: 'utf-8',
					version: 2,
					CharSet: 'utf-8',
					encoding: 'zip',
					VERSION: 2
				}, new RepeatedParameterError(['CharSet', 'VERSION']))
			})
		})
	})

	describe('creates media type from combined arguments', () => {
		it('with all properties', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})
		})

		it('with application type when type is not specified', () => {
			const mediaType = new MediaType({
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.type, 'application')
		})

		it('with wildcard subtype when subtype is not specified', () => {
			const mediaType = new MediaType({
				type: 'application',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.subtype, '*')
		})

		it('without suffix when suffix is not specified', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.suffix, null)
		})

		it('with empty parameters when parameters are not specified', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format'
			})

			assert.deepEqual(mediaType.parameters, {})
		})

		it('fails with repeated parameters', () => {
			assert.throws(() => {
				new MediaType({
					subtype: 'vnd.company.content',
					parameters: {
						Version: 2,
						CharSet: 'utf-8',
						version: 2,
					}
				})
			}, new RepeatedParameterError(['version']))
		})
	})

	describe('ignores parameters case', () => {
		it('verifies property in', () => {
			const mediaType = new MediaType('application', 'json', {
				CharSet: 'utf-8',
				variant: 'HAL'
			})

			assert('charset' in mediaType.parameters)
			assert(!('Nope' in mediaType.parameters))
			assert('VARIANT' in mediaType.parameters)
		})

		it('gets property', () => {
			const mediaType = new MediaType('application', 'json', {
				CharSet: 'utf-8',
				variant: 'HAL'
			})

			assert.equal(mediaType.parameters.charset, 'utf-8')
			assert.equal(mediaType.parameters['Nope'], undefined)
			assert.equal(mediaType.parameters['VARIANT'], 'HAL')
		})

		it('deletes property', () => {
			const mediaType = new MediaType('application', 'json', {
				CharSet: 'utf-8',
				variant: 'HAL'
			})

			delete mediaType.parameters.charset
			assert.deepEqual(mediaType.parameters, {
				variant: 'HAL'
			})

			delete mediaType.parameters['Nope']
			assert.deepEqual(mediaType.parameters, {
				variant: 'HAL'
			})

			delete mediaType.parameters['VARIANT']
			assert.deepEqual(mediaType.parameters, {})
		})

		it('preserves case when getting all parameters', () => {
			const mediaType = new MediaType('application', 'json', {
				CharSet: 'utf-8',
				variant: 'HAL'
			})

			const keys = Object.keys(mediaType.parameters)
			assert.deepEqual(keys, [
				'CharSet', 'variant'
			])
		})

		it('preserves case when iterating parameters', () => {
			const mediaType = new MediaType('application', 'json', {
				CharSet: 'utf-8',
				variant: 'HAL'
			})

			const keys = []
			for (const key in mediaType.parameters) {
				if (mediaType.parameters.hasOwnProperty(key)) {
					keys.push(key)
				}
			}

			assert.deepEqual(keys, [
				'CharSet', 'variant'
			])
		})
	})

	describe('gets registration tree type', () => {
		it('with standards tree', () => {
			const mediaType = new MediaType('application', 'json')
			assert.equal(mediaType.registrationTree, 'standards')
		})

		it('with vendor tree', () => {
			const mediaType = new MediaType('application', 'vnd.company.content')
			assert.equal(mediaType.registrationTree, 'vendor')
		})

		it('with personal tree', () => {
			const mediaType = new MediaType('application', 'prs.person.content')
			assert.equal(mediaType.registrationTree, 'personal')
		})

		it('with unregistered tree', () => {
			const mediaType = new MediaType('application', 'x.content')
			assert.equal(mediaType.registrationTree, 'unregistered')
		})

		it('with other tree', () => {
			const mediaType = new MediaType('application', 'unk.content')
			assert.equal(mediaType.registrationTree, 'unk')
		})
	})

	describe('parses media type', () => {
		it('with all properties', () => {
			const mediaType = MediaType.parse('application/vnd.company.content+format; ' +
				'param1=value1; ' +
				'param2=value2')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})
		})

		it('fails with repeated parameters', () => {
			const mediaType = 'application/json; ' +
				'charset=utf-8; ' +
				'schema=HAL; ' +
				'charset=utf-8'

			assert.throws(() => {
				MediaType.parse(mediaType)
			}, new RepeatedParameterError(['charset']))
		})

		it('fails with repeated parameters in different case', () => {
			const mediaType = 'application/json; ' +
				'charset=utf-8; ' +
				'schema=HAL; ' +
				'charset=utf-8; ' +
				'Schema=HAL'

			assert.throws(() => {
				MediaType.parse(mediaType)
			}, new RepeatedParameterError(['charset', 'Schema']))
		})
	})

	describe('parses media type with parameter processing', () => {
		it('processes parameters', () => {
			let mediaType = 'application/vnd.company.content; version=1; date=2032-04-17'
			mediaType = MediaType.parse(mediaType, (parameter, value) => {
				switch (parameter) {
					case 'version':
						return Number.parseInt(value)
					case 'date':
						return Date.parse(value)
					default:
						return null;
				}
			})

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: null,
				parameters: {
					version: 1,
					date: Date.parse('2032-04-17')
				}
			})
		})

		it('ignores parameters when parameter processing does not return a value', () => {
			let mediaType = 'application/vnd.company.content; version=1; date=2032-04-17'
			mediaType = MediaType.parse(mediaType, (parameter, value) => {
				if (parameter === 'version') {
					return Number.parseInt(value)
				}
			})

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: null,
				parameters: {
					version: 1
				}
			})
		})

		it('fails with repeated parameters', () => {
			const mediaType = 'application/json; ' +
				'charset=utf-8; ' +
				'schema=HAL; ' +
				'CharSet=utf-8; ' +
				'schema=HAL'

			assert.throws(() => {
				MediaType.parse(mediaType, (parameter, value) =>
					value.toLowerCase())
			}, new RepeatedParameterError(['CharSet', 'schema']))
		})

		it('ignores repeated parameters when parameter processing does not return a value', () => {
			let mediaType = 'application/vnd.company.content; ' +
				'date=today; ' +
				'version=1; ' +
				'date=2032-04-17'

			mediaType = MediaType.parse(mediaType, (parameter, value) => {
				if (parameter === 'version') {
					return Number.parseInt(value)
				}
			})

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: null,
				parameters: {
					version: 1
				}
			})
		})
	})

	describe('formats media type', () => {
		it('with all properties', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content+format; ' +
				'param1=value1; param2=value2')
		})

		it('without suffix', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content; param1=value1; param2=value2')
		})

		it('without parameters', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format'
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content+format')
		})

		it('with minimal properties', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content'
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content')
		})

		it('with wildcard subtype', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: '*',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert.equal(mediaType.formatted,
				'application/*+format; ' +
				'param1=value1; param2=value2')
		})

		it('wildcard', () => {
			const mediaType = new MediaType()
			assert.equal(mediaType.formatted,
				'*/*')
		})
	})

	describe('checks media type equality', () => {
		it('verifies with same media type', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert(mediaType1.equals(mediaType2))
			assert(mediaType2.equals(mediaType1))
		})

		it('verifies with same media type without parameters', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format'
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format'
			})

			assert(mediaType1.equals(mediaType2))
			assert(mediaType2.equals(mediaType1))
		})

		it('verifies with same media type with parameters in different case', () => {
			const mediaType1 = new MediaType({
				subtype: 'vnd.company.content',
				parameters: {
					Version: '2',
					charset: 'utf-8'
				}
			})

			const mediaType2 = new MediaType({
				subtype: 'vnd.company.content',
				parameters: {
					VERSION: '2',
					CharSet: 'utf-8'
				}
			})

			assert(mediaType1.equals(mediaType2))
			assert(mediaType2.equals(mediaType1))
		})

		it('does not verify with a different type', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'program',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})

		it('does not verify with a different subtype', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.corporation.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})

		it('does not verify with a different suffix', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'another-format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})

		it('does not verify with different parameter count', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value2',
					param2: 'value2',
					param3: 'value3'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})

		it('does not verify with different parameters', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param7: 'value7',
					param2: 'value2'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})

		it('does not verify with different parameter values', () => {
			const mediaType1 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})

			const mediaType2 = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value7'
				}
			})

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType2.equals(mediaType1) === false)
		})
	})

	describe('checks media type equality with parameter processing', () => {
		it('verifies with equal processed values', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content; charset=utf-8; version=2')

			const compareParameters = (parameter, value1, value2) => {
				return value1.toLowerCase() === value2.toLowerCase()
			}

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType1.equals(mediaType2, compareParameters))
			assert(mediaType2.equals(mediaType1, compareParameters))
		})

		it('does not verify with unequal processed values', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=ASCII')
			const mediaType2 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')

			const compareParameters = (parameter, value1, value2) => {
				return value1.toUpperCase() === value2.toUpperCase()
			}

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType1.equals(mediaType2, compareParameters) === false)
			assert(mediaType2.equals(mediaType1, compareParameters) === false)
		})

		it('does not verify with equal values but unequal processed values', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')

			const compareParameters = (parameter, value1, value2) => {
				return value1.toUpperCase() === value2
			}

			assert(mediaType1.equals(mediaType2))
			assert(mediaType1.equals(mediaType2, compareParameters) === false)
			assert(mediaType2.equals(mediaType1, compareParameters) === false)
		})

		it('does not verify with different parameters', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content; charset=utf-8; include=other-content; compression=zip')

			const compareParameters = (parameter, value1, value2) => {
				return value1 === value2
			}

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType1.equals(mediaType2, compareParameters) === false)
			assert(mediaType2.equals(mediaType1, compareParameters) === false)
		})

		it('verifies with equal implicitly compared parameters', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; charset=utf-8; version=2')
			const mediaType2 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')

			const compareParameters = (parameter, value1, value2) => {
				if (parameter === 'version') {
					return value1 === value2
				}
				// charset parameter values are implicitly compared with (===)
			}

			assert(mediaType1.equals(mediaType2))
			assert(mediaType1.equals(mediaType2, compareParameters))
			assert(mediaType2.equals(mediaType1, compareParameters))
		})

		it('does not verify with unequal implicitly compared parameters', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content; charset=utf-8; version=2')

			const compareParameters = (parameter, value1, value2) => {
				if (parameter === 'version') {
					return value1 === value2
				}
				// charset parameter values are implicitly compared with (===)
			}

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType1.equals(mediaType2, compareParameters) === false)
			assert(mediaType2.equals(mediaType1, compareParameters) === false)
		})

		it('verifies without parameters', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content')
			const mediaType2 = MediaType.parse('application/vnd.company.content')

			const compareParameters = (parameter, value1, value2) => {
				return value1.toUpperCase() === value2.toUpperCase()
			}

			assert(mediaType1.equals(mediaType2))
			assert(mediaType1.equals(mediaType2, compareParameters))
			assert(mediaType2.equals(mediaType1, compareParameters))
		})

		it('uses undefined as comparator argument when parameter is absent', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content; version=2; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content; charset=utf-8; include=other-content; compression=zip')

			const compareParameters = (parameter, value1, value2) => {
				switch (parameter) {
					// appears in both media types
					case 'charset':
						return value1 === value2
					// appears in mediaType1
					case 'version':
						return value1 !== undefined
							&& value2 === undefined
					// appear in mediaTyp22
					case 'include':
					case 'compression':
						return value1 === undefined
							&& value2 !== undefined
					// unknown parameter
					default:
						assert.fail()
				}
			}

			assert(mediaType1.equals(mediaType2) === false)
			assert(mediaType1.equals(mediaType2, compareParameters))
		})
	})

	describe('checks media type match', () => {
		it('verifies with wildcard type', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content+format; version=2')
			const mediaType2 = MediaType.parse('*/*')

			assert(mediaType1.matches(mediaType2))
			assert(mediaType2.matches(mediaType1))
		})

		it('verifies with wildcard subtype', () => {
			const mediaType1 = MediaType.parse('application/*')
			const mediaType2 = MediaType.parse('application/json')

			assert(mediaType1.matches(mediaType2))
			assert(mediaType2.matches(mediaType1))
		})

		it('does not verify with wildcard subtype and parameters', () => {
			const mediaType1 = MediaType.parse('application/*; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/json; charset=utf-8')

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType2.matches(mediaType1) === false)
		})

		it('verifies with wildcard subtype and different parameter values', () => {
			const mediaType1 = MediaType.parse('application/*; charset=utf-8')
			const mediaType2 = MediaType.parse('application/json; charset=utf-8')

			assert(mediaType1.matches(mediaType2))
			assert(mediaType2.matches(mediaType1))
		})

		it('does not verify with wildcard subtype and different parameters', () => {
			const mediaType1 = MediaType.parse('application/*; charset=utf-8')
			const mediaType2 = MediaType.parse('application/json; charset=utf-8; encoding=zip')

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType2.matches(mediaType1) === false)
		})

		it('verifies with same media type', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content+format; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=utf-8')

			assert(mediaType1.matches(mediaType2))
			assert(mediaType2.matches(mediaType1))
		})
	})

	describe('checks media type match with parameter processing', () => {
		it('verifies with wildcard subtype and equal processed values', () => {
			const mediaType1 = MediaType.parse('application/*; version=1; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=UTF-8; version=1')

			const matchParameters = (parameter, value1, value2) =>
				value1.toLowerCase() === value2.toLowerCase()

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType1.matches(mediaType2, matchParameters))
			assert(mediaType2.matches(mediaType1, matchParameters))
		})

		it('does not verify with wildcard subtype and unequal processed values', () => {
			const mediaType1 = MediaType.parse('application/*; version=1; charset=ASCII')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=UTF-8; version=1')

			const matchParameters = (parameter, value1, value2) =>
				value1.toLowerCase() === value2.toLowerCase()

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType1.matches(mediaType2, matchParameters) === false)
			assert(mediaType2.matches(mediaType1, matchParameters) === false)
		})

		it('does not verify with wildcard subtype and equal values and unequal processed values', () => {
			const mediaType1 = MediaType.parse('application/*; version=1; charset=utf-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=utf-8; version=1')

			const matchParameters = (parameter, value1, value2) =>
				value1 === value2.toUpperCase()

			assert(mediaType1.matches(mediaType2))
			assert(mediaType1.matches(mediaType2, matchParameters) === false)
			assert(mediaType2.matches(mediaType1, matchParameters) === false)
		})

		it('verifies with wildcard subtype and equal implicitly processed values', () => {
			const mediaType1 = MediaType.parse('application/*; version=1; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=utf-8; version=1')

			const matchParameters = (parameter, value1, value2) => {
				if (parameter === 'charset') {
					return value1.toUpperCase() === value2.toUpperCase()
				}
				// version parameter values are implicitly compared with (===)
			}

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType1.matches(mediaType2, matchParameters))
			assert(mediaType2.matches(mediaType1, matchParameters))
		})

		it('does not verify with wildcard subtype and unequal implicitly processed values', () => {
			const mediaType1 = MediaType.parse('application/*; version=1; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=utf-8; version=2')

			const matchParameters = (parameter, value1, value2) => {
				if (parameter === 'charset') {
					return value1 === value2
				}
				// version parameter values are implicitly compared with (===)
			}

			assert(mediaType1.matches(mediaType2) === false)
			assert(mediaType1.matches(mediaType2, matchParameters) === false)
			assert(mediaType2.matches(mediaType1, matchParameters) === false)
		})

		it('verifies with wildcard subtype without parameters', () => {
			const mediaType1 = MediaType.parse('application/*')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format')

			const matchParameters = (parameter, value1, value2) =>
				value1 === value2

			assert(mediaType1.matches(mediaType2))
			assert(mediaType1.matches(mediaType2, matchParameters))
			assert(mediaType2.matches(mediaType1, matchParameters))
		})

		it('verifies with same media type and equal processed values', () => {
			const mediaType1 = MediaType.parse('application/vnd.company.content+format; charset=UTF-8')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format; charset=utf-8')

			const matchParameters = (parameter, value1, value2) =>
				value1.toLowerCase() === value2.toLowerCase()

			assert(mediaType1.matches(mediaType2, matchParameters))
			assert(mediaType2.matches(mediaType1, matchParameters))
		})

		it('uses undefined as comparator argument when parameter is absent', () => {
			const mediaType1 = MediaType.parse('application/*; version=1')
			const mediaType2 = MediaType.parse('application/vnd.company.content+format')

			const matchParameters = (parameter, value1, value2) => {
				assert.equal(value2, undefined)
			}

			assert(mediaType1.matches(mediaType2, matchParameters) === false)
		})
	})
})
