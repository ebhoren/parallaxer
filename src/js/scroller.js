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