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