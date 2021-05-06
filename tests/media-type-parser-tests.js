import {strict as assert} from 'assert'
import {parseMediaType} from '../sources/media-type-parser.js'
import {ParseError} from '../sources/errors.js'

describe('parses media type', () => {
	it('with all properties', () => {
		const mediaType = parseMediaType('application/vnd.company.content+format; ' +
			'param1=value1; ' +
			'param2=value2')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'vnd.company.content',
			suffix: 'format',
			parameters: [{
				parameter: 'param1',
				value: 'value1'
			}, {
				parameter: 'param2',
				value: 'value2'
			}]
		})
	})

	it('without suffix', () => {
		const mediaType = parseMediaType('application/vnd.company.content; ' +
			'param1=value1; ' +
			'param2=value2')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'vnd.company.content',
			suffix: null,
			parameters: [{
				parameter: 'param1',
				value: 'value1'
			}, {
				parameter: 'param2',
				value: 'value2'
			}]
		})
	})

	it('without parameters', () => {
		const mediaType = parseMediaType('application/vnd.company.content+format')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'vnd.company.content',
			suffix: 'format',
			parameters: []
		})
	})

	it('with repeated parameters', () => {
		const mediaType = parseMediaType('application/json; ' +
			'param1=value1; ' +
			'param2=value2; ' +
			'param1=value3')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'json',
			suffix: null,
			parameters: [{
				parameter: 'param1',
				value: 'value1'
			}, {
				parameter: 'param2',
				value: 'value2'
			}, {
				parameter: 'param1',
				value: 'value3'
			}]
		})
	})

	it('with minimal properties', () => {
		const mediaType = parseMediaType('application/vnd.company.content')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'vnd.company.content',
			suffix: null,
			parameters: []
		})
	})

	it('wildcard', () => {
		const mediaType = parseMediaType('*/*')

		assert.deepEqual(mediaType, {
			type: '*',
			subtype: '*',
			suffix: null,
			parameters: []
		})
	})

	it('with wildcard subtype', () => {
		const mediaType = parseMediaType('application/*+format; ' +
			'param1=value1; ' +
			'param2=value2')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: '*',
			suffix: 'format',
			parameters: [{
				parameter: 'param1',
				value: 'value1'
			}, {
				parameter: 'param2',
				value: 'value2'
			}]
		})
	})

	it('with non-alphanumeric characters', () => {
		const mediaType = parseMediaType('application!#$&-^_/vnd.company.!#$&-^_content+format!#$&-^_;' +
			'param1=value1!#$&-^_;' +
			'param2=value2!#$&-^_')

		assert.deepEqual(mediaType, {
			type: 'application!#$&-^_',
			subtype: 'vnd.company.!#$&-^_content',
			suffix: 'format!#$&-^_',
			parameters: [{
				parameter: 'param1',
				value: 'value1!#$&-^_'
			}, {
				parameter: 'param2',
				value: 'value2!#$&-^_'
			}]
		})
	})

	it('with subtype with multiple plus signs', () => {
		const mediaType = parseMediaType('application/vnd.company+corporation.content+media+format')

		assert.deepEqual(mediaType, {
			type: 'application',
			subtype: 'vnd.company+corporation.content+media',
			suffix: 'format',
			parameters: []
		})
	})

	it('fails with subtype containing slashes', () => {
		const mediaType = 'application/vnd/company/content+format; param1=value1'
		assert.throws(() => {
			parseMediaType(mediaType)
		}, ParseError)
	})

	it('fails with type containing spaces', () => {
		const mediaType = 'appl icat ion/vnd.company.content+format; param1=value1'
		assert.throws(() => {
			parseMediaType(mediaType)
		}, ParseError)
	})

	it('fails with subtype containing spaces', () => {
		const mediaType = 'application/vnd company content+format; param1=value1'
		assert.throws(() => {
			parseMediaType(mediaType)
		}, ParseError)
	})
})
