ejs.xl.Workbook = function(){
    this.sheets = [];
    this.cells = {};
    this.fileVersion = {
        appName : 'x1',
        lastEdited : 5,
        lowestEdited : 5,
        rupBuild : 9303
    };
}

ejs.xl.Workbook.prototype.writeXml = function(){
    // [Content_Types].xml
    // _rels/
    //    .rels
    //  docProps/
    //    app.xml
    //    core.xml
    // xl/
    //    _rels/
    //      workbook.xml.rels
    //    theme/
    //      theme1.xml
    //    worksheets/
    //      sheet1.xml
    //    styles.xml
    //    workbook.xml 
    
    
    var document = new ejs.xml.XmlDocument();
    document.root = new ejs.xml.XmlNode('workbook', [], ejs.xl.SPREADSHEET_NAMESPACE);
    var fileVersionNode= new ejs.xml.XmlNode('fileVersion', [
        { name : 'appName', value : 'x1'},
        { name : 'lastEdited', value : 5},
        { name : 'lowestEdited', value : 5},
        { name : 'rupBuild', value : 9303}
    ]);
    
    var workbookPrNode = new ejs.xml.XmlNode('workbookPr', [
        { name : 'defaultThemeVersion', value : 124226}
    ]);
    
    var bookViewsNode = new ejs.xml.XmlNode('bookViews');
    
    var workbookViewNode = new ejs.xml.XmlNode('workbookView', [
        {name : 'xWindow', value : 480},
        {name : 'yWindow', value : 30},
        {name : 'windowWidth', value : 27795},
        {name : 'windowHeight', value : 13350}
    ]);
    
    bookViewsNode.nodes.push(workbookViewNode);
    
    var sheetsNodes = new ejs.xml.XmlNode('sheets');
    var sheetNode = new ejs.xml.XmlNode('sheet', [
        {name : 'name', value : 'Sheet1'},
        {name : 'sheetId', value : 1},
        {name : 'r:id', value : 'rId1', namespace : ejs.xl.RELATIONSHIP_NAMESPACE}
    ]);
    
    sheetsNodes.nodes.push(sheetNode);
    
    document.root
        .addNode(fileVersionNode)
        .addNode(workbookPrNode)
        .addNode(bookViewsNode)
        .addNode(sheetsNodes);
                        
    console.log(document.write({pretty: true}));
    return document.write();    
    
}