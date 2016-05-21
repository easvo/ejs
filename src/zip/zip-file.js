ejs.zip.FILE_HEADER = 0x04034b50;
ejs.zip.CENTRAL_DIRECTORY_HEADER = 0x02014b50;
ejs.zip.HEADER_SIGNATURE = 0x05054b50;
ejs.zip.EOCD_SIGNATURE = 0x06054b50;
ejs.zip.CRC32_MAGIC_NUMBER = 0xEDB88320; 

ejs.zip.ZipFile = function (stream) {
    this.contents = [];
    this.ncLimit = 65535;  
    
    // Parse stream
    if (stream){
        this.parseZipStream(stream);
    }  
}

ejs.zip.ZipFile.prototype.parseZipStream = function(stream){
    var header = stream.readByte(4);
    var version = stream.readByte(2);
    var flag = stream.readByte(2);
    var compression = stream.readByte(2);
    var time = stream.readByte(2);
    var date = stream.readByte(2);
    
    var crc = stream.readByte(4);
    
    var compSize = stream.readByte(4);
    var unCompSize = stream.readByte(4);
    var filenameLength = stream.readByte(2);
    var extra = stream.readByte(2);
    
    console.log(filenameLength);
    

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
    
    val <<= 4;    
    val |= month;    
    
    val <<= 5;    
    val |= day;
    
    return val;    
}

ejs.zip.ZipFile.prototype.crc32 = function(content){
    var view = new Uint8Array(content);
    
    if (!this.crcTable){
        this.initCrcTable();
    }
    
    var crcResult  = 0xFFFFFFFF;
    
    for (var i = 0; i < view.length; i++){
        var code = view[i];
        crcResult = (crcResult >>> 8) ^ this.crcTable[code ^ (crcResult & 0x000000FF)];
    }
    
    return ~(crcResult) >>> 0;
}

ejs.zip.ZipFile.prototype.initCrcTable = function(){
    var table = new Uint32Array(256);
    
    for (var i =0; i < 256; i++){
        var p = i;
        for (var j = 8; j > 0; j--){            
            if ((p & 1) == 1){
                p = ((p >>> 1) ^ ejs.zip.CRC32_MAGIC_NUMBER);
            }else{
                p >>>= 1;
            }            
        }
        
        table[i] = p;
    }
    
    ejs.zip.ZipFile.prototype.crcTable = table;   
}

ejs.zip.ZipFile.prototype.initCrcTable2 = function(){
    var table = new Uint32Array(2);
    var dwPolynomial = 0xEDB88320;
    
            var dwCrc = new Uint32Array(1);
            for(i = 0; i < 2; i++)
            {
               dwCrc[0] = i;
               for(j = 8; j > 0; j--)
               {
                  if ((dwCrc[0] & 1)==1)
                  {
                      if (i === 1) console.log('if', 'dw:', dwCrc[0], 'dw & 1:', dwCrc[0] & 1, 'dw >> 1:', dwCrc[0] >> 1, 'dw ^ poly:', ((dwCrc[0] >> 1) ^ dwPolynomial) >>> 0);
                     dwCrc[0] = (dwCrc[0] >>> 1) ^ dwPolynomial >>> 0;
                  }
                  else
                  {
                     if (i === 1) console.log('else', 'dw:', dwCrc[0], 'dw & 1:', dwCrc[0] & 1, 'dw >> 1:', dwCrc[0] >> 1, 'dw ^ poly:', ((dwCrc[0] >> 1) ^ dwPolynomial) >>> 0);
                     dwCrc[0] >>>= 1;
                  }
                  //console.log(dwCrc[0]);
               }
               table[i] = dwCrc[0];
            }
    
    ejs.zip.ZipFile.prototype.crcTable = table;   
}

