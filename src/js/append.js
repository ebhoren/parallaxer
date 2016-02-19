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