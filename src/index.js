var ejs = {};
ejs.xml = {};
ejs.zip = {};
ejs.pkg = {};
ejs.xl = {};
ejs.sml = {};

ejs.helper = {};

ejs.helper.saveText = function(name, content){
    //var blob = new Blob([view], {type : 'application/octet-stream'});
    var blob = new Blob([content], {type : 'text/plain'});    
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}

ejs.helper.saveBinary = function(name, content){
    var view = new Uint8Array(content);
    var blob = new Blob([view], {type : 'application/octet-stream'});       
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}

ejs.helper.ArrayBuffer = function(size){
    this.buffer = new ArrayBuffer(size);
    this.view = new Uint8Array(this.buffer);
    this.bufferSize = size;
    this.length = size;
}

ejs.helper.ArrayBuffer.prototype.pushMSB = function(i, x, l){
    l = l || 2;
        
    if ((i + l) > this.length){
        this.resize(i + l);
    }
      
    var view = new Uint8Array(this.buffer, i, l);
    
    for (var j = 0; j < l; j++){
        var shift = 8 * j;
        view[j] = (x >>> shift) & 0xFF;
    }      
}

ejs.helper.ArrayBuffer.prototype.resize = function(n){
    
    var l = this.buffer.byteLength;
    
    while (l < n){
        l+= this.bufferSize;
    }
    
    var buffer = new ArrayBuffer(l);
    var view = new Uint8Array(this.buffer);
    var outView = new Uint8Array(buffer, 0, this.buffer.byteLength);
    
    for (var i = 0; i < this.buffer.byteLength; i++){
        outView[i] = view[i];
    }
    
    this.buffer = buffer;
    this.length = buffer.byteLength;
}