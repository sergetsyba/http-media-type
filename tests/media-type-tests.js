import MediaType from '../sources/media-type.js'
import {strict as assert} from 'assert'

describe('MediaType', () => {
	describe('creates media type', () => {
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
})
