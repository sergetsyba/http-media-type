import MediaType from '../sources/media-type.js'
import {strict as assert} from 'assert'

describe('MediaType', () => {
	describe('creates media type with parameters', () => {
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
		it('full', () => {
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

		it('minimal', () => {
			const mediaType = new MediaType({
				type: 'application',
				subtype: 'vnd.company.content'
			})

			assert.equal(mediaType.formatted,
				'application/vnd.company.content')
		})
	})
})
