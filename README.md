## HTTP Media Type

A utility library for processing HTTP and MIME media types.

## Key features
* Parse and format media types according to [RFC 6838][RFC 6838]

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

... as well as with additional parameter processing
```javascript
const mediaType = MediaType.parse('application/vnd.company.media+format; version=1',
	(parameter, value) => {
		if (parameter === 'version') {
			return Number.parseInt(value)
		}
	})
```

When the optional parameter processing callback is not specified, all
parsed parameter values are stored as strings.

When the callback does not return any value, the corresponding parameter
will be absent from the parsed media type instance.

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
Two media types are considered equal when all of their properties and
parameters are equal.

## License
[MIT](LICENSE.md)

[RFC 6838]: (https://tools.ietf.org/html/rfc6838)
