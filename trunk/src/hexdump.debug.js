//
// Hexdump.js
// Matt Mower <self@mattmower.com>
// 08-02-2011
// License: MIT
//
// None of the other JS hex dump libraries I could find
// seemed to work so I cobbled this one together.
//

var Hexdump = {
	
	to_hex: function( number ) {
		var r = number.toString(16);
		if( r.length < 2 ) {
			return "0" + r;
		} else {
			return r;
		}
	},
	
	dump_chunk: function( chunk ) {
		var dumped = "";
		
		for( var i = 0; i < 4; i++ ) {
			if( i < chunk.length ) {
				dumped += Hexdump.to_hex( chunk.charCodeAt( i ) );
			} else {
				dumped += "..";
			}
		}
		
		return dumped;
	},
	
	dump_block: function( block ) {
		var dumped = "";
		
		var chunks = block.match( /.{1,4}/g );
		for( var i = 0; i < 4; i++ ) {
			if( i < chunks.length ) {
				dumped += Hexdump.dump_chunk( chunks[i] );
			} else {
				dumped += "........";
			}
			dumped += " ";
		}
		
		dumped += "    " + block.replace( /[\x00-\x1F]/g, "." );
		
		return dumped;
	},
	
	dump: function( s ) {
		var dumped = "";
		
		var blocks = s.match( /.{1,16}/g );
		for( var block in blocks ) {
			dumped += Hexdump.dump_block( blocks[block] ) + "\n";
		}
		
		return dumped;
	}
};
