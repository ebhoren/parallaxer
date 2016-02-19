var MathUtils = (function(){

	return {
		cover: function(srcWidth, srcHeight, targetWidth, targetHeight, offsetX, offsetY) {

		    // default offset is center
		    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
		    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

		    // keep bounds [0.0, 1.0]
		    if (offsetX < 0) {
		    	offsetX = 0;
		    }

		    if (offsetY < 0) {
		    	offsetY = 0;
		    }

		    if (offsetX > 1) {
		    	ffsetX = 1;
		    }

		    if (offsetY > 1) {
		    	offsetY = 1;
		    }

		    var iw = srcWidth,
		        ih = srcHeight,
		        r  = Math.min(targetWidth / iw, targetHeight / ih),
		        nw = iw * r,   // new prop. width
		        nh = ih * r,   // new prop. height
		        cx, cy, cw, ch, ar = 1;

		    // decide which gap to fill    
		    if (nw < targetWidth) {
		    	ar = targetWidth / nw;
		    }

		    if (nh < targetHeight) {
		    	ar = targetHeight / nh;
		    }

		    nw *= ar;
		    nh *= ar;

		    // calc source rectangle
		    cw = iw / (nw / targetWidth);
		    ch = ih / (nh / targetHeight);

		    cx = (iw - cw) * offsetX;
		    cy = (ih - ch) * offsetY;

		    // make sure source rectangle is valid
		    if (cx < 0) {
		    	cx = 0;
		    }

		    if (cy < 0) {
		    	cy = 0;
		    }

		    if (cw > iw) {
		    	cw = iw;
		    }

		    if (ch > ih) {
		    	ch = ih;
		    }

		    return {
		    	ratio: ar,
		    	sx: cx, 
		    	sy: cy,
		    	sw: cw,
		    	sh: ch,
		    	dx: 0, 
		    	dy: 0, 
		    	dw: targetWidth,
		    	dh: targetHeight
		    };
		}
	};

})();