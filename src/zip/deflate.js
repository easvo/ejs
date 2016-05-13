ejs.zip.Deflate = function(){
    
}

ejs.zip.Deflate.prototype.MAX_BITS = 15;

ejs.zip.Deflate.prototype.lengths = [{ bits : 0, lengthBase : 3, code : 257 },
{ bits : 0, lengthBase : 4, code : 258 },
{ bits : 0, lengthBase : 5, code : 259 },
{ bits : 0, lengthBase : 6, code : 260 },
{ bits : 0, lengthBase : 7, code : 261 },
{ bits : 0, lengthBase : 8, code : 262 },
{ bits : 0, lengthBase : 9, code : 263 },
{ bits : 0, lengthBase : 10, code : 264 },
{ bits : 1, lengthBase : 11, code : 265 },
{ bits : 1, lengthBase : 13, code : 266 },
{ bits : 1, lengthBase : 15, code : 267 },
{ bits : 1, lengthBase : 17, code : 268 },
{ bits : 2, lengthBase : 19, code : 269 },
{ bits : 2, lengthBase : 23, code : 270 },
{ bits : 2, lengthBase : 27, code : 271 },
{ bits : 2, lengthBase : 31, code : 272 },
{ bits : 3, lengthBase : 35, code : 273 },
{ bits : 3, lengthBase : 43, code : 274 },
{ bits : 3, lengthBase : 51, code : 275 },
{ bits : 3, lengthBase : 59, code : 276 },
{ bits : 4, lengthBase : 67, code : 277 },
{ bits : 4, lengthBase : 83, code : 278 },
{ bits : 4, lengthBase : 99, code : 279 },
{ bits : 4, lengthBase : 115, code : 280 },
{ bits : 5, lengthBase : 131, code : 281 },
{ bits : 5, lengthBase : 163, code : 282 },
{ bits : 5, lengthBase : 195, code : 283 },
{ bits : 5, lengthBase : 227, code : 284 },
{ bits : 0, lengthBase : 258, code : 285 }
];

ejs.zip.Deflate.prototype.distances = [{ bits : 0, distanceBase : 1, code : 0 },
{ bits : 0, distanceBase : 2, code : 1 },
{ bits : 0, distanceBase : 3, code : 2 },
{ bits : 0, distanceBase : 4, code : 3 },
{ bits : 1, distanceBase : 5, code : 4 },
{ bits : 1, distanceBase : 7, code : 5 },
{ bits : 2, distanceBase : 9, code : 6 },
{ bits : 2, distanceBase : 13, code : 7 },
{ bits : 3, distanceBase : 17, code : 8 },
{ bits : 3, distanceBase : 25, code : 9 },
{ bits : 4, distanceBase : 33, code : 10 },
{ bits : 4, distanceBase : 49, code : 11 },
{ bits : 5, distanceBase : 65, code : 12 },
{ bits : 5, distanceBase : 97, code : 13 },
{ bits : 6, distanceBase : 129, code : 14 },
{ bits : 6, distanceBase : 193, code : 15 },
{ bits : 7, distanceBase : 257, code : 16 },
{ bits : 7, distanceBase : 385, code : 17 },
{ bits : 8, distanceBase : 513, code : 18 },
{ bits : 8, distanceBase : 769, code : 19 },
{ bits : 9, distanceBase : 1025, code : 20 },
{ bits : 9, distanceBase : 1537, code : 21 },
{ bits : 10, distanceBase : 2049, code : 22 },
{ bits : 10, distanceBase : 3073, code : 23 },
{ bits : 11, distanceBase : 4097, code : 24 },
{ bits : 11, distanceBase : 6145, code : 25 },
{ bits : 12, distanceBase : 8193, code : 26 },
{ bits : 12, distanceBase : 12289, code : 27 },
{ bits : 13, distanceBase : 16385, code : 28 },
{ bits : 13, distanceBase : 24577, code : 29 }];

// 0 - 15 = codelengths
// 16 copy prev 3 - 6, 2 bits
// 17 copy prev 3 - 10
// 18 copy prev 11 - 138
ejs.zip.Deflate.prototype.order = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