ejs.zip.ZipFile.prototype.adler32 = function(content){
    var view = new Uint8Array(content);
    
    var a = 1;
    var b = 0;
    
    for (var i = 0; i < view.length; i++){
        a += view[i];
        b += a;
    }
    
    a %= 65521;
    b %= 65521;
    
    return (b << 16) + a;    
}

ejs.zip.ZipFile.prototype.save = function(name){
    var stream = new ejs.zip.BitStream();
    
    for (var i = 0; i < this.contents.length; i++){
        var item = this.contents[i];
        
        item.position = stream.position;
        
        // Compress
        stream.writeByte(ejs.zip.FILE_HEADER, 4, true);
        stream.writeByte(0x14, 2, true); // Version
        stream.writeByte(0, 2, true); // Bit flag
        stream.writeByte(0, 2, true); // Compression
        stream.writeByte(this.dateToDosTime(item.modDate), 2, true); // last mod time
        stream.writeByte(this.dateToDosDate(item.modDate), 2, true); // last mod date
        
        // CRC 32
        var contentStream = new ejs.zip.BitStream();
        contentStream.writeString(item.content);
        
        item.crc = this.crc32(contentStream.buffer);
                
        stream.writeByte(item.crc, 4, true);
        
        stream.writeByte(item.content.length, 4, true); // Compressed size
        stream.writeByte(item.content.length, 4, true); // Uncompressed size
        stream.writeByte(item.filename.length, 2, true); // Filename length
        stream.writeByte(0, 2, true); // Extra field length
               
        // Filename, normal order
        for (var j = 0; j < item.filename.length; j++){
            var code = item.filename.charCodeAt(j);
            stream.writeByte(code);            
        }
        
        // Content, normal order
        for (var j = 0; j < item.content.length; j++){
            var code = item.content.charCodeAt(j);
            stream.writeByte(code);            
        }                
    }
    
    var pos = stream.position;        
    
    for (var i = 0; i < this.contents.length; i++){
        // Central directory
        var item = this.contents[i];
        
        stream.writeByte(ejs.zip.CENTRAL_DIRECTORY_HEADER, 4, true);
        stream.writeByte(0x14, 2, true); // Version
        stream.writeByte(0x14, 2, true); // Version to extract
        stream.writeByte(0, 2, true); // Bit flag
        stream.writeByte(0, 2, true); // Compression
        stream.writeByte(this.dateToDosTime(item.modDate), 2, true); // last mod time
        stream.writeByte(this.dateToDosDate(item.modDate), 2, true); // last mod date       
                
        stream.writeByte(item.crc, 4, true);
        
        stream.writeByte(item.content.length, 4, true); // Compressed size
        stream.writeByte(item.content.length, 4, true); // Uncompressed size
        stream.writeByte(item.filename.length, 2, true); // Filename length
        stream.writeByte(0, 2, true); // Extra field length
        
        stream.writeByte(0, 2, true); // file comment length
        stream.writeByte(0, 2, true); // disk number start
        
        stream.writeByte(1, 2, true); // internal file attrs
        stream.writeByte(0x20, 4, true); // external file attrs
        
        stream.writeByte(item.position, 4, true); // relative offset of local header
        
        for (var j = 0; j < item.filename.length; j++){
            var code = item.filename.charCodeAt(j);
            stream.writeByte(code);            
        }                
    }
    
    var cdLength = stream.position - pos;
    
    // End of central directory    
    stream.writeByte(ejs.zip.EOCD_SIGNATURE, 4, true);
    stream.writeByte(0, 2, true); // Number of disk
    stream.writeByte(0, 2, true); // Number of the disk
    
    stream.writeByte(this.contents.length, 2, true); // Number of entries in central
    stream.writeByte(this.contents.length, 2, true); // Number of entries in central
    
    stream.writeByte(cdLength, 4, true); // Size of central directory
    
    stream.writeByte(pos, 4, true); // Offset of central directory
    
    stream.writeByte(0, 2, true); // Zip file comment length
        
    ejs.helper.saveBinary('test.zip', stream.buffer);           
}
