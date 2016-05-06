ejs.zip.ZipEntry = function(name, content){
    this.name = name;
    this.content = content;
    this.modifiedDate = new Date();
    //this.crc
    //this.method
}

ejs.zip.ZipEntry.prototype.toArray = function(){
    
}