ejs.zip.Deflate.prototype.inflate = function(stream){ 
    var outputStream = new ejs.zip.BitStream();
    
    var blockPosition = stream.read(1);
    
    var method = stream.read(2);
       
    if (method === 1){ // Fixed
        
    }
    else if (method === 2) {// dynamic
        var hlit = stream.read(5) + 257;
        var hdist = stream.read(5) + 1;
        var hclen = stream.read(4) + 4;
        
        console.log(hlit, hdist, hclen);
        
        var lengths = [];
        
        var literals = [];
        
        // Code lengths code lengths
        for (var i = 0; i < hclen; i++){
            lengths[this.order[i]] = stream.read(3);
        }
        
        for (;i<19;i++){
            lengths[this.order[i]] = 0;
        }
        
        var ranges = [];
        
        for (var i = 0; i < lengths.length; i++){
            if (lengths[i] !== 0){
                ranges.push({ code : i, length : lengths[i]});
            }
        }
        
        ranges.sort(function(a, b){
            var d = a.length - b.length;
            if (d === 0) return a.code - b.code;
            else return d;
        });        
        
        var huff = new ejs.zip.Huffman();
        var codes = huff.canonicalize(ranges);
        
        var lengthKey = huff.toKey(codes);
        // for (var i = 0; i < ranges.length; i++){
        //     lengthKey[ranges[i].next] = lengthKey[ranges[i].length] || {};
        //     lengthKey[ranges[i].next] = { length : ranges[i].length, value : ranges[i].code };            
        // }
                
        // With codes read stream
        var val = null;
                       
        var i = 0; 
        
        while (i < hlit + hdist){
            
            var sym = this.decode(stream, lengthKey);
                        
            if (sym < 0){
                // Error   
                console.log("sym error < 0");             
            }
            
            if (sym < 16){
                literals[i++] = sym;
                continue;                
            }
            
            len = 0;
            
            if (sym === 16){
                len = literals[i - 1];
                sym = 3 + stream.read(2);
            } else if(sym === 17){
                sym = 3 + stream.read(3);
            } else{
                sym = 11 + stream.read(7);
            }
            
            while(sym--){
                literals[i++] = len;
            }          
        }
                
        var usedLiterals = [];
        var distances = [];
        
        for (var i = 0; i < literals.length; i++){
            if (literals[i] !== 0) {
                if (i < 287){
                    usedLiterals.push({ code : i, length : literals[i]});
                }else{
                    distances.push({ code : i - 286, length : literals[i]});
                }
               
            }
        }                
        
        usedLiterals.sort(function(a, b){
            var d = a.length - b.length;
            if (d === 0) return a.code - b.code;
            else return d;
        });
        
        console.log('Used literals:', usedLiterals, distances);
        
        var codes = huff.canonicalize(usedLiterals);
        
        var literalKey = huff.toKey(codes);
        // for (var i = 0; i < codes.length; i++){
        //     literalKey[codes[i].next] = { 
        //         length : codes[i].length, 
        //         value : codes[i].code,
        //         literal : String.fromCharCode(codes[i].code),
        //         bin : codes[i].bs
        //      };            
        // }
        
        distances.sort(function(a, b){
            var d = a.length - b.length;
            if (d === 0) return a.code - b.code;
            else return d;
        });
        
        var codes = huff.canonicalize(distances);
        
        var distanceKey = huff.toKey(codes);
        // for (var i = 0; i < codes.length; i++){
        //     distanceKey[codes[i].next] = {
        //         length : codes[i].length,
        //         value : codes[i].code,
        //         bin : codes[i].bs
        //     };
        // }
        
        var output = '';
                
        // for (var i = 0; i < 50; i++){
        //     output += stream.read(1);
        // }
        
        console.log(literalKey, distanceKey, output);
        
        var sym = this.decode(stream, literalKey);
        
        console.log(sym, 'first after');
               
    } 
}

ejs.zip.Deflate.prototype.decode = function(stream, huffman){
    var code = 0, index = 0;
    
    for (var i = 0; i < this.MAX_BITS; i++){
        code |= stream.read(1);
        
       // console.log(code.toString(2), i, code);
        
        if (huffman[code] && huffman[code][i +1]) {
            var val = huffman[code][i + 1].code;
            if (val !== 286) {
                return val;
            } 
        }
        
        code <<= 1;
    }
    
    console.log(code, 'not found');
}

ejs.zip.Huffman = function(){
    
}

