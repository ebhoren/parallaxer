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