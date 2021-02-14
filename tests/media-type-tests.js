import MediaType from '../sources/media-type.js'
import {strict as assert} from 'assert'

describe('MediaType', () => {
	describe('creates media from separate arguments', () => {
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

		it('without suffix', () => {
			const mediaType = MediaType.parse('application/vnd.company.content; ' +
				'param1=value1; ' +
				'param2=value2')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: null,
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})
		})

		it('without parameters', () => {
			const mediaType = MediaType.parse('application/vnd.company.content+format')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: 'format',
				parameters: {}
			})
		})

		it('with minimal properties', () => {
			const mediaType = MediaType.parse('application/vnd.company.content')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: 'vnd.company.content',
				suffix: null,
				parameters: {}
			})
		})

		it('with wildcard subtype', () => {
			const mediaType = MediaType.parse('application/*+format; ' +
				'param1=value1; ' +
				'param2=value2')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: 'application',
				subtype: '*',
				suffix: 'format',
				parameters: {
					param1: 'value1',
					param2: 'value2'
				}
			})
		})

		it('wildcard', () => {
			const mediaType = MediaType.parse('*/*')

			Object.setPrototypeOf(mediaType, Object.prototype)
			assert.deepEqual(mediaType, {
				type: '*',
				subtype: '*',
				suffix: null,
				parameters: {}
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
		it('verifies equality with same media type', () => {
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

			assert(mediaType1.isEqual(mediaType2))
		})

		it('verifies equality with same media type without parameters', () => {
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

			assert(mediaType1.isEqual(mediaType2))
		})

		it('does not verify equality with a different type', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})

		it('does not verify equality with a different subtype', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})

		it('does not verify equality with a different suffix', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})

		it('does not verify equality with different parameter count', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})

		it('does not verify equality with different parameters', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})

		it('does not verify equality with different parameter values', () => {
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

			assert(mediaType1.isEqual(mediaType2) === false)
		})
	})
})
