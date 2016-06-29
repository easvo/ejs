ejs.zip.ZipEntry = function(name, content){
    this.name = name || '';
    this.content = content;
    this.modifiedDate = new Date();
    //this.crc
    //this.method
}

ejs.zip.ZipEntry.prototype.toArray = function(){
    
}

ejs.zip.ZipEntry.prototype.uncompress = function(){
    var d = new ejs.zip.BitStream(this.contentBytes);
    d.position = 0;
    var def = new ejs.zip.Deflate();
    var outputStream = def.inflate(d);
    return outputStream;    
}