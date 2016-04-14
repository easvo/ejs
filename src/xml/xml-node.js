ejs.xml.XmlNode = function(name, attrs, namespace) {
    
    var parsed = this.parseName(name);
    
    this.name = name;
    this.attrs = attrs || [];
    this.nodes = [];
    this.value = null;
    this.depth = 0;
    
    // URN and prefix
    this.namespace = namespace || null;
    
    if (parsed.prefix !== null && this.namespace == null){
        this.namespace = {
            prefix : parsed.prefix,
            urn : null
        };
    }
}

ejs.xml.XmlNode.prototype.addNode = function(node){
    this.nodes.push(node);
    return this;
}

Object.defineProperty(ejs.xml.XmlNode.prototype, 'name', {
    get : function () {
       return this._name;
    },
    set : function(val){
       this._name= val; 
    }
});

Object.defineProperty(ejs.xml.XmlNode.prototype, 'isEmpty', {
    get : function () {
       return this.value == null && this.nodes.length === 0;
    }
});

ejs.xml.XmlNode.prototype.parseName = function(raw){
    var name, prefix = null, spl;
    
    spl = raw.split(':');
    if (spl.length == 2){
        prefix = spl[0];
        name = spl[1];                
    }else{
        name = spl[0];
    }
    
    return {
        name: name,
        prefix : prefix
    };
}

ejs.xml.XmlNode.prototype.writeNode = function (nsManager, options, depth) {
    depth = depth == undefined ? 0 : depth;
    var xml = '';    
    var indent = '';
    
    if (options.pretty){
        var d = depth;
        while (d--){
            indent += '    ';
        }
        xml += indent;       
    } 
    
    xml += this.open(nsManager);
    
    if (this.isEmpty) return xml + (options.pretty ? '\r\n' : '');
                    
    if (options.pretty && this.nodes.length > 0) xml += '\r\n';
    
    var content = this.nodes.map(function(node){
        return node.writeNode(null, options, depth + 1);
    }).join('');
    
    xml += content;
    
    if (options.pretty && this.nodes.length > 0){
        xml += indent;       
    } 
            
    xml += this.close();
    
    if (options.pretty) xml += '\r\n';
    
    return xml;
}

ejs.xml.XmlNode.prototype.open = function (nsManager) {
    var node = this;
    
    var attrString = this.attrs.map(function(attr) {
       return node.writeAttribute(attr);
    }).join(' ');
    
    if (this.attrs.length > 0) attrString = ' ' + attrString;
    
    if (nsManager) attrString += ' ' + nsManager.writeNamespaces();
    
    return '<' + this.name + attrString + (this.isEmpty ? '/>' : '>');
}

ejs.xml.XmlNode.prototype.writeAttribute = function (attr) {    
    // Check if a namespace
    var name = attr.name;
    if (name.indexOf(':') <0 && attr.namespace && attr.namespace.prefix) name += ':' + attr.namespace.prefix;
        return name + '="' + attr.value + '"';
}

ejs.xml.XmlNode.prototype.close = function () {
    return '</' + this.name + '>';
}