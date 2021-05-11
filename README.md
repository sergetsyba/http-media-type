## HTTP Media Type

A utility library for processing HTTP and MIME media types.

## Key features
* Parse and format media types according to [RFC 7231][RFC 7231], [RFC 6838][RFC 6838].
* Compare for equality and compatibility with other media types.
* Custom process media type parameters in parsing and comparison.

## Quick guide
### Instantiating

A new media type instance can be created either with separate arguments
```javascript
const mediaType = new MediaType('text', 'plain')
// text/plain

const mediaType = new MediaType('text')
// text/*

const mediaType = new MediaType()
// */*

const mediaType = new MediaType('text', 'plain', {
	charset: 'utf-8'
})
// text/plain; charset=utf-8
```

... or with a single combined argument.
```javascript
const mediaType = new MediaType({
	type: 'text',
	subtype: 'plain'
})
// text/plain

const mediaType = new MediaType({
	type: 'application',
	subtype: 'vnd.company.media',
	suffix: 'format',
	parameters: {
		version: 1
	}
})
// application/vnd.company.media+format; version=1
```

### Parsing
A new media type instance can be parsed from a string
```javascript
const mediaType = MediaType.parse('application/vnd.company.media+format; version=1')
```

... and with additional parameter processing
```javascript
const mediaType = MediaType.parse('application/vnd.company.media+format; version=1; embedded=other-content; q=0.9',
	(parameter, value) => {
		switch (parameter) {
			case 'version':
				// convert 'version' to int
				return Number.parseInt(value)
			case 'q':
				// ignore 'q'
				return undefined
			default:
				// store other parmeter values as strings
				return value
		}
	})
```

### Formatting
The `formatted` property holds the textual representation of the media
type instance
```javascript
const mediaType = ('application', 'vnd.company.media', {
	version: 2,
	embedded: 'other-media'
})

console.log(mediaType.formatted)
// application/vnd.company.media; version=2; embedded=other-media
```

### Comparison
Media type instances can be compared for equality using the `equals`
method
```javascript
const mediaType1 = new MediaType('text', 'plain')
const mediaType2 = MediaType.parse('text/plain')
mediaType1.equals(mediaType2)
// true

const mediaType1 = new MediaType('text', 'plain')
const mediaType2 = MediaType.parse('text/plain; charset=utf-8')
mediaType1.equals(mediaType2)
// false

const mediaType1 = new MediaType('text', 'plain')
const mediaType2 = MediaType.parse('text/*')
mediaType1.equals(mediaType2)
// false
```

...and with custom parameter value comparison
```javascript
const mediaType1 = MediaType.parse('text/plain; charset=UTF-8; version=2')
const mediaType2 = MediaType.parse('text/plain; charset=utf-8')

mediaType1.equals(mediaType2)
// false

mediaType1.equals(mediaType2, (parameter, value1, value2) => {
	// ignore 'version' parameter
	// compare other parameters as case-insensitive
	return parameter === 'version'
		|| value1.toLowerCase() === value2.toLowerCase()
})
// true
```

### Comparison with wildcards
Media types can be compared to media types with wildcards (*) using the
`matches` method.

```javascript
const mediaType1 = MediaType.parse('text/plain; encoding=none')
const mediaType2 = MediaType.parse('text/*; charset=utf-8; encoding=zip')

mediaType1.equals(mediaType2)
// false

mediaType1.matches(mediaType2)
// true
```

An optional callback for custom parameter value comparison can be
specified, just like [in the `equals` method](#comparison).

## License
[MIT](LICENSE.md)

[RFC 7231]: (https://datatracker.ietf.org/doc/html/rfc7231)
[RFC 6838]: (https://datatracker.ietf.org/doc/html/rfc6838)
