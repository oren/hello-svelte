var Login = (function () { 'use strict';

var template = (function () {
  var template = {
     methods: {
      login (email, password) {
        if(valid(email, password)) {
          login(email, password);
          return;
        }

        console.log("error validating");
      }
    }
  }

function valid() {
  return true;
}

function login() {
  console.log("make an http call");
}


  return template;
}());

function renderMainFragment ( root, component, target ) {
	var h1 = document.createElement( 'h1' );
	
	h1.appendChild( document.createTextNode( "Login" ) );
	
	target.appendChild( h1 )
	
	var text1 = document.createTextNode( "\n\nemail: " );
	target.appendChild( text1 );
	
	var input = document.createElement( 'input' );
	input.type = "text";
	input.name = "email";
	var input_updating = false;
	
	function inputChangeHandler () {
		input_updating = true;
		component.set({ email: input.value });
		input_updating = false;
	}
	
	input.addEventListener( 'input', inputChangeHandler, false );
	input.value = root.email;
	
	target.appendChild( input )
	
	var br = document.createElement( 'br' );
	
	target.appendChild( br )
	
	var text2 = document.createTextNode( "\npassword: " );
	target.appendChild( text2 );
	
	var input1 = document.createElement( 'input' );
	input1.type = "password";
	input1.name = "password";
	var input1_updating = false;
	
	function input1ChangeHandler () {
		input1_updating = true;
		component.set({ password: input1.value });
		input1_updating = false;
	}
	
	input1.addEventListener( 'change', input1ChangeHandler, false );
	input1.value = root.password;
	
	target.appendChild( input1 )
	
	var br1 = document.createElement( 'br' );
	
	target.appendChild( br1 )
	
	var text3 = document.createTextNode( "\n" );
	target.appendChild( text3 );
	
	var button = document.createElement( 'button' );
	function clickHandler ( event ) {
		var root = this.__svelte.root;
		
		component.login(root.email, root.password);
	}
	
	button.addEventListener( 'click', clickHandler, false );
	button.__svelte = {
		root: root
	};
	
	button.appendChild( document.createTextNode( "Login" ) );
	
	target.appendChild( button )

	return {
		update: function ( changed, root ) {
			if ( !input_updating ) input.value = root.email;
			
			if ( !input1_updating ) input1.value = root.password;
			
			button.__svelte.root = root;
		},

		teardown: function ( detach ) {
			if ( detach ) h1.parentNode.removeChild( h1 );
			
			if ( detach ) text1.parentNode.removeChild( text1 );
			
			input.removeEventListener( 'input', inputChangeHandler, false );
			if ( detach ) input.parentNode.removeChild( input );
			
			if ( detach ) br.parentNode.removeChild( br );
			
			if ( detach ) text2.parentNode.removeChild( text2 );
			
			input1.removeEventListener( 'change', input1ChangeHandler, false );
			if ( detach ) input1.parentNode.removeChild( input1 );
			
			if ( detach ) br1.parentNode.removeChild( br1 );
			
			if ( detach ) text3.parentNode.removeChild( text3 );
			
			button.removeEventListener( 'click', clickHandler, false );
			if ( detach ) button.parentNode.removeChild( button );
		}
	};
}

function Login ( options ) {
	var component = this;
	var state = options.data || {};

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

Login.prototype = template.methods;

return Login;

}());