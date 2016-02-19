(function(){
function Events(target){
  var events = {}, empty = [];
  target = target || this
  /**
   *  On: listen to events
   */
  target.on = function(type, func, ctx){
    (events[type] = events[type] || []).push([func, ctx])
  }
  /**
   *  Off: stop listening to event / specific callback
   */
  target.off = function(type, func){
    type || (events = {})
    var list = events[type] || empty,
        i = list.length = func ? list.length : 0;
    while(i--) func == list[i][0] && list.splice(i,1)
  }
  /** 
   * Emit: send event, callbacks will be triggered
   */
  target.emit = function(type){
    var list = events[type] || empty, i=0, j;
    while(j=list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
  };
};
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
/*global window*/

(function () {
    "use strict";

    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'],
        x;

    for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame  = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            window.clearTimeout(id);
        };
    }
}());
var VirtualScroll = (function(document) {

	var vs = {};

	var numListeners, listeners = [], initialized = false;

	var touchStartX, touchStartY;

	// [ These settings can be customized with the options() function below ]
	// Mutiply the touch action by two making the scroll a bit faster than finger movement
	var touchMult = 2;
	// Firefox on Windows needs a boost, since scrolling is very slow
	var firefoxMult = 15;
	// How many pixels to move with each key press
	var keyStep = 120;
	// General multiplier for all mousehweel including FF
	var mouseMult = 1;

	var bodyTouchAction;

	var hasWheelEvent = 'onwheel' in document;
	var hasMouseWheelEvent = 'onmousewheel' in document;
	var hasTouch = 'ontouchstart' in document;
	var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
	var hasPointer = !!window.navigator.msPointerEnabled;
	var hasKeyDown = 'onkeydown' in document;

	var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

	var event = {
		y: 0,
		x: 0,
		deltaX: 0,
		deltaY: 0,
		originalEvent: null
	};

	vs.on = function(f) {
		if(!initialized) {
			initListeners();
		} 

		listeners.push(f);
		numListeners = listeners.length;
	};

	vs.options = function(opt) {
		keyStep = opt.keyStep || 120;
		firefoxMult = opt.firefoxMult || 15;
		touchMult = opt.touchMult || 2;
		mouseMult = opt.mouseMult || 1;
	};

	vs.off = function(f) {
		listeners.splice(f, 1);
		numListeners = listeners.length;
		if(numListeners <= 0) {
			destroyListeners();
		}
	};

	var notify = function(e) {
		event.x += event.deltaX;
		event.y += event.deltaY;
		event.originalEvent = e;

		for(var i = 0; i < numListeners; i++) {
			listeners[i](event);
		}
	};

	var onWheel = function(e) {
		// In Chrome and in Firefox (at least the new one)
		event.deltaX = e.wheelDeltaY || e.deltaY * -1;
		event.deltaY = e.wheelDeltaX || e.deltaX * -1;

		// for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad 
		// real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
		if(isFirefox && e.deltaMode === 1) {
			event.deltaX *= firefoxMult;
			event.deltaY *= firefoxMult;
		} 

		event.deltaX *= mouseMult;
		event.deltaY *= mouseMult;

		e.preventDefault();
		notify(e);
	};

	var onMouseWheel = function(e) {

		// In Safari, IE and in Chrome if 'wheel' isn't defined
		event.deltaX = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;
		event.deltaY = (e.wheelDeltaX) ? e.wheelDeltaX : 0;

		notify(e);	
	};

	var onTouchStart = function(e) {
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		touchStartX = t.pageX;	
		touchStartY = t.pageY;
	};

	var onTouchMove = function(e) {
		// e.preventDefault(); // < This needs to be managed externally
		var t = (e.targetTouches) ? e.targetTouches[0] : e;

		event.deltaX = (t.pageX - touchStartX) * touchMult;
		event.deltaY = (t.pageY - touchStartY) * touchMult;
		
		touchStartX = t.pageX;
		touchStartY = t.pageY;

		notify(e);
	};

	var onKeyDown = function(e) {
		// 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
		event.deltaX = event.deltaY = 0;
		switch(e.keyCode) {
			case 37:
				event.deltaX = keyStep;
				break;
			case 39:
				event.deltaX = -keyStep;
				break;
			case 38:
				event.deltaY = keyStep;
				break;
			case 40:
				event.deltaY = -keyStep;
				break;
		}

		notify(e);
	};

	var initListeners = function() {

		if(hasWheelEvent) {
			document.addEventListener("wheel", onWheel);
		}

		if(hasMouseWheelEvent) {
			document.addEventListener("mousewheel", onMouseWheel);
		}

		if(hasTouch) {
			document.addEventListener("touchstart", onTouchStart);
			document.addEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			bodyTouchAction = document.body.style.msTouchAction;
			document.body.style.msTouchAction = "none";
			document.addEventListener("MSPointerDown", onTouchStart, true);
			document.addEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) {
			document.addEventListener("keydown", onKeyDown);
		}

		initialized = true;
	};

	var destroyListeners = function() {
		if(hasWheelEvent) {
			document.removeEventListener("wheel", onWheel);
		}

		if(hasMouseWheelEvent) {
			document.removeEventListener("mousewheel", onMouseWheel);
		}

		if(hasTouch) {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			document.body.style.msTouchAction = bodyTouchAction;
			document.removeEventListener("MSPointerDown", onTouchStart, true);
			document.removeEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) {
			document.removeEventListener("keydown", onKeyDown);
		}

		initialized = false;
	};

	return vs;
})(document);
function Background(el, items, options) {

	var _this 			= this,
		_el 			= el,
		_canvas 		= document.createElement('canvas'),
		_context 		= _canvas.getContext('2d'),

		_started 		= false,
		_queue 			= [],
		_images 		= [],
		_length 		= 0,

		_width			= 0,
		_height 		= 0,
		_itemWidth 		= 0,

		_currentX 		= 0;



	// private methods
	function _init() {

		for(var i = 0, item, bgItem; i<items.length; i++) {

			item 		= items[i];
			bgItem 		= new BackgroundItem( i, item.getAttribute('data-img-src') );

			_queue.push( bgItem );
		}

		el.appendChild( _canvas );
	}
	function _itemLoaded( bgItem ) {

		_queue.shift();
		_length = _images.push( bgItem );

		// stop here if component is stopped
		if( _started !== true ) return;

		// load next queue item
		if( _queue.length > 0 ) _queue[0].load( _itemLoaded );
		else _this.emit('loaded');
	}
	function _drawItem(item, index) {

		var c 	= MathUtils.cover(item.width, item.height, _width, _height),
			ax 	= index * _itemWidth + _currentX,
			aw 	= _itemWidth,
			r   = c.sw / c.dw;


		// if item x is out of viewport
		if( ax >= _width ) {
			return;
		}

		// set boundaries
		if( ax < 0 ) {
			aw += ax;
			ax  = 0;
		}
		else if( ax + aw >= _width ) {
			aw = _width - ax;
		}

		// apply mask
		c.sx += (ax * r);
		c.sw  = (aw * r);
		c.dx  = ax;
		c.dw  = aw;

		// draw image
		_context.drawImage(item, c.sx, c.sy, c.sw, c.sh, c.dx, c.dy, c.dw, c.dh);
	}





	// public methods
	function start() {

		if( _started === true ) return;

        // set status as started
		_started = true;

		// start loading queue
		if( _queue.length > 0 ) _queue[0].load( _itemLoaded );
	}

	function stop() {

		if( _started !== true ) return;
		_started = false;
	}

	function resize(width, height) {

		_width 			= width;
		_height 		= height;
		_itemWidth 		= Math.ceil( _width / options.numItemsPerSlides );

		_canvas.width 	= _width;
		_canvas.height 	= _height;

		_context.clearRect(0, 0, _width, _height);
	}

	function scrollTo(x) {

		_currentX = x;
		_context.clearRect(0, 0, _width, _height);

		var i = Math.floor( Math.abs(_currentX / _itemWidth) ),
			n = Math.min( i + options.numItemsPerSlides + 1, _length ),
			item;

		for(; i<n; i++)
		{
			item = _images[i];
			_drawItem(item.getCanvas(), i);
		}
	}



	// event system
	new Events(this);


	// initializations
	_init();

	


	// public methods
	this.start 				= start;
	this.stop 				= stop;
	this.resize 			= resize;
	this.scrollTo 			= scrollTo;
}


function BackgroundItem(index, src) {

	// public properties
	this.index 	= index;
	this.src 	= src;


	// private properties
	var _this 		= this,
		_img 		= new Image(),

		_canvas, _context, _onLoadCallback;






	// private methods
	function _init() {

		_img 		= new Image();
		_img.onload = _imageLoaded;
	}
	function _imageLoaded() {

		_canvas 	= document.createElement('canvas');
		_context 	= _canvas.getContext('2d');

		setTimeout(function() {

			_canvas.width 	= _img.width;
			_canvas.height 	= _img.height;

			_context.drawImage(_img, 0, 0);
			_onLoadCallback( _this );

		}, 100);
	}




	// public methods
	function load( callback ) {

		_onLoadCallback = callback;
		_img.src 		= _this.src;
	}





	// initialization
	_init();



	// getter - setter
	this.getCanvas = function() { return _canvas; };


	// public definitions
	this.load = load;
}
function Scroller(el, options) {

	var _this 			= this,
		_el 			= el,
		_items 			= _el.querySelectorAll('.parallaxer--scroller--item'),
		_length 		= _items.length,
		_ease 			= options.ease,

		_started 		= false,
		_frameID 		= null,
		_transform 		= null,
		_sectionWidth 	= 0,
		_targetX 		= 0,
		_currentX 		= 0;




	// private methods
	function _init() {

		// get prefixed property name
		_transform = _getSupportedPropertyName(["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"]);

		// setup scroller width
		_el.style.width = _length / options.numItemsPerSlides * 100 + '%';
	}
	function _getSupportedPropertyName(properties) {
	    for (var i = 0; i < properties.length; i++) {
	        if (typeof document.body.style[properties[i]] != "undefined") {
	            return properties[i];
	        }
	    }
	    return null;
	}
	function _preventDefault(e) { e.preventDefault(); }
	function _updateTarget(e) {
		// Accumulate delta value on each scroll event
        _targetX += e.deltaX;

        // Clamp the value so it doesn't go too far left or right
        // The value needs to be between 0 and -_sectionWidth
        if( _targetX < -_sectionWidth ) _targetX = -_sectionWidth;
        else if( _targetX > 0 ) _targetX = 0;
	}
	function _scroll() {

		if( _started !== true ) return;

        // Make sure this works across different browsers (use the shim or something)
       	_frameID = window.requestAnimationFrame( _scroll );

        // Uncomment this line to scroll horizontally
        _currentX += (_targetX - _currentX) * _ease;

        // Update target position
        _el.style[ _transform ] = "translate("+_currentX+"px, 0px)";

        // Dispatch event
        _this.emit('move', _currentX);
    }









	// public methods
	function resize( width ) {

		// Check how much we can scroll. 
		// This value is the scroller's width minus container's width
    	_sectionWidth = _el.offsetWidth - width;

    	// Set arrows to move one item per keystroke
    	VirtualScroll.options({
    		keyStep: Math.ceil(width / options.numItemsPerSlides),
    		firefoxMult: 120
    	});

    	// Recalculate target
    	_updateTarget({deltaX: 0});
	}
	function scrollTo(x) {
		
		// set target
		_targetX = x;

		// Clamp the value so it doesn't go too far left or right
        // The value needs to be between 0 and -_sectionWidth
        if( _targetX < -_sectionWidth ) _targetX = -_sectionWidth;
        else if( _targetX > 0 ) _targetX = 0;
	}

	function start() {

		if( _started === true ) return;

    	// Use this if you want to lock the elastic overscroll on mobile
    	document.addEventListener('touchmove', _preventDefault);

    	// Add virtual scroll listener
        VirtualScroll.on( _updateTarget );

        // Set status as started
		_started = true;

        // Request animation frame
        _frameID = window.requestAnimationFrame( _scroll );
	}
	function stop() {

		if( _started !== true ) return;

		// Stop and cancel animation frame
		if( _frameID ) {
			window.cancelAnimationFrame( _frameID );
			_frameID = null;
		}

		// Set status as stopped
		_started = false;

		// Unlock the elastic overscroll on mobile
		document.removeEventListener('touchmove', _preventDefault);

		// Remove virtual scroll listener
		VirtualScroll.off( _updateTarget );
	}

	function reset() {

		// reset position
		_targetX = _currentX = 0;

		// Update target position
        _el.style[ _transform ] = "translate("+_currentX+"px, 0px)";
	}
	function destroy() {

		if( _started === true ) stop();

		_el 			= null;
		_items 			= null;
		_length 		= null;
		_ease 			= null;

		_started 		= null;
		_frameID 		= null;
		_transform 		= null;
		_sectionWidth 	= null;
		_targetX 		= null;
		_currentX 		= null;

		_this 			= null;
	}



	// event system
	new Events(this);


	// initialization
	_init();



	// getter - setter
	this.getCurrentX 	= function() { return _currentX; };
	this.getItems 		= function() { return _items; };


	// public definitions
	this.destroy 	= destroy;
	this.resize 	= resize;
	this.scrollTo 	= scrollTo;
	this.start 		= start;
	this.stop 		= stop;
	this.reset 		= reset;
}
function Parallaxer(el, options) {

	var _this 		= this,
		_defaults 	= {
			'numItemsPerSlides': 3,
			'ease': 0.1
		},
		_options 	= Object.assign({}, _defaults, options),
		_started 	= false,
		_width 		= 0,
		_height 	= 0,

		_background, _scroller;




	// private methods
	function _init() {

		el.classList.add('parallaxer');

		_scroller 	= new Scroller( el.querySelector('#parallaxer-scroller'), _options );
		_background = new Background( el.querySelector('#parallaxer-bg'), _scroller.getItems(), _options );

		_scroller.on('move', _background.scrollTo);
	}


	// public methods
	function scrollTo() {}
	function start() {

		if( _started === true ) return;

		_started = true;
		_width 	 = el.clientWidth;
		_height  = el.clientHeight;

		_scroller.resize( _width );
		_background.resize( _width, _height );

		_scroller.start();
		_background.start();
	}
	function stop() {

		if( _started !== true ) return;
		_started = false;

		_scroller.stop();
		_background.stop();
	}
	function reset() {}
	function destroy() {}





	// initialization
	_init();




	// public definitions
	this.scrollTo 	= scrollTo;
	this.start 		= start;
	this.stop 		= stop;
	this.reset 		= reset;
	this.destroy 	= destroy;
}
	if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Parallaxer;
        }
        exports.Parallaxer = Parallaxer;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('Parallaxer', (function() { return root.Parallaxer = Parallaxer; })() );
    } else {
        window.Parallaxer = Parallaxer;
    }

    return Parallaxer;
}).call(this);