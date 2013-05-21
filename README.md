ndarray-convolve
================
[Convolutions](http://en.wikipedia.org/wiki/Convolution) and [cross correlations](http://en.wikipedia.org/wiki/Cross-correlation) on [ndarrays](https://github.com/mikolalysenko/ndarray).

## Example

```javascript
//Read in test image
var lena = require("luminance")(require("lena"))

//Generate a 5-point Laplace filter
var filter = require("ndarray-pack")([[0, 1, 0],
                                      [1, -4, 1],
                                      [0, 1, 0]])

//Convolve them together
require("ndarray-convolve")(lena, filter)
```

This produces the following array:

<img src="https://raw.github.com/mikolalysenko/ndarray-convolve/master/example/lena_lap.png">


## Install

    npm install ndarray-convolve
    
## API

```javascript
var convolve = require("ndarray-convolve")
```

### `convolve( ... )`
Performs a convolution between two images with zero boundary conditions.  There are four ways you can call this function:

#### `convolve(a, b)`
Convolves `a` and `b` storing the result in `a`

#### `convolve(out, a, b)`
Convolves `a` and `b` storing the result in `out`

#### `convolve(a_r, a_i, b_r, b_i)`
Convolves two complex arrays storing the result in `a_r, a_i`

#### `convolve(out_r, out_i, a_r, a_i, b_r, b_i)`
Convolves two complex array storing the result in `out_r, out_i`


### `convolve.wrap( ... )`
Convolves two arrays with periodic boundary conditions.  Same convention as `convolve`

### `convolve.correlate( ... )`
Cross correlates two arrays with zero boundary conditions.  Same convention.

### `convolve.correlate.wrap( ... )`
Cross correlates two arrays with wrapped boundary conditions.  Same convention again.

## Credits
(c) 2013 Mikola Lysenko. MIT License