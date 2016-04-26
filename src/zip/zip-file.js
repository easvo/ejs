ejs.zip.FILE_HEADER = 0x04034b50;
ejs.zip.CENTRAL_DIRECTORY_HEADER = 0x02014b50;
ejs.zip.HEADER_SIGNATURE = 0x05054b50;
ejs.zip.EOCD_SIGNATURE = 0x06054b50;


ejs.zip.ZipFile = function () {
    this.contents = [];
    this.ncLimit = 65535;
    

}

ejs.zip.ZipFile.prototype.addFile = function(path, content){
    
}

ejs.zip.ZipFile.prototype.createBlock = function(){
    // bit 0        1 if last block in the data
    // bit 1 - 2    00 if raw, 01 fixed, 10 dynamic
    
    
    // 0b110 common
    
}

ejs.zip.ZipFile.prototype.save = function(name){
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
    
    var buffer = new ejs.helper.ArrayBuffer(16);
    
    // Signature
    buffer.pushMSB(0, ejs.zip.EOCD_SIGNATURE, 4);
    
    buffer.pushMSB(4, 0);
    buffer.pushMSB(6, 0);
    buffer.pushMSB(8, 2);
    buffer.pushMSB(10, 0);
    
    buffer.pushMSB(12, 0, 4);
    buffer.pushMSB(14, 0, 4);   
    
    buffer.pushMSB(16, 0);
    
    ejs.helper.saveBinary('test.zip', buffer.buffer);
        
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