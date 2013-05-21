"use strict"

var bits = require("bit-twiddle")
var ndarray = require("ndarray")
var ops = require("ndarray-ops")
var cops = require("ndarray-complex")
var fft = require("ndarray-fft")
var pool = require("typedarray-pool")
var cwise = require("cwise")

var conjmuleq = cwise({
  args: ["array", "array", "array", "array"],
  body: function(out_r, out_i, a_r, a_i) {
    var a = a_r
    var b = a_i
    var c = out_r
    var d = out_i
    var k1 = c * (a + b)
    out_r = k1 - b * (c + d)
    out_i = k1 + a * (d - c)
  }
})

function conv_impl(out_r, out_i, a_r, a_i, b_r, b_i, cor, wrap) {
  if(a_r.shape.length !== b_r.shape.length || out_r.shape.length !== a_r.shape.length) {
    throw new Error("Dimension mismatch")
  }
  var d = a_r.shape.length
    , nsize = 1
    , nstride = new Array(d)
    , nshape = new Array(d)
    , i
  
  if(wrap) {
    for(i=d-1; i>=0; --i) {
      nshape[i] = a_r.shape[i]
      nstride[i] = nsize
      nsize *= nshape[i]
    }  
  } else {
    for(i=d-1; i>=0; --i) {
      nshape[i] = bits.nextPow2(a_r.shape[i] + b_r.shape[i] - 1)
      nstride[i] = nsize
      nsize *= nshape[i]
    }
  }
  
  var x_t = pool.mallocDouble(nsize)
    , x = ndarray.ctor(x_t, nshape, nstride, 0)
  ops.assigns(x, 0)
  ops.assign(x.hi.apply(x, a_r.shape), a_r)
  
  var y_t = pool.mallocDouble(nsize)
    , y = ndarray.ctor(y_t, nshape, nstride, 0)
  ops.assigns(y, 0)
  if(a_i) {
    ops.assign(y.hi.apply(y, a_i.shape), a_i)
  }
  
  //FFT x/y
  fft(1, x, y)
  
  var u_t = pool.mallocDouble(nsize)
    , u = ndarray.ctor(u_t, nshape, nstride, 0)
  ops.assigns(u, 0)
  ops.assign(u.hi.apply(u, b_r.shape), b_r)
  
  var v_t = pool.mallocDouble(nsize)
    , v = ndarray.ctor(v_t, nshape, nstride, 0)
  ops.assigns(v, 0)
  if(b_i) {
    ops.assign(v.hi.apply(y, b_i.shape), b_i)
  }
  
  fft(1, u, v)
  
  if(cor) {
    conjmuleq(x, y, u, v)
  } else {
    cops.muleq(x, y, u, v)
  }
  
  fft(-1, x, y)
  
  var out_shape = new Array(d)
    , need_zero_fill = false
  for(i=0; i<d; ++i) {
    if(out_r.shape[i] > nshape[i]) {
      need_zero_fill = true
    }
    out_shape[i] = Math.min(out_r.shape[i], nshape[i])
  }
  
  if(need_zero_fill) {
    ops.assign(out_r, 0.0)
  }
  ops.assign(out_r.hi.apply(out_r, out_shape), x.hi.apply(x, out_shape))
  if(out_i) {
    if(need_zero_fill) {
      ops.assign(out_i, 0.0)
    }
    ops.assign(out_i.hi.apply(out_i, out_shape), y.hi.apply(y, out_shape))
  }

  pool.freeDouble(x_t)
  pool.freeDouble(y_t)
  pool.freeDouble(u_t)
  pool.freeDouble(v_t)
}

module.exports = function convolve(a, b, c, d, e, f) {
  if(arguments.length === 2) {
    conv_impl(a, undefined, a, undefined, b, undefined, false, false)
  } else if(arguments.length === 3) {
    conv_impl(a, undefined, b, undefined, c, undefined, false, false)
  } else if(arguments.length === 4) {
    conv_impl(a, b, a, b, c, d, false, false)
  } else if(arguments.length === 6) {
    conv_impl(a, b, c, d, e, f, false, false)
  } else {
    throw new Error("Invalid arguments for convolve")
  }
  return a
}

module.exports.wrap = function convolve_wrap(a, b, c, d, e, f) {
  if(arguments.length === 2) {
    conv_impl(a, undefined, a, undefined, b, undefined, false, true)
  } else if(arguments.length === 3) {
    conv_impl(a, undefined, b, undefined, c, undefined, false, true)
  } else if(arguments.length === 4) {
    conv_impl(a, b, a, b, c, d, false, true)
  } else if(arguments.length === 6) {
    conv_impl(a, b, c, d, e, f, false, true)
  } else {
    throw new Error("Invalid arguments for convolve")
  }
  return a
}

module.exports.correlate = function correlate(a, b, c, d, e, f) {
  if(arguments.length === 2) {
    conv_impl(a, undefined, a, undefined, b, undefined, true, false)
  } else if(arguments.length === 3) {
    conv_impl(a, undefined, b, undefined, c, undefined, true, false)
  } else if(arguments.length === 4) {
    conv_impl(a, b, a, b, c, d, true, false)
  } else if(arguments.length === 6) {
    conv_impl(a, b, c, d, e, f, true, false)
  } else {
    throw new Error("Invalid arguments for correlate")
  }
  return a
}

module.exports.correlate.wrap = function correlate_wrap(a, b, c, d, e, f) {
  if(arguments.length === 2) {
    conv_impl(a, undefined, a, undefined, b, undefined, true, true)
  } else if(arguments.length === 3) {
    conv_impl(a, undefined, b, undefined, c, undefined, true, true)
  } else if(arguments.length === 4) {
    conv_impl(a, b, a, b, c, d, true, true)
  } else if(arguments.length === 6) {
    conv_impl(a, b, c, d, e, f, true, true)
  } else {
    throw new Error("Invalid arguments for correlate")
  }
  return a
}
