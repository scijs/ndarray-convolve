"use strict"

var ndarray = require("ndarray")
var convolve = require("../convolve.js")
var cwise = require("cwise")
var test = require("tape")

var almostEqual = cwise({
  args: ["array", "array", "scalar", "scalar"],
  body: function(a, b, absoluteError, relativeError) {
    var d = Math.abs(a - b)
    if(d > absoluteError && d > relativeError * Math.min(Math.abs(a), Math.abs(b))) {
      return false
    }
  },
  post: function() {
    return true
  }
})

test("ndarray-convolve", function(t) {
  var a, b, ref
  
  a = ndarray([1, 2, 3, 5, 7, 11], [6])
  b = ndarray([1, -1], [2])
  ref = ndarray([1, 1, 2, 2, 4, -11], [6])
  convolve(a, b)
  t.ok(almostEqual(a, ref, 1e-6, 1e-6), "convolve(a, b) (1D, kernel size 2)")
  
  a = ndarray([1, 2, 3, 5, 7, 11], [6])
  b = ndarray([1, -2, 1], [3])
  ref = ndarray([0, 0, 1, 0, 2, -15], [6])
  convolve(a, b)
  t.ok(almostEqual(a, ref, 1e-6, 1e-6), "convolve(a, b) (1D, kernel size 3)")

  t.end()
})
