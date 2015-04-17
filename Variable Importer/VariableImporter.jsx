#target illustrator
/**
* @@@BUILDINFO@@@ VariableImporter.jsx !Version! Fri Apr 17 2015 09:10:38 GMT-0500
*/

/*
    ============================= VARIABLE IMPORTER ==============================
    By Vasily Hall
    e:
    vasily.hall@gmail.com
    LinkedIn:
    https://www.linkedin.com/pub/vasily-hall/18/166/912?trk=biz_employee_pub
    
    Thanks To:
    *Hans Boon
    *Stephen Marsh / http://prepression.blogspot.com/
    *Andy VanWagoner's CSV Parser / http://stackoverflow.com/users/1701761/andy-vanwagoner
    *John Garrett / http://hypertransitory.com/
    * The great people of Adobe Scripting Forums
    
    ----------------------------------------------- Version Notes: ----------------------------------------------------------------------
    + * @@@BUILDINFO@@@ VariableImporter.jsx !Version! Fri Apr 17 2015 09:10:38 GMT-0500 (v5.1)
    ^^^ New feature: prepend a chosen folder path to any linked-file variable.
    
    + @@@BUILDINFO@@@ VariableImporter.jsx !Version! Mon Mar 23 2015 13:16:18 GMT-0500
    ^^^ Added statement for XML UTF-8 encoding, thanks to Hans Boon.
    
    + @@@BUILDINFO@@@ VariableImporter.jsx !Version! Wed Mar 18 2015 21:46:18 GMT-0500
    ^^^ Add blank character cells to complete rows with less cells than the header row.
    
    + @@@BUILDINFO@@@ VariableImporter.jsx !Version! Tue Mar 03 2015 02:12:03 GMT-0600
    ^^^ Auto-binding suggested by Stephen Marsh- bind by name, note, or tag- binds all found instances.
    
    + @@@BUILDINFO@@@ VariableImporter_X.jsx !Version! Mon Mar 02 2015 09:56:04 GMT-0600
    ^^^ Now uses Andy VanWagoner's parser to split text contents of a cell into <p> paragraphs. Unfortunately, AI can't read as blank line for <p></p> with only whitespaces.
    
    ---------------------------------------------------- End Notes: ----------------------------------------------------------------------
    
    Now, just import Adobe Illustrator variables using a tab-delimited (*.txt) or comma-delimited (.csv) file just like in Indesign.
    1) Make a .txt (tab-delimited), or .csv data file with a heading row as the first row. (Optional)
    2) Assign appropriate column names -- they will become Illustrator Variable names. (Optional)
            To use a column for its text as a variable, just use a regular column name of your choice, without symbols @ and #.
            To use a column for its file-path content as a variable, use a "@" at-symbol in front of the name of your choice.
            To use a column for its visibility (In Illustrator layers panel) as a variable, use a "#" pound-symbol in front of the name of your choice.
    3) Import your data file using this script. (Browse file dialog will appear)
    4) A dialog appears with options:
            An option to keep the .xml file which is created as part of this operation.
            An option to select a name for each of the records by using a column's data, or custom naming.
            Press OK, when done.
    5) Your variables are in, you are free to do what you want next. - OR - the import failed, so please make sure each of the variable names and each of the dataset names are not identical,etc.
*/

