## HTTP Media Type

A utility library for processing HTTP and MIME media types.

## Key features
* Parse and format media types according to [RFC 6838][RFC 6838].
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
const mediaType = MediaType.parse('application/vnd.company.media+format; version=1',
	(parameter, value) => {
		if (parameter === 'version') {
			return Number.parseInt(value)
		}
	})
```

When the optional parameter processing callback is not specified, all
parsed parameter values are stored as strings. When the callback does
not return any value, the corresponding parameter will be absent from
the parsed media type instance.

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
const mediaType1 = MediaType.parse('text/plain; charset=UTF-8')
const mediaType2 = MediaType.parse('text/plain; charset=utf-8')

mediaType1.equals(mediaType2)
// false

mediaType1.equals(mediaType2, (parameter, value1, value2) =>
	value1.toLowerCase() === value2.toLowerCase())
// true
```

Two media types are considered equal when all of their properties and
parameters are equal.

An optional callback for custom parameter value comparison receives
parameter name as the first argument, parameter value in this media type
as the second argument, and parameter value in the specified media type
as the third argument respectively. When a parameter appears only in one
of the compared media types, this callback is called with `undefined`
as the corresponding argument. 


### Comparison with wildcards
Media types can be compared to media types with wildcards (*) using the
`matches` method.

```javascript
const mediaType1 = MediaType.parse('text/plain')
const mediaType2 = MediaType.parse('text/*')

mediaType1.equals(mediaType2)
// false

mediaType1.matches(mediaType2)
// true
```

An optional callback for custom parameter value comparison can be
specified, just like in the `equals` method.

Two media types are considered compatible (i.e. match), according to
the following rules

* wildcard media type (\*/\*) matches any media type;
* media type with wildcard subtype (type/\*) matches any media type 
  with the same type, suffix and parameters;
* media type without wildcards matches any media type (also without
  wildcards) when they are equal;


## License
[MIT](LICENSE.md)

[RFC 6838]: (https://tools.ietf.org/html/rfc6838)
