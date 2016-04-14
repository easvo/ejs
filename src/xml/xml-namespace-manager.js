ejs.xml.XmlNamespaceManager = function(namespaces){
    this.namespaces = namespaces || [];
}

ejs.xml.XmlNamespaceManager.prototype.addNamespace = function (namespace) {
    this.namespaces.push(namespace);
}

ejs.xml.XmlNamespaceManager.prototype.writeNamespaces = function () {
    var formatted = this.namespaces.map(function (nms) {       
       var stem = 'xmlns';
       if (nms.prefix !== '' && nms.prefix !== null){
           stem += ':' + nms.prefix;
       }       
       stem += '=' + '"' + nms.urn + '"';
       return stem;
    }).join(' ');
    
    return formatted;
}