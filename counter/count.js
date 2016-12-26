var count = (function () { 'use strict';

var template = (function () {
  return {
    data () {
      return {
        count: 0
      };
    }
  };
}());

function renderMainFragment ( root, component, target ) {
	var p = document.createElement( 'p' );
	
	p.appendChild( document.createTextNode( "Count: " ) );
	
	var text1 = document.createTextNode( root.count );
	p.appendChild( text1 );
	
	target.appendChild( p )
	
	var text2 = document.createTextNode( "\n" );
	target.appendChild( text2 );
	
	var button = document.createElement( 'button' );
	function clickHandler ( event ) {
		var root = this.__svelte.root;
		
		component.set({ count: root.count + 1 });
	}
	
	button.addEventListener( 'click', clickHandler, false );
	button.__svelte = {
		root: root
	};
	
	button.appendChild( document.createTextNode( "+1" ) );
	
	target.appendChild( button )

	return {
		update: function ( changed, root ) {
			text1.data = root.count;
			
			button.__svelte.root = root;
		},

		teardown: function ( detach ) {
			if ( detach ) p.parentNode.removeChild( p );
			
			if ( detach ) text2.parentNode.removeChild( text2 );
			
			button.removeEventListener( 'click', clickHandler, false );
			if ( detach ) button.parentNode.removeChild( button );
		}
	};
}

function count ( options ) {
	var component = this;
	var state = Object.assign( template.data(), options.data );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	var mainFragment = renderMainFragment( state, this, options.target );
}

return count;

}());