ejs.zip.FILE_HEADER = 0x04034b50;
ejs.zip.CENTRAL_DIRECTORY_HEADER = 0x02014b50;
ejs.zip.HEADER_SIGNATURE = 0x05054b50;
ejs.zip.EOCD_SIGNATURE = 0x06054b50;


ejs.zip.ZipFile = function () {
    this.contents = [];
    this.ncLimit = 65535;
    

}

ejs.zip.ZipFile.prototype.addFile = function(path, content){
    this.contents.push({filename : path, content : content, modDate : new Date()});
}

ejs.zip.ZipFile.prototype.createBlock = function(){
    // bit 0        1 if last block in the data
    // bit 1 - 2    00 if raw, 01 fixed, 10 dynamic
    
    
    // 0b110 common
    
}

ejs.zip.ZipFile.prototype.dateToDosTime = function(date){
    var seconds = Math.floor(date.getSeconds() / 2);
    var minutes = date.getMinutes();
    var hour = date.getHours();
    
    var val = 0;
    val |= hour;
    val <<= 6;
    val |= minutes;
    val <<= 5;
    val |= seconds;
    
    return val;    
}

ejs.zip.ZipFile.prototype.dateToDosDate = function(date){
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear() - 1980;
    
    var val = 0;
    val |= year;
    val <<= 7;
    val | month;
    val <<= 4;
    val |= day;
    
    return val;    
}

ejs.zip.ZipFile.prototype.save = function(name){
    var stream = new ejs.zip.BitStream();
    
    for (var i = 0; i < this.contents.length; i++){
        var item = this.contents[i];
        
        // Compress
        stream.writeByte(ejs.zip.FILE_HEADER, 4, true);
        stream.writeByte(0x14, 2, true); // Version
        stream.writeByte(0, 2, true); // Bit flag
        stream.writeByte(0, 2, true); // Compression
        stream.writeByte(this.dateToDosTime(item.modDate), 2, true); // last mod time
        stream.writeByte(this.dateToDosDate(item.modDate), 2, true); // last mod date
        
        stream.writeByte(0, 4, true); // CRC32
        
        stream.writeByte(item.content.length, 4, true); // Compressed size
        stream.writeByte(item.content.length, 4, true); // Uncompressed size
        stream.writeByte(item.filename.length, 2, true); // Filename length
        stream.writeByte(0, 2, true); // Extra field length
        
        console.log(item);
        
        // Filename, normal order
        for (var j = 0; j < item.filename.length; j++){
            var code = item.filename.charCodeAt(j);
            console.log(code);
            stream.writeByte(code);            
        }
        
        // Content, normal order
        for (var j = 0; j < item.content.length; j++){
            var code = item.content.charCodeAt(j);
            stream.writeByte(code);            
        }                
    }
    
    // Header format
    /*
       Local file header signature
       version
       bit flag
       compression method
       last mod file time
       last mod file date
       crc-32
       compressed size
       uncompressed size
       file name length
       extra field length
       
       file name
       extra field
       
       [File data]
    */ 
    
    /* Central directory header
        
        signature
        version made by
        version to extract
        bit flag
        compression mode
        last mod file time
        last mod file date
        crc-32
        compressed size
        uncompressed size
        file name length
        extra field length
        file comment length
        disk number start
        internal file attributes
        external file attributs
        relative offset of local header
        
        filename
        extra field
        file comment
        
    */
    
    // var buffer = new ejs.helper.ArrayBuffer(16);
    
    // // Signature
    // buffer.pushMSB(0, ejs.zip.EOCD_SIGNATURE, 4);
    
    // buffer.pushMSB(4, 0);
    // buffer.pushMSB(6, 0);
    // buffer.pushMSB(8, 2);
    // buffer.pushMSB(10, 0);
    
    // buffer.pushMSB(12, 0, 4);
    // buffer.pushMSB(14, 0, 4);   
    
    // buffer.pushMSB(16, 0);
    
    ejs.helper.saveBinary('test.zip', stream.buffer);
        
    /*   End of central directory record
        end dir sig -                       4 bytes
        number of disk -                    2 bytes
        number of disk with start -         2 bytes
        total number of entries -           2 bytes
        total in central dir                2 bytes
        size of central directory           4 bytes
        offset of start of cd               4 bytes
        zip file comment len                2 bytes
        zip file comment            (variable size)
        
         Footer
    */
}