/*
    The MIT License (MIT)

    Copyright (c) 2015 Vasily Hall

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE. 
*/
function VariableImporter(){
    DropDownList.prototype.selectWell = function(){
        //CC will let you select null
        this.addEventListener('change', function(){
            if(this.selection == null){
                this.selection = this.items[0];
            }
        });
    }
    function trimString(str){
        return str.replace(/^\s*/g,'').replace(/\s*$/g,'');
    }
    var CSV = {
        // ===================================================== http://stackoverflow.com/a/12785546
        // ===================================================== Andy VanWagoner
        // ===================================================== http://thetalecrafter.com/
        parse: function(csv, reviver, splitter) {
            splitter = splitter  || ',';
            reviver = reviver || function(r, c, v) { return v; };
            var chars = csv.split(''), c = 0, cc = chars.length, start, end, table = [], row;
            while (c < cc) {
                table.push(row = []);
                while (c < cc && '\r' !== chars[c] && '\n' !== chars[c]) {
                    start = end = c;
                    if ('"' === chars[c]){
                        start = end = ++c;
                        while (c < cc) {
                            if ('"' === chars[c]) {
                                if ('"' !== chars[c+1]) { break; }
                                else { chars[++c] = ''; } // unescape ""
                            }
                            end = ++c;
                        }
                        if ('"' === chars[c]) { ++c; }
                        while (c < cc && '\r' !== chars[c] && '\n' !== chars[c] && splitter !== chars[c]) { ++c; }
                    } else {
                        while (c < cc && '\r' !== chars[c] && '\n' !== chars[c] && splitter !== chars[c]) { end = ++c; }
                    }
                    row.push(reviver(table.length-1, row.length, chars.slice(start, end).join('')));
                    if (splitter === chars[c]) { ++c; }
                }
                if ('\r' === chars[c]) { ++c; }
                if ('\n' === chars[c]) { ++c; }
            }
            return table;
        },
        stringify: function(table, replacer, splitter) {
            replacer = replacer || function(r, c, v) { return v; };
            var csv = '', c, cc, r, rr = table.length, cell;
            for (r = 0; r < rr; ++r) {
                if (r) { csv += '\r\n'; }
                for (c = 0, cc = table[r].length; c < cc; ++c) {
                    if (c) { csv += splitter; }
                    cell = replacer(r, c, table[r][c]);
                    var rx = new RegExp("["+splitter+"\\r"+"\\n\"");
                    if (rx.test(cell)) { cell = '"' + cell.replace(/"/g, '""') + '"'; }
                    csv += (cell || 0 === cell) ? cell : '';
                }
            }
            return csv;
        }
    };
    function stringXmlSafe(str){
        str=str.toString();
        str=str.replace(/&(?!(amp;|gt;|lt;|quot;|apos;))/g,"&amp;");
        str=str.replace(/</g,"&lt;");
        str=str.replace(/>/g,"&gt;");
        str=str.replace(/'/g,"&apos;");
        str=str.replace(/"/g,"&quot;");
        return str;
    }
    function wrapCDATA(str, propNm){
        str = '<data>'+str+'</data>';
        str = str.replace(/(\<data\>)/g, '<'+propNm+'><![CDATA[');
        str = str.replace(/(\<\/data\>)/g,']]\>'+'</'+propNm+'>');
        return XML(str);
    }
    function drawFromObjString(objString, canvasArea){
        function round2(num){
            return Math.round(num*100)/100;
        }
        function drawPath(shp){
            var thisShp=shp;
            if(thisShp.ellipsePath!=true){
                var vectorPts=thisShp.pathPoints;
                canvas.newPath();
                canvas.moveTo(thisShp.pathPoints[0][0],thisShp.pathPoints[0][1]);
                for(var j=0; j<vectorPts.length; j++){
                    var thisAnchor=vectorPts[j];
                    var x=thisAnchor[0], y=thisAnchor[1];
                    canvas.lineTo(x,y);
                }
                if(thisShp.closed==true){
                    canvas.closePath();
                }
            } else {
                var cirPts=thisShp.pathPoints;
                canvas.newPath();
                canvas.ellipsePath(round2(cirPts[0]), round2(cirPts[1]), round2(cirPts[2]), round2(cirPts[3]));
                canvas.closePath();
            }
            if(thisShp.fillColor!=null){
                var clr=thisShp.fillColor;
                var myBrush=canvas.newBrush(canvas.BrushType.SOLID_COLOR,clr);
                canvas.fillPath(myBrush);
            }
            if(thisShp.strokeColor!=null){
                var clr=thisShp.strokeColor;
                var myPen=canvas.newPen(canvas.PenType.SOLID_COLOR,[clr[0],clr[1],clr[2],1], thisShp.strokeWidth);
                canvas.strokePath(myPen);
            }
        }
        //$.writeln(objString.replace(/'\+\n*\r*'/g,'').replace(/(^'|';$)/g,''));
        var obj=eval(objString.replace(/'\+\n*\r*'/g,'').replace(/(^'|';$)/g,''));
        var canvas=canvasArea.graphics;
        var counter=obj.total;
        while(counter>=0){
            for(all in obj){
                if(all.match(/\d{1,2}$/g) && all.match(/\d{1,2}$/g)==counter){
                    var thisShp=obj[all];
                    if(all.match('group')){
                        var ctr=obj[all].total;
                        while(ctr>=0){
                            for(paths in obj[all]){
                                if(paths.match(/\d{1,2}$/g) && paths.match(/\d{1,2}$/g)==ctr){
                                    drawPath(obj[all][paths]);
                                }
                            }
                            ctr--;
                        }
                    } else {
                        drawPath(thisShp);
                    }
                }
            }
            counter-=1;
        }
    }
    var ICONS = {
        vis : '({total:1, '+
            'group_0:{'+
            'shape_2:{fillColor:[0.92, 1, 1], name:"", tag:"", strokeColor:[0, 0, 0], pathPoints:[[44, 22], [42, 24], [38, 27], [32, 30], [23, 32], [12, 30], [5, 27], [2, 24], [3, 21], [8, 18], [14, 15], [23, 13], [31, 15], [37, 18], [42, 21]], ellipsePath:false, closed:true, strokeWidth:2}, '+
            'shape_1:{fillColor:[0.56, 1, 1], name:"", tag:"", strokeColor:[0, 0, 0], pathPoints:[13, 13, 18, 18], ellipsePath:true, closed:true, strokeWidth:1}, '+
            'shape_0:{fillColor:[0.84, 1, 1], name:"", tag:"", strokeColor:null, pathPoints:[15, 15, 10, 10], ellipsePath:true, closed:true}, total:3}})',
        txt : '({total:1, '+
            'shape_0:{fillColor:[0, 0, 0], name:"", tag:"", strokeColor:null, pathPoints:[[42, 1], [42, 12], [42, 12], [39, 8], [37, 5], [34, 3], [29, 3], [27, 3], [27, 4],'+
            ' [27, 39], [27, 42], [28, 42], [31, 43], [37, 43], [37, 44], [8, 44], [8, 43], [14, 43], [17, 42], [18, 42], [19, 39], [19, 5], [18, 3], [17, 3], [13, 3], [9, 5], [6, 8], [4, 12], [3, 12], [3, 1]], ellipsePath:false, closed:true}})',
        lnk : '({total:16, '+
            'shape_15:{fillColor:[0.62, 0.44, 0], name:"", tag:"", strokeColor:null, pathPoints:[[43, 43], [2, 43], [2, 2], [43, 2]], ellipsePath:false, closed:true}, '+
            'shape_14:{fillColor:[0, 0.19, 1], name:"", tag:"", strokeColor:null, pathPoints:[[39, 39], [6, 39], [6, 6], [39, 6]], ellipsePath:false, closed:true}, '+
            'shape_13:{fillColor:[0.75, 1, 0.96], name:"", tag:"", strokeColor:null, pathPoints:[[39, 22], [6, 22], [6, 6], [39, 6]], ellipsePath:false, closed:true}, '+
            'shape_12:{fillColor:[0.93, 1, 0.12], name:"", tag:"", strokeColor:null, pathPoints:[8, 8, 7, 7], ellipsePath:true, closed:true}, '+
            'shape_11:{fillColor:[0.93, 1, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[17, 21], [21, 32], [26, 34], [26, 20]], ellipsePath:false, closed:true}, '+
            'shape_10:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[36, 21], [31, 32], [26, 34], [26, 20]], ellipsePath:false, closed:true}, '+
            'shape_9:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[26, 20], [17, 21], [21, 16], [26, 16], [31, 16], [36, 21]], ellipsePath:false, closed:true}, '+
            'shape_8:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[26, 19], [22, 18], [24, 11], [26, 10], [29, 11], [31, 18]], ellipsePath:false, closed:true}, '+
            'shape_7:{fillColor:[0.93, 1, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[26, 19], [22, 18], [24, 11], [26, 10]], ellipsePath:false, closed:false}, '+
            'shape_6:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[22, 21, 3, 3], ellipsePath:true, closed:true}, '+
            'shape_5:{fillColor:[0.93, 1, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[28, 21, 3, 3], ellipsePath:true, closed:true}, '+
            'shape_4:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[27, 21, 3, 3], ellipsePath:true, closed:true}, '+
            'shape_3:{fillColor:null, name:"", tag:"", strokeColor:[0.53, 0.79, 0.86], pathPoints:[[23, 24], [23, 26]], ellipsePath:false, closed:false, strokeWidth:1}, '+
            'shape_2:{fillColor:null, name:"", tag:"", strokeColor:[0.53, 0.79, 0.86], pathPoints:[[21, 25], [21, 26], [25, 26], [26, 25]], ellipsePath:false, closed:false, strokeWidth:1}, '+
            'shape_1:{fillColor:[0.53, 0.79, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[26, 15], [24, 15], [25, 12], [26, 12], [27, 12], [28, 15]], ellipsePath:false, closed:true}, '+
            'shape_0:{fillColor:[0.93, 1, 0.86], name:"", tag:"", strokeColor:null, pathPoints:[[26, 14], [25, 14], [26, 12], [26, 12], [27, 12], [27, 14]], ellipsePath:false, closed:true}})'
    };
    function quickView(msg){
        var w = new Window('dialog');
        var e = w.add('edittext', undefined, msg, {multiline:true, readonly:true});
        e.size = [700,500];
        var okbtn = w.add('button', undefined, 'Ok');
        w.show();
    }
    var os = $.os.match('Windows') ? 'Windows' : 'Mac';
    var AIversion = parseInt(app.version.split(/\./)[0]);
    var xmlRx = /^(?!XML)[a-z][\w0-9-]*$/i;
    var xmlWarning = "Variable or DataSet Names must follow these naming rules:"+"\r\r"+
        "1) Can't start with a number or punctuation character"+"\r"+
        "2) Can't start with the letters xml (or XML, Xml, etc)"+"\r"+
        "3) Can't contain spaces or other special characters.";
    var instructions = "Import Adobe Illustrator variables using a tab-delimited (*.txt) or comma-delimited (.csv) file just like in Indesign."+"\r\r"+
        "1) Make a .txt (tab-delimited), or .csv data file with a heading row as the first row. (Optional)"+"\r"+
        "2) Assign appropriate column names -- they will become Illustrator Variable names. (Optional)"+"\r"+
        "        To use a column for its text as a variable, just use a regular column name of your choice, without symbols @ and #."+"\r"+
        "        To use a column for its file-path content as a variable, use a \"@\" at-symbol in front of the name of your choice."+"\r"+
        "        To use a column for its visibility (In Illustrator layers panel) as a variable, use a \"#\" pound-symbol in front of the name of your choice."+"\r"+
        "3) Import your data file using this script. (Browse file dialog will appear)"+"\r"+
        "4) A dialog appears with options:"+"\r"+
        "        An option to keep the .xml file which is created as part of this operation."+"\r"+
        "        An option to select a name for each of the records by using a column's data, or custom naming."+"\r"+
        "        An option to automatically bind the new variables to art objects by using their layer-panel name, the attributes note, or Illustrator Scripting tag"+"\r"+
        "               * An Illustrator Scripting tag is a method of attaching data to art objects, but is only accessible through scripting."+"\r"+
        "                  Note: The tag is referenced by the tag.name property, not the tag.value"+"\r"+
        "        Press OK, when done."+"\r"+
        "5) Your variables are in, you are free to do what you want next. - OR - the import failed, so please make sure each of the variable names and each of the dataset names are not identical,etc."+"\r\r"+
        "* If a cell has text content with carriage returns, please use double-quotes (\") to wrap the cell text, this will mark your text as having separate paragraphs.";
        "** To be able to use just the names of the files in a linked-file column, you can use the 'Prepend Filepath' checkbox to choose a folder. The folder path will be prepended to the file name for complete file path.";
    var dataSetNameInstructions = "You may assign a custom naming convention for the imported records, or data sets. Each 'row record' becomes an Illustrator data set."+"\r"+
        "This dialog gives you 6 field options, with a choice of using any variable's content as part of the dataset name."+"\r"+
        "Each dataset name must be unique, so it is advised to use an Increment field, which will add the current index to the name.";

    var xmlDest = Folder.desktop;


    var variableLabels = ["Text Variable", "Visibility Variable", "Linked File Variable"];
    
    function analyzeHeaderCell(cell, idx){
        var result = {name: '', type: variableLabels[0]};
        if(cell != ''){
            if(cell.charAt(0) == '@'){
                //IMAGE
                cell = cell.substr(1);
                result.type = variableLabels[2];
            } else if(cell.charAt(0) == '#'){
                cell = cell.substr(1);
                //VISIBILITY
                result.type = variableLabels[1];
            } else {
                //TEXTUAL
                result.type = variableLabels[0];
            }
            if(xmlRx.test(cell)){
                result.name = cell;
            } else {
                result.name = "Variable"+(idx+1);
            }
        }
        return result;
    }
    function getDataSetNameDisplayString(currentDataSetNameObj){
        var str = "";
        for(var all in currentDataSetNameObj){
            var field = currentDataSetNameObj[all];
            str += field.text;
        }
        return str;
    }
    function getDataSetNameStringVarNames(dataElements, currentDataSetNameObj){
        var str = "";
        for(var all in currentDataSetNameObj){
            var field = currentDataSetNameObj[all];
            if(field.type.match(/Variable\s[0-9]+\sValue/)){
                var idx = field.type.match(/([0-9]+)/)[0]-1;
                str += dataElements[idx][0].text;
            } else {
                str += field.text;
            }
        }
        return str;
    }

    function getUserDataSetName(currentDataSetNameObj, dataElements){
        function fillOutFieldTexts(currentDataSetNameObj){
            for(var all in currentDataSetNameObj){
                choices[all].dropdown.selection = choices[all].dropdown.find(currentDataSetNameObj[all].type);
                choices[all].text.text = currentDataSetNameObj[all].text;
            }
        }
        function updateDataSetNameDisp(){
            var str = '';
            for(var all in choices){
                str += choices[all].text.text;
            }
            disp.text = str;
        }
        function toggleEditText(elem, tf){
            if(tf == true){
                elem.removeEventListener('changing', function(){return;});
            } else {
                elem.addEventListener('changing', function(){return;});
            }
        }
        function updateField(dd, etxt){
            var textContent = '';
            switch(dd.selection.text){
                case "Custom Text": textContent = 'CustomText_'+(etxt.order+1);
                break;
                case "Increment" : textContent = 'INC';
                break;
                case "dash" : textContent = '-';
                break;
                case "underscore" : textContent = '_';
                break;
                case "space" : textContent = ' ';
                break;
                case "nothing" : textContent = '';
                break;
                default : textContent = dd.selection.text;
            }
            etxt.text = textContent;
            if(textContent == 'CustomText_'+(etxt.order+1)){
                toggleEditText(etxt, true);
            }
            updateDataSetNameDisp();
        }
        var resObj = {};
        var options = ["Increment", "Custom Text", "dash", "underscore", "space", 'nothing'];
        var variableNames = [];
        for(var x=0; x<dataElements.length; x++){
            variableNames.push("Variable "+(x+1)+" Value");
        }
        options = options.concat(variableNames);
        var choices = {};
        var w = new Window('dialog', "Decide data set names.");
        var inst = w.add('statictext', undefined, dataSetNameInstructions, {multiline: true}); inst.size = [600, 90];
        var p = w.add('group');
        
        var g1 = p.add('panel', undefined, "Field 1");
        var dd_1 = g1.add('dropdownlist', undefined, options); dd_1.selectWell();
        var e1 = g1.add('edittext', undefined, '', {readonly: false}); e1.characters = 20; e1.order = 0;
        e1.addEventListener('changing', function(){return;});
        choices.field1 = {dropdown: dd_1, text: e1};
        e1.parentObj = dd_1.parentObj = choices.field1;
            var plus = p.add('statictext', undefined, '+');
        var g2 = p.add('panel', undefined, "Field 2");
        var dd_2 = g2.add('dropdownlist', undefined, options); dd_2.selectWell();
        var e2 = g2.add('edittext', undefined, '', {readonly: false}); e2.characters = 20; e2.order = 1;
        e2.addEventListener('changing', function(){return;});
        choices.field2 = {dropdown: dd_2, text: e2};
        e2.parentObj = dd_2.parentObj = choices.field2;
            var plus = p.add('statictext', undefined, '+');
        var g3 = p.add('panel', undefined, "Field 3");
        var dd_3 = g3.add('dropdownlist', undefined, options); dd_3.selectWell();
        var e3 = g3.add('edittext', undefined, '', {readonly: false}); e3.characters = 20; e3.order = 2;
        e3.addEventListener('changing', function(){return;});
        choices.field3 = {dropdown: dd_3, text: e3};
        e3.parentObj = dd_3.parentObj = choices.field3;
        var p1 = w.add('group');
        var g4 = p1.add('panel', undefined, "Field 4");
        var dd_4 = g4.add('dropdownlist', undefined, options); dd_4.selectWell();
        var e4 = g4.add('edittext', undefined, '', {readonly: false}); e4.characters = 20; e4.order = 3;
        e4.addEventListener('changing', function(){return;});
        choices.field4 = {dropdown: dd_4, text: e4};
        e4.parentObj = dd_4.parentObj = choices.field4;
            var plus = p1.add('statictext', undefined, '+');
        var g5 = p1.add('panel', undefined, "Field 5");
        var dd_5 = g5.add('dropdownlist', undefined, options); dd_5.selectWell();
        var e5 = g5.add('edittext', undefined, '', {readonly: false}); e5.characters = 20; e5.order = 4;
        e5.addEventListener('changing', function(){return;});
            var plus = p1.add('statictext', undefined, '+');
        choices.field5 = {dropdown: dd_5, text: e5};
        e5.parentObj = dd_5.parentObj = choices.field5;
        var g6 = p1.add('panel', undefined, "Field 6");
        var dd_6 = g6.add('dropdownlist', undefined, options); dd_6.selectWell();
        var e6 = g6.add('edittext', undefined, '', {readonly: false}); e6.characters = 20; e6.order = 5;
        e6.addEventListener('changing', function(){return;});
        choices.field6 = {dropdown: dd_6, text: e6};
        e6.parentObj = dd_6.parentObj = choices.field6;
        
        var disp = w.add('edittext', undefined, '', {readonly: true}); disp.characters = 50; disp.justify = "center";
        disp.text = getDataSetNameDisplayString(currentDataSetNameObj);
        
        for(var all in choices){
            choices[all].text.addEventListener('changing', function(){
                if(this.parentObj.dropdown.selection.text == 'Custom Text'){
                    updateDataSetNameDisp();
                }
            });
            choices[all].dropdown.onChange = function(){
                updateField(this, this.parentObj.text);
            }
        }
        fillOutFieldTexts(currentDataSetNameObj);
    
        var btn_g = w.add('group');
        var btn_ccl = btn_g.add('button', undefined, 'Cancel');
        var btn_ok = btn_g.add('button', undefined, 'OK');
        w.layout.layout();
        
        if(w.show() != 2){
            for(var all in choices){
                resObj[all] = {};
                resObj[all].type = choices[all].dropdown.selection.text;
                resObj[all].text = choices[all].text.text;
            }
            return resObj;
        } else {
            return null;
        }
    }
    function drawIcon(iconArea, variableType){
        var img;
        switch(variableType){
            case "Text Variable": img = ICONS["txt"];
            break;
            case "Visibility Variable": img = ICONS["vis"];
            break;
            case "Linked File Variable": img = ICONS["lnk"];
            break;
            default: img = ICONS["txt"];
        }
        drawFromObjString(img, iconArea);
    }
    function getRecordDataSetName(currentDataSetNameObj, index, row){
        var str = "";
        for(var all in currentDataSetNameObj){
            var field = currentDataSetNameObj[all];
            if(field.type.match(/Variable\s[0-9]+\sValue/)){
                var idx = field.type.match(/([0-9]+)/)[0]-1;
                str += row[idx];
            } else if(field.type == 'Increment'){
                str+= (index+'');
            } else {
                str += field.text;
            }
        }
        return str;
    }
    function checkRowForAllBlanks(row){
        for(var i=0; i<row.length; i++){
            if(row[i] != ''){
                return false;
            }
        }
        return true;
    }
    function getData(dataFile){
        var currentDataSetNameObj = {
            field1: {type: "Custom Text", text: "Record"},
            field2: {type: "space", text: " "},
            field3: {type: "Increment", text: "INC"},
            field4: {type: "nothing", text: ""},
            field5: {type: "nothing", text: ""},
            field6: {type: "nothing", text: ""}
        };
        var bindingFunctionBody = function(prop){
            return function(){
                var doc = app.activeDocument;
                var iniVars = [];
                for(var i=0; i<doc.variables.length; i++){
                    iniVars.push(doc.variables[i]);
                }
                for(var i=0; i<iniVars.length; i++){
                    var thisVar = iniVars[i];
                    var name = thisVar.name;
                    try{
                        if(prop != 'tag'){
                            if(thisVar.kind == VariableKind.TEXTUAL){
                                for(var j=0; j<doc.textFrames.length; j++){
                                    var item = doc.textFrames[j];
                                    if(item[prop] == name){
                                        item.contentVariable = thisVar;
                                    }
                                }
                            } else if(thisVar.kind == VariableKind.IMAGE){
                                for(var j=0; j<doc.placedItems.length; j++){
                                    var item = doc.placedItems[j];
                                    if(item[prop] == name){
                                        item.contentVariable = thisVar;
                                    }
                                }
                            } else if(thisVar.kind == VariableKind.VISIBILITY){
                                for(var j=0; j<doc.pageItems.length; j++){
                                    var item = doc.pageItems[j];
                                    if(item[prop] == name){
                                        item.visibilityVariable = thisVar;
                                    }
                                }
                            }
                        } else if(prop == 'tag'){
                            for(var j=0; j<doc.tags.length; j++){
                                var thisTag = doc.tags[j];
                                if(thisTag.name == name){
                                    var item = thisTag.parent;
                                    if(thisVar.kind == VariableKind.TEXTUAL){
                                        item.contentVariable = thisVar;
                                    } else if(thisVar.kind == VariableKind.IMAGE){
                                        item.contentVariable = thisVar;
                                    } else if(thisVar.kind == VariableKind.VISIBILITY){
                                        item.visibilityVariable = thisVar;
                                    }
                                }
                            }
                        }
                    } catch(e){
                        continue;
                    }
                }
            }
        }
        var bindingFunctions = {
            "Bind by Name":  bindingFunctionBody('name'),
            "Bind by Note": bindingFunctionBody('note'),
            "Bind by Tag": bindingFunctionBody('tag'),
            "No Auto-Binding": "No Auto-Binding"
        };
        function toggleVariableSetup(tf){
            for(var i=0; i<g2.children.length; i++){
                var fieldText = analyzeHeaderCell(toplineArr[i], i);
                var thisPanel = g2.children[i];
                var dd = thisPanel.children[0].children[1].children[1];
                dd.selection = dd.find(fieldText.type);
                dd.enabled = tf;
                var e = thisPanel.children[0].children[0].children[1];
                if(tf == false){
                    e.text = fieldText.name;
                    e.addEventListener('click', function(){return});
                    e.addEventListener('changing', function(){
                        this.text = analyzeHeaderCell(toplineArr[this.order], this.order).name;
                        return;
                    });
                } else {
                    e.removeEventListener('click', function(){return});
                    e.removeEventListener('changing', function(){
                        this.text = analyzeHeaderCell(toplineArr[this.order], this.order).name;
                        return;
                    });
                }
            }
        }
        var df = dataFile;
        var type = df.displayName.match(/(\.txt$|\.csv$)/)[0];
        var splitter = (type == '.txt')? '\t' : ',';
        df.open('r');
        var everyRowRaw = CSV.parse(df.read(), undefined, splitter);
        df.close();
        
        var everyRow = [];
        for(var i=0; i<everyRowRaw.length; i++){
            // get rid of empty rows
            var thisRawRow = everyRowRaw[i];
            if(!checkRowForAllBlanks(thisRawRow)){
                if(i > 0){
                    if(thisRawRow.length < everyRow[0].length){
                        var diff = everyRow[0].length - thisRawRow.length;
                        for(var d=0; d<diff; d++){
                            thisRawRow.push("");
                        }
                    }
                }
                everyRow.push(thisRawRow);
            }
        }
        var toplineArr = everyRow[0];
        var columnCount = toplineArr.length;
        
        var variableRecordsArr = [];
        var dataSetRecordsArr = [];
        var xmlDest = File(Folder.desktop+"/VariableImporterData_"+new Date().getTime()+".xml");
        
        var w = new Window('dialog', "Import "+type+" Options.", undefined, {closeButton: true});
        w.spacing = 4;
        var g1 = w.add('group'); g1.orientation = 'row'; g1.size = [376, 40];
        var ch1 = g1.add('checkbox', undefined, "First row has column titles."); ch1.value = true;
        var sep = g1.add('group'); sep.size = [156, 5];
        var btn_help = g1.add('button', undefined, "?"); btn_help.size = [30, 30];
        btn_help.onClick = function(){
            quickView(instructions);
        }
        var g2_wrap = w.add('group'); g2_wrap.alignChildren = "top";
        var g2 = g2_wrap.add('panel', undefined, "Column Names");
        var addScroll = false;
        var ht = 0;
        var heightLocked = false;
        var dataElements = [];
        var scrollBarHt;
        
        for(var i=0; i<toplineArr.length; i++){
            ht += 106;
            var thisCell = toplineArr[i];
            var thisVarObj = analyzeHeaderCell(thisCell, i);
            var ag = g2.add('panel'); ag.orientation = 'row'; ag.alignChildren = 'left'; ag.spacing = 2; ag.margins = [2,2,2,2]; ag.size = [320, 100];
            var wrap = ag.add('group'); wrap.orientation = 'column'; wrap.alignChildren = "left";
            var ag1 = wrap.add('group'); ag1.margins = [0, 0, 4, 0];
            var lbl1 = ag1.add('statictext', undefined, "Variable Name");
            var ae = ag1.add('edittext', undefined, thisVarObj.name);
            if(AIversion === 15){
                ae.characters = 21;
            } else {
                ae.characters = 15;
            }
            ae.order = i;
            var ag2 = wrap.add('group');  ag2.margins = [0, 0, 4, 0];
            var lbl2 = ag2.add('statictext', undefined, "Variable Type");
            var ad = ag2.add('dropdownlist', undefined, variableLabels); ad.size = [165, 20]; ad.selectWell();
            ad.selection = ad.find(thisVarObj.type);
            
            var ag3_wrap = wrap.add('group');  ag3_wrap.margins = [0, 0, 4, 0]; ag3_wrap.orientation = 'stack';
            var ag3 = ag3_wrap.add('group');
            var ag4 = ag3_wrap.add('group');
            var orderText = ag4.add('statictext', undefined, "Variable Name "+(i+1));
            if(ad.selection.text == "Linked File Variable"){
                ag3.visible = true;
                ag4.visible = false;
            } else {
                ag3.visible = false;
                ag4.visible = true;
            }
            // perhaps it's a good idea to refer to children of a group via attaching them as properties of the group- for assigning handlers later.
            ag3.pathCh = ag3.add('checkbox', undefined, 'Prepend Path'); ag3.pathCh.value = false;
            ag3.pathCh.helpTip = "Add a folder path to the beginning of each cell, if Linked File column contains only file names. (case-sensitive, Linked Files only)";
            ag3.pathDisp = ag3.add('edittext', undefined, '', {readonly: true}); ag3.pathDisp.characters = 14;
            ag3.fillerGroup = ag4;
            if(AIversion === 15){
                ag3.pathDisp.characters = 19;
            } else {
                ag3.pathDisp.characters = 14;
            }
            ad.pathGr = ag3;

            ag3.pathCh.onClick = function(){
                // CC2014: value assigned during click. Changing states will effect new state in this handler.
                if(this.value == false){
                    this.parent.pathDisp.text = "";
                } else {
                    var fld = Folder(Folder.desktop).selectDlg("Choose a folder to add the folder path to Linked File names.");
                    if(fld != null){
                        this.parent.pathDisp.text = decodeURI(fld.fsName);
                    } else {
                        this.parent.pathDisp.text = "";
                        this.value = false;
                    }
                }
            }

            var icn = ag.add('panel'); icn.size=[45,45];
            icn.iconTypeElem = ad;
            ad.iconElem = icn;

            icn.onDraw = function(){
                drawIcon(this, this.iconTypeElem.selection.text);
            }
            ae.addEventListener('changing', function(){
                    
                if(!xmlRx.test(this.text)){
                    alert(xmlWarning);
                    this.text = "Variable"+(this.order+1);
                }
                dsn_disp.text = getDataSetNameStringVarNames(dataElements, currentDataSetNameObj);
            });
            ad.onChange = function(){
                this.iconElem.hide();
                this.iconElem.show();
                // (this.selection.text == "Linked File Variable") ? this.pathGr.enabled = true : this.pathGr.enabled = false;
                if(this.selection.text == "Linked File Variable"){
                    this.pathGr.visible = true;
                    this.pathGr.fillerGroup.visible = false
                } else {
                    this.pathGr.visible = false;
                    this.pathGr.fillerGroup.visible = true;
                }
            }
            
            dataElements.push([ae, ad, ag3]);
            if(i > 2){
                addScroll = true;
            }
            if(ht > 300 && heightLocked == false){
                g2.size = [345, ht+30];
                scrollBarHt = ht;
                heightLocked = true;
            }
        }
        if(addScroll){
            var sc = g2_wrap.add('scrollbar');
            sc.size = [22, scrollBarHt+25];
            sc.onChange = sc.onChanging = function(){
                for(var i=0; i<g2.children.length; i++){
                    var thisPanel = g2.children[i];
                    var xLoc = thisPanel.originalLocation[0];
                    var yLoc = thisPanel.originalLocation[1];
                    thisPanel.location=[xLoc, yLoc-((this.value/100) * (ht - (scrollBarHt-15)))];
                    // Basically, move the top of each of the panels from its original value to the percentage of the
                    // scrollbar value times the total height of all the panels, minus  the height of the container window (parent viewport), minus a compensation buffer.
                }
            }
        }
        
        var g3 = w.add('group');
        var g_dsn = g3.add('panel', undefined, "Data Set Names"); g_dsn.size = [376, 80]; g_dsn.spacing = 2;
        var g_dsn1 = g_dsn.add('group'); g_dsn1.orientation = "row";
        var btn_dsn = g_dsn1.add('button', undefined, 'Assign');
        var lbl_dsn = g_dsn1.add('statictext', undefined, '(first record\'s name displayed)');
        var dsn_disp = g_dsn.add('edittext', undefined, "Record INC", {readonly: true}); dsn_disp.characters = 33; dsn_disp.justify = "center";
        
        var g_xmlOpts = w.add('panel', undefined, "XML Options");  g_xmlOpts.size = [376, 80]; g_xmlOpts.spacing = 2;
        var g_xmlOpts_1 = g_xmlOpts.add('group'); g_xmlOpts_1.orientation = "row";
        var ch_xml = g_xmlOpts_1.add('checkbox', undefined, 'Keep XML');
        var btn_xml = g_xmlOpts_1.add('button', undefined, "XML File");
        var g_xmlOpts_2 = g_xmlOpts.add('group'); g_xmlOpts_2.orientation = "column";
        var xml_disp = g_xmlOpts_2.add('edittext', undefined, decodeURI(xmlDest), {readonly: true}); xml_disp.characters = 33;
        
        var g4 = w.add('group');
        var g_ab = g4.add('panel', undefined, "Auto-Binding"); g_ab.size = [376, 55]; g_ab.spacing = 2;
        var dd_ab = g_ab.add('dropdownlist', undefined, ["No Auto-Binding","Bind by Name","Bind by Note","Bind by Tag"]);
        dd_ab.selection = dd_ab.items[0]; dd_ab.selectWell();
        
        var btn_g = w.add('group');
        var btn_ccl = btn_g.add('button', undefined, 'Cancel');
        var btn_ok = btn_g.add('button', undefined, 'OK');
        
        btn_xml.onClick = function(){
            var dest = xmlDest.saveDlg("Where to save the XML file?");
            if(dest != null){
                xml_disp.text = decodeURI(dest);
                xmlDest = dest;
            }
        }
        btn_dsn.onClick = function(){
            var res = getUserDataSetName(currentDataSetNameObj, dataElements);
            if(res != null){
                currentDataSetNameObj = res;
                dsn_disp.text = getDataSetNameStringVarNames(dataElements, currentDataSetNameObj);
            }
        }
        ch1.onClick = function(){
            toggleVariableSetup(!this.value);
            dsn_disp.text = getDataSetNameStringVarNames(dataElements, currentDataSetNameObj);
        }
        w.onShow = function(){
            toggleVariableSetup(false);

            for(var i=0; i<g2.children.length; i++){
                var thisPanel = g2.children[i];
                thisPanel.originalLocation = [thisPanel.location[0], thisPanel.location[1]];
            }
        }
        if(w.show() ==2){
//~             alert("Cancelled");
            return null;
        } else {
            for(var i=0; i<dataElements.length; i++){
                variableRecordsArr.push({
                    data: dataElements[i][0].text,
                    variableType: dataElements[i][1].selection.text,
                    prependPath: dataElements[i][2].pathCh.value,
                    url: dataElements[i][2].pathDisp.text
                });
            }
                
            var start = (ch1.value == true) ? 1 : 0;
            var counter = 1;
            for(var i=start; i<everyRow.length; i++){
                var thisRawRow = everyRow[i];
                
                var thisRow = [];
                for(var j=0; j<thisRawRow.length; j++){
                    thisRow.push(trimString(thisRawRow[j]));
                }
                var dataSetName = getRecordDataSetName(currentDataSetNameObj, counter++, thisRow);
                dataSetRecordsArr.push({name: dataSetName, dataRow: thisRow});
            }

            return {
                variableRecords: variableRecordsArr,
                dataSetRecords: dataSetRecordsArr,
                dataFile: df, dataFileType: type,
                keepXml: ch_xml.value,
                xmlDest: xmlDest,
                bindingFunction: bindingFunctions[dd_ab.selection.text]
            };
        }
    }
    if(app.documents.length > 0){
        var doc = app.activeDocument;
        if(doc.dataSets.length == 0 || (doc.dataSets.length > 0 &&
            confirm("Warning, there are datasets already present in document '"+doc.name+"', they shall be removed.\nContinue?"))){
            var fileMatch = (os == 'Mac') ? function(f){return f instanceof Folder || (f instanceof File && f.displayName.match(/(\.txt$|\.csv$)/));} : '*.txt;*.csv';
            var dataFile = File.openDialog("Choose a tab-delimited, or commma-separated (.csv) data file.", fileMatch);
            if(dataFile != null){
                dataFile  = File(dataFile.fsName.replace("file://", ""));
                var allRecords = getData(dataFile);
                //example: allRecords.variableRecords[i] == {data: dataElements[i][0].text, variableType: dataElements[i][1].selection.text}
                if(allRecords != null){
                    if(doc.dataSets.length > 0){
                        doc.dataSets.removeAll();
                    }
                    
                    var problem = '';
                    try{
                        var xmlDest = allRecords.xmlDest;
                        var keepXML = allRecords.keepXml;
                        var myXMLString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"+"\r"+
                            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 20001102//EN\"    \"http://www.w3.org/TR/2000/CR-SVG-20001102/DTD/svg-20001102.dtd\" ["+"\r"+
                            "	<!ENTITY ns_graphs \"http://ns.adobe.com/Graphs/1.0/\">"+"\r"+
                            "	<!ENTITY ns_vars \"http://ns.adobe.com/Variables/1.0/\">"+"\r"+
                            "	<!ENTITY ns_imrep \"http://ns.adobe.com/ImageReplacement/1.0/\">"+"\r"+
                            "	<!ENTITY ns_custom \"http://ns.adobe.com/GenericCustomNamespace/1.0/\">"+"\r"+
                            "	<!ENTITY ns_flows \"http://ns.adobe.com/Flows/1.0/\">"+"\r"+
                            "<!ENTITY ns_extend \"http://ns.adobe.com/Extensibility/1.0/\">"+"\r"+
                            "]>"+"\r"+
                            "<svg>"+"\r"+
                            "<variableSets  xmlns=\"&ns_vars;\">"+"\r"+
                            "	<variableSet  locked=\"none\" varSetName=\"binding1\">"+"\r"+
                            "		<variables>"+"\r"+
                            "PUT_VARIABLES_HERE"+
                            "		</variables>"+"\r"+
                            "		<v:sampleDataSets xmlns=\"http://ns.adobe.com/GenericCustomNamespace/1.0/\" xmlns:v=\"http://ns.adobe.com/Variables/1.0/\">"+"\r"+
                            "PUT_DATASETS_HERE"+
                            "		</v:sampleDataSets>"+"\r"+
                            "	</variableSet>"+"\r"+
                            "</variableSets>"+"\r"+
                            "</svg>";
                        var dictVars= {
                            "Text Variable" : {trait: "textcontent", category: "&ns_flows;"},
                            "Visibility Variable" : {trait: "visibility", category: "&ns_vars;"},
                            "Linked File Variable": {trait: "fileref", category: "&ns_vars;"}
                        };
                        // set up the variables from a single record
                        problem = "Making variables group XML string";
                        var variablesGroup = XML("<root></root>");
                        for(var i=0; i<allRecords.variableRecords.length; i++){
                            var cell = allRecords.variableRecords[i];
                            var newVariable = XML('<variable></variable>');
                            var thisVarType = dictVars[cell.variableType];
                            for(var all in thisVarType){
                                newVariable['@'+all] = thisVarType[all];
                            }
                            newVariable['@varName'] = cell.data;
                            variablesGroup.appendChild(newVariable);
                        }

                        var variablesGroupString = variablesGroup.toString().replace(/&amp;/g,"&").replace(/(<root>|<\/root>)/g,'');
                        
                        problem = "Making data set group XML string";
                        var dataSetsGroup = XML("<root></root>");
                        for(var i=0; i<allRecords.dataSetRecords.length; i++){
                            var thisDataSet = allRecords.dataSetRecords[i];
//~                             alert(thisDataSet.toSource());
                            var dataSet = XML("<sampleDataSet></sampleDataSet>");
                            dataSet.setNamespace("v");
                            dataSet['@dataSetName'] = thisDataSet.name;
                            for(var j=0; j<allRecords.variableRecords.length; j++){
                                var thisVar = allRecords.variableRecords[j];
                                var thisVarName = thisVar.data;
                                var thisVarContent = stringXmlSafe(thisDataSet.dataRow[j]);
                                var thisVarXML;
                                if(thisVar.variableType == variableLabels[0]){
                                    // deal with Text
                                    var paraCount = 1;
                                    var paragraphTextArr, paragraphText;
                                    var returnChars = thisVarContent.match(/\n/g);
                                    if(returnChars != null){
                                        paraCount = returnChars.length+1;
                                        paragraphTextArr = thisVarContent.split(/\n/g);
                                    } else {
                                        paragraphTextArr = [thisVarContent];
                                    }
                                    thisVarXML = XML("<"+thisVarName+"></"+thisVarName+">");
                                    for(var q=0; q<paragraphTextArr.length; q++){
                                        var thisText = paragraphTextArr[q];
                                        if(paragraphTextArr.length > 1 && q == 0 || q == paragraphTextArr.length-1){
                                            if(q == 0 && thisText.match(/^&quot;/)){
                                                thisText = thisText.replace(/^&quot;/,'');
                                            } else if(q == paragraphTextArr.length-1 && thisText.match(/&quot;$/)){
                                                thisText = thisText.replace(/&quot;$/,'');
                                            }
                                        }

                                        if(thisText.replace(/\s+/g,'') == ''){
                                            paragraphText = wrapCDATA("\n", "p");
                                            paragraphText['@xml:space'] = "preserve";
                                            // this does not work in creating a blank line.
                                        } else {
                                            paragraphText = XML("<p>"+thisText+"</p>");
                                        }
                                        thisVarXML.appendChild(paragraphText);
                                    }
                                } else {
                                    if(thisVar.variableType == variableLabels[1]){
                                        // deal with visibility
                                        thisVarContent = thisVarContent.replace(/(^\s+|\s+$)/g,'').toLowerCase();
                                        if(thisVarContent !== 'true' && thisVarContent !== 'false'){
                                            thisVarContent = (thisVarContent == '') ? 'false' : 'true';
                                        }
                                    } else if(thisVar.variableType == variableLabels[2] && thisVar.prependPath){
                                        // deal with linked files when checked to prepend a path
                                        var folderDiv = (os == "Windows")? "\\" : "/";
                                        thisVarContent = thisVar.url+folderDiv+thisVarContent;
                                    }
                                    thisVarXML = XML("<"+thisVarName+">"+thisVarContent+"</"+thisVarName+">");
                                }
                                dataSet.appendChild(thisVarXML);
                            }
                            dataSetsGroup.appendChild(dataSet);
                        }
                        var dataSetsGroupString = dataSetsGroup.toString().replace(/xmlns:v="v" /g,'').replace(/(<root>|<\/root>)/g,'');

                        myXMLString = (myXMLString.replace("PUT_DATASETS_HERE", dataSetsGroupString).replace("PUT_VARIABLES_HERE", variablesGroupString));
                        
                    } catch(e){
                        quickView("Error making XML string:\r"+e+"\rPossible problem: "+problem);
                        return;
                    }

                    try{
                        var myXMLFile = File(xmlDest);
                        myXMLFile.encoding = "UTF-8";
                        myXMLFile.open('w');
                        myXMLFile.write(myXMLString);
                        myXMLFile.close();
                        doc.importVariables(myXMLFile);

                        if(!keepXML){
                            myXMLFile.remove();
                        }
                        alert("Data Sets imported from "+allRecords.dataFileType+" file '"
                            +decodeURI(allRecords.dataFile.name)+"' has "+allRecords.variableRecords.length+" variable names and "+
                            allRecords.dataSetRecords.length+" records.");

                        if(allRecords.bindingFunction != "No Auto-Binding"){
                            var temp = app.documents.add();
                            temp.close(SaveOptions.DONOTSAVECHANGES);
                            // ^^^this is needed to make sure these bindings will stick.
                            allRecords.bindingFunction();
                        }
                    } catch(e){
                        alert("Error in processing of  '"+decodeURI(myXMLFile.name)+"' :\r"+e);
                    }
                }
            }
        }
    } else {
        alert("Please create or open an Illustrator document into which to import variables.");
    }
}

VariableImporter();
