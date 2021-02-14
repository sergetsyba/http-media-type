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
		it('with all arguments', () => {
			const mt = new MediaType('text', )
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

	describe('formats media type', () => {
		it('with all parameters', () => {
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

		it('with minimal parameters', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content'
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content')
		})
	})
})
