var lena = require("luminance")(require("lena"))
var filter = require("ndarray-pack")([[0, 1, 0],
                                      [1, -4, 1],
                                      [0, 1, 0]])

require("../convolve.js")(lena, filter)

var ops = require("ndarray-ops")
function rescale(img) {
  var lo = ops.inf(img)
    , hi = ops.sup(img)
  return ops.mulseq(ops.addseq(img, lo), 255.0/(hi-lo))
}

require("save-pixels")(rescale(lena), "png").pipe(process.stdout)

