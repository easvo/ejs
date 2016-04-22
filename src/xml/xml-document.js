ejs.xml.XmlDocument = function (root) {
    this.root = root || null;    
}

ejs.xml.XmlDocument.prototype.write = function(options){
    options = options || {};
    if (this.root){
        var content = this.getDeclaration();
        // Build up namespaces
        var nsManager = new ejs.xml.XmlNamespaceManager(this.getNamespaces());
        
        content+= this.root.writeNode(nsManager, options);
        
        return content;
    }else{
        throw new ejs.xml.XmlException(this, 'there is no root defined');
    } 
}

ejs.xml.XmlDocument.prototype.toBinary = function(){
    var content = this.write();
    var output = new Uint8Array(content.length);
    var strOutput = '';
    for (var i = 0; i < content.length; i++){
        output[i] = content[i].charCodeAt(0);
        strOutput += this.charToBinary(content[i], 8) + ' ';
    }
    
    //console.log(output);
    
    return strOutput;
}

ejs.xml.XmlDocument.prototype.charToBinaryUTF8 = function(c, padding){
    padding = padding === undefined ? 8 : padding;
    var str = c.charCodeAt(0).toString(2);
    padding = padding - str.length;
    while (padding--){
        str = '0' + str;
    }
    
    return str;    
}

ejs.xml.XmlDocument.prototype.charToBinary = function(c, padding){
    padding = padding === undefined ? 8 : padding;
    var str = c.charCodeAt(0).toString(2);
    padding = padding - str.length;
    while (padding--){
        str = '0' + str;
    }
    
    return str;    
}

ejs.xml.XmlDocument.prototype.padLeft = function(a, p){
    
}

ejs.xml.XmlDocument.prototype.getNamespaces = function(){
    var namespaces = {}, attr, node;
    var nodes = [this.root];
    
    while (nodes.length > 0){
        node = nodes.pop();
        nodes = nodes.concat(node.nodes);
        if (node.namespace){
            namespaces[node.namespace.prefix] = node.namespace;
        }
        
        for(var i = 0; i < node.attrs.length; i++){
            attr = node.attrs[i];
            if (attr.namespace){
                namespaces[attr.namespace.prefix] = attr.namespace;
            }
        }
    }
    
    return Object.keys(namespaces).map(function (key) {
        return namespaces[key];
    });            
}

ejs.xml.XmlDocument.prototype.writeNamespaces = function (namespaces) {
    var formatted = namespaces.map(function (nms) {       
       var stem = 'xmlns';
       if (nms.prefix !== ''){
           stem += ':' + nms.prefix;
       }       
       stem += '=' + nms.urn;
       return stem;
    }).join(' ');
    
    return formatted;
}


ejs.xml.XmlDocument.prototype.getDeclaration = function(){
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';
}

ejs.xml.XmlException = function(doc, message){
    this.document = doc;
    this.message = message;
}

