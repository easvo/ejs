ejs.zip.BitStream = function(ui8Array){
    if (ui8Array !== undefined){
        this.buffer = new ArrayBuffer(ui8Array.length);
        new Uint8Array(this.buffer).set(ui8Array);
    }else{
        this.buffer = new ArrayBuffer(0);
    }
    
    this.position = this.buffer.byteLength;
    this.bitPosition = 0;
    this.pending = 0;
    this.pendingLength = 0;
    this.size = Math.max(this.buffer.byteLength, 1024);
}

Object.defineProperty(ejs.zip.BitStream.prototype, 'position', {
    get : function(){
        return this._position;
    },
    set : function(val){
        this.seek(val);
    }
});

ejs.zip.BitStream.prototype.write = function(val, l, lsb){
    
    // Bits in value
    var bits = this.getBitLength(val);
    
    // Bit to use
    l = l === undefined || l === null ? bits : l;
    
    var space = 8 - this.pendingLength;
    
    // Trim if higher than bits to insert
    space = space > l ? l : space;
    
    // Allocate space
    this.pending <<= space;
    this.pendingLength += space;
    
    // Get from val
    var grab = val >> (l - space);
    
    this.pending |= grab;
    
    var mask = 0;
        
    l -= space;
    var i = space;
    while (i--){
        mask <<= 1;
        mask |= 1;
    }
       
    mask <<= l;
    
    val &= ~mask;        
    
    console.log(
        'value: ' + val,
        'l: ' + l,  
        'pending: ' + this.pending, 
        'pendingLength: ' + this.pendingLength, 
        'grab: ' + grab, 
        'space: ' + space,     
        'bits: ' + bits,
        'mask: ' + mask);        
       
    if (this.pendingLength === 8){
        this.writeByte(this.pending);
        this.pending = null;
        this.pendingLength = 0;
    }    
    if (l > 0) this.write(val, l);
}


ejs.zip.BitStream.prototype.getPaddedPending = function(){
    var bits = this.getBitLength(this.pending);
    var toAdd = 8 - (this.pendingLength - (this.pendingLength - bits));
    var val = this.pending << toAdd;
    return val;
}

/**
 * Write any pending bits to stream
 */
ejs.zip.BitStream.prototype.flush = function(){    
    if (this.pendingLength){
        var val = this.getPaddedPending();
           
        this.writeByte(val);
        
        this.pending = 0;
        this.pendingLength = 0;
    } 
}

ejs.zip.BitStream.prototype.writeByte = function(val, n, msb){
    n = n === undefined ? 1 : n;
    if (this.position + n > this.buffer.byteLength){
        this.resize(this.buffer.byteLength + n);
    }
    
    var view = new Uint8Array(this.buffer, this.position, n);
    
    if (msb){
        for (var j = 0; j < n; j++){
            var shift = 8 * j;
            view[j] = (val >>> shift) & 0xFF;
        }
    }else{
        for (var j = 0, i = n - 1; j < n; j++, i--){
            var shift = 8 * i;
            view[j] = (val >>> shift) & 0xFF;
        }
    }
    
    this.position += n;
}

ejs.zip.BitStream.prototype.getBitLength = function(val){
    if (val === 0) return 1;
    var count = 0; 
    while (val > 0){
        val >>= 1;
        count++;
    }
    return count;
}

ejs.zip.BitStream.prototype.getByteAtPosition = function(position){
    var view = new Uint8Array(this.buffer, position, 1);
    return view[0];
}

ejs.zip.BitStream.prototype.resize = function(size){
    size = size === undefined ? 0 : size;
    var buffer = new ArrayBuffer(size);
    
    size = size > this.buffer.byteLength ? this.buffer.byteLength : size;
    
    (new Uint8Array(buffer, 0, size)).set(new Uint8Array(this.buffer, 0, size));
    
    this.buffer = buffer;            
}

/**
 * Default right to left...
 */
ejs.zip.BitStream.prototype.read = function(n){
    n = n === undefined ? 1 : n;
    
    if (this.cache === null) this.cache = this.readByte();
    
    var m = n;
    
    var val = 0, read = 0, p = 0, mask = 0xFF;
    
    while (read < n && p < 100){
        var remaining = 8 - this.bitPosition;
        
        var l = m < remaining ? m : remaining;
                
        var chunk = l > 8 ? remaining : l;
        l = 8 - chunk;
        
        var i = this.cache;
        i >>= this.bitPosition;
        i <<= l;
        i &= mask;
        i >>= l;
        
        val = (i << read) | val;
        
        this.bitPosition += chunk;        
        read += chunk;
        m -= chunk;

        
        if (this.bitPosition == 8){
            this.cache = this.readByte();            
        }
        
        p++;       
    }                    
    return val;    
}

ejs.zip.BitStream.prototype.reverse = function(x){
    var r = 0;
    
    for (x >>= 1; x; x >>= 1){
        r <<= 1;
        r |= x & 1;
    }
    
    console.log(r);
    
    return r;
}

ejs.zip.BitStream.prototype.readByte = function(n, msb, asArray){    
    n = n === undefined ? 1 : n;
    var len = this.buffer.byteLength;
    
    if ((this.position + n) > len){
        return -1;
    }
    
    var view = new Uint8Array(this.buffer, this.position, n);
    this.position += n;
    this.bitPosition = 0;
    
    if (asArray === true && msb === true) return view;
    
    var val = 0;
    
    while (n--){
        val <<= 8;
        val |= view[n];
    }   
    
    return val;
    
    return n < 2 ? view[0] : view;    
}

ejs.zip.BitStream.prototype.seek = function(position){
    if (position > this.buffer.byteLength){
        throw 'Position is larger than the length of the buffer';
    }else{        
        this.bitPosition = 0;
        this.cache = null;
        this._position = position;    
    }    
}

ejs.zip.BitStream.prototype.asBinaryString = function(){    
    var output = new Uint8Array(this.buffer);
    var strOutput = '';
    for (var i = 0; i < output.length; i++){
        strOutput += this.Uint8ToBinary(output[i]) + ' ';                
    }

    // Pending
    if (this.pendingLength){
        strOutput += this.Uint8ToBinary(this.getPaddedPending());
    }       
    return strOutput;
} 

ejs.zip.BitStream.prototype.Uint8ToBinary = function(c){   
    var str = c.toString(2);
    var padding = 8 - str.length;
    while (padding--){
        str = '0' + str;
    }    
    return str;    
}

ejs.zip.BitStream.prototype.asHexString = function(){
    var output = new Uint8Array(this.buffer);
    var strOutput = '';
    for (var i = 0; i < output.length; i++){
        var raw = output[i].toString(16);
        if (raw.length === 1) raw = '0' + raw;
        strOutput += raw + (i % 2 !== 0 ? ' ' : '');
    }
    return strOutput;
}

ejs.zip.BitStream.prototype.writeString = function(content){
    for (var i = 0; i < content.length;i++){
        this.writeByte(content[i].charCodeAt(0));
    }
}

ejs.zip.BitStream.prototype.writeHexString = function(content){
    for (var i =0; i < content.length; i+=2){
        var number = parseInt('0x' + content[i] + '' + content[i + 1]);
        this.writeByte(number);
    }
}

ejs.zip.BitStream.prototype.asString = function(){
    var output = new Uint8Array(this.buffer);
    var strOutput = '';
    for (var i = 0; i < output.length; i++){
        var raw = String.fromCharCode(output[i]);
        strOutput += raw;
    }
    return strOutput;
}