ejs.zip.BitStream = function(){
    this.buffer = new ArrayBuffer(0);
    this.position = 0;
    this.pending = 0;
    this.pendingLength = 0;
    this.size = 1024;
}

ejs.zip.BitStream.prototype.write = function(val, l, lsb){
    
    // Bits in value
    var bits = this.getBitLength(val);
    
    // Bit to use
    l = l === undefined || l === null ? bits : l;
    
    // 34592 1000 1000 1000 1000
    // val = 0b1000100010001000
    
    var space = 8 - this.pendingLength;
    
    // Room for seven in example
    // Input has 16 length, 1 sig bits
    
    // Trim if higher than bits to insert
    space = space > l ? l : space;
    
    // Allocate space
    this.pending <<= space;
    this.pendingLength += space;
    
    // Get from val
    // 16 - 1
    var grab = val >> (l - space);
    
    // Append to pending
    this.pending |= grab;
    
    // Mask what was taken
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

ejs.zip.BitStream.prototype.writeByte = function(val){
    if (this.position + 1 > this.buffer.byteLength){
        this.resize(this.buffer.byteLength + 1);
    }
    
    var view = new Uint8Array(this.buffer, this.position, 1);
    view[0] = val;
    this.position++;
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
    var output = 0;
    
    this.cache = this.readByte();
    
    console.log(this.cache.toString(2), 8 - n);
    
    var mask = 0;     
    var l = 8 - n;   
    
    while (l--){
        mask <<= 1;
        mask |= 1;
        
        this.bitPosition++;
    }
    
    mask <<= n;
    
    var val = this.cache & ~mask;
    
    console.log(val);
    
    //this.bitPosition = 0;
    //this.cache = this.readByte();
    
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

ejs.zip.BitStream.prototype.readByte = function(n){    
    n = n === undefined ? 1 : n;
    var len = this.buffer.byteLength;
    
    if ((this.position + n) > len){
        return -1;
    }
    
    var view = new Uint8Array(this.buffer, this.position, n);
    this.position += n;
    return n < 2 ? view[0] : view;    
}

ejs.zip.BitStream.prototype.seek = function(position){
    if (position > this.buffer.byteLength){
        throw 'Position is larger than the length of the buffer';
    }else{
        this.position = position;    
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
