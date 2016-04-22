ejs.zip.Huffman = function(){
    
}

ejs.zip.HuffmanNode = function(){
    this.code; // int
    this.zero; // Node
    this.one; // Node
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
                                        
        console.log(pre, nextSequence, testSequence[testSequence.length - 1], i, dictionary);
        var offset = i  - pre;
        var length = nextSequence.length;
        var nextCharacter = input[cursor] || '$';
        var result = '';
        if (pre === -1) result = input[cursor];
        else  result = '<' + offset + ',' + length + ',' + nextCharacter + '>';                        
        i = cursor;
        output += result;
        console.log(result);
        
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