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