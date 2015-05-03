var baboon = require("luminance")(require("baboon-image"))
var filter = require("ndarray-pack")([[0, 1, 0],
                                      [1, -4, 1],
                                      [0, 1, 0]])

require("../convolve.js")(baboon, filter)

var ops = require("ndarray-ops")
function rescale(img) {
  var lo = ops.inf(img)
    , hi = ops.sup(img)
  return ops.mulseq(ops.addseq(img, lo), 255.0/(hi-lo))
}

require('ndarray-imshow')(rescale(baboon), {gray: true})