ejs.zip.Huffman.prototype.encode = function(source){
    var key = {};
    
    for (var i = 0; i < source.length; i++){
        key[source[i]] = key[source[i]] || 0;
        key[source[i]]++;
    }
    
    var freq = Object.keys(key).map(function(d){
        var node = new ejs.zip.HuffmanNode();
        node.isLeaf = true;
        node.value = d;
        node.f = key[d];
        return node;
    });
    
    while (freq.length > 1){
        freq = freq.sort(function(a, b){
            return a.f - b.f;
        });
        
        var node = new ejs.zip.HuffmanNode();
        node.zero = freq.shift();
        node.one = freq.shift();
        node.f = node.zero.f + node.one.f;
        freq.push(node);
        i++;
    }
            
    var root = freq[0];
    
    function getCodeLengths(node, depth){        
        depth = depth === undefined ? 0 : depth;
        var codes = [], ones = [], zeroes = [];
        if (node.zero){
            zeroes = getCodeLengths(node.zero, depth + 1);
        }if (node.one){
            ones = getCodeLengths(node.one, depth + 1);
        }
        
        if(node.value){
            codes.push({ length : depth, code : node.value});
        }
                
        return codes.concat(zeroes).concat(ones);                
    }
    
    function getCodes(node, prefix){        
        prefix = prefix === undefined ? '' : prefix;
        var codes = [], ones = [], zeroes = [];
        if (node.zero){
            zeroes = getCodes(node.zero, prefix + '0');
        }if (node.one){
            ones = getCodes(node.one, prefix + '1');
        }
        
        if(node.value){
            codes.push({ prefix : prefix, code : node.value});
        }
                
        return codes.concat(zeroes).concat(ones);                
    }
    
    //var codes = getCodes(root);
    
    var codes = getCodeLengths(root);
    
    codes.sort(function(a, b){
        if (a.length === b.length){
            return a.code.localeCompare(b.code);
        }
        else return a.length - b.length;
    });
        
    this.codes = this.canonicalize(codes);
    
    
    //console.log(freq, codes);
    
}

ejs.zip.Huffman.prototype.canonicalize = function(codes){

    var N = [0];
    var max = 0;
      
    for(var i = 0; i < codes.length; i++){        
        N[codes[i].length] = N[codes[i].length] || 0;
        N[codes[i].length]++;
        max = Math.max(max, codes[i].length);
    }
    
    code = 0;
    nextCode = [];
    
    for (bits = 1; bits <= max; bits++){
        code = (code + N[bits - 1]) << 1;
        nextCode[bits] = code;
    }
    
    
    for(var i = 0; i < codes.length; i++){
        var len = codes[i].length;
        if (len != 0){
            codes[i].next = nextCode[len];
            codes[i].bs = codes[i].next.toString(2);
            while(codes[i].bs.length < codes[i].length){
                codes[i].bs = '0' + codes[i].bs;
            }
            nextCode[len]++;
        }
    }
        
    return codes;          
}

ejs.zip.Huffman.prototype.toKey = function(codes){
    var key = {};
    console.log(codes);
    
    for (var i = 0; i < codes.length; i++){
        var code = codes[i];
        key[code.next] = key[code.next] === undefined ? {} : key[code.next];
        key[code.next][code.length] = code;
    }
    
    return key;
}

ejs.zip.HuffmanNode = function(){
    this.code; // int
    this.zero; // Node
    this.one; // Node
}

ejs.zip.HuffmanRange = function(end, length){
    this.end = end;
    this.length = length;
}

ejs.zip.LZ77 = function(){
    
}

ejs.zip.LZ77.prototype.compress = function(input){
    var i, length, p, l, c, buffer, nextChar, previous, windowLength = 32768, bufferLength = 16384;  
    var output = '';
    var lengthLimit = 258;
    
    var ot = new Uint8Array();
    
    // 0 0000000 1 000000000000 0000 
    
    // Data in Uint8Array
    // var blob = new Blob(data, {type : 'application/octet-stream'});
    
    for (var i = 0; i < input.length; i++){
        // Form window
        buffer = input.slice(i, i + bufferLength);        
        dictionary = input.slice(Math.max(i - bufferLength, 0), i);
        
        nextSequence = input.slice(i, i + 1);
        
        var found = dictionary.indexOf(nextSequence);
        var pre = found;
        var testSequence = nextSequence;
        var cursor = i;
        
        while (found > -1 && cursor < 500){
            pre = found;
            nextSequence = testSequence;
            dictionary = input.slice(Math.max(cursor - bufferLength, 0), cursor);
            
            cursor++;
            testSequence += input[cursor];
            found = dictionary.indexOf(testSequence);
        }
                                        
        //console.log(pre, nextSequence, testSequence[testSequence.length - 1], i, dictionary);
        var offset = i  - pre;
        var length = nextSequence.length;
        var nextCharacter = input[cursor] || '$';
        var result = '';
        if (pre === -1) result = input[cursor];
        else  result = '<' + offset + ',' + length + ',' + nextCharacter + '>';                        
        i = cursor;
        output += result;
        //console.log(result);
        
    }
    
    return output;
}

ejs.zip.LZ77.prototype.decompress = function(input){
    
}

// Format
/*

  0 00000000 1 000000000000 0000
  _ characte _ pointer      len

*/