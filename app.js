// Is MySQL on?

var express = require('express');
var http = require('http');
//var fs = require('fs');
var multer = require('multer');          // File Upload / Middleware zum Parsen von Multipart forms
var db = require('./scripts_server/db.js');             // Datenbank-Operationen
var app = express();
var http = require('http');             //  Die Kurzform für diese beiden Zeilen ist:
var server = http.createServer(app);    //  var server = require('http').Server(app);
var io = require('socket.io')(server);


/*
 Statische externe Dateien liegen im Folder public
 */

app.use(express.static(__dirname + '/public'));


/*
 *File-Upload / multer konfigurieren, damit Files automatisch schon in den richtigen Ordner gespeichert werden.
 */

app.use(multer(
    {
        dest: './public/img/',
        rename: function (fieldname, filename) {
            return filename + Date.now();
        }
    }));


/* AB HIER KOMMEN DIE ROUTEN, DIE DER SERVER IMPLEMENTIERT */

/*
 Lege eine index.html auf den Server -> http://localhost:3000 oder http://localhost:3000/html/index.html
 Die index.html wird oben schon über static freigegeben, deshalb hier nur ein redirect auf die index.html
 */

app.get('/', function (req, res) {
    res.redirect('/html/index.html');
});


/*
 Inhalte aus dem Formular holen und in der Datenbank abspeichern
 */

app.post('/upload', function (req, res) {
    var table1 = "sweets";
    var table2 = "visuals";
    var bridgetable = "sweets_visuals";
    var sql_query4table1 = "queries.insertSweets";
    var sql_query4table2 = "queries.insertVisuals";

    if (req.body.description) var form_description = req.body.description;
    if (req.body.examples) var form_examples = req.body.examples;


    var filenames = [];
    for (var i = 0; i < Object.keys(req.files).length; i++) {
        if (eval("req.files.img" + i)) {  // Extract file names of visuals
            filenames[i] = JSON.stringify(eval("req.files.img" + i + ".name"));
            filenames[i] = filenames[i].substring(1, filenames[i].length - 1);
        }
    }

    // Informationen in die Datenbank eintragen (2 Tabellen + 1 Zwischentabelle): Argumente abwechselnd für beide
    // Tabellen. Nicht besetzte Felder sind null oder werden ausgelassen. 1.Name Tabelle1, 2.Name Tabelle2, 3.Name
    // Zwischentabelle 4.Verweis auf SQL-Befehl für Tabelle1, 5.dasselbe für Tabelle2, 6.table1_val1, 7.table2_val1,
    // 8.table1_val2, 9.table2_val2 ... 15.table2_val5

    db.addEntry(table1, table2, bridgetable, sql_query4table1, sql_query4table2, form_description, filenames, form_examples);
    // mit "/" wird einfach wieder dieselbe Route, also index.html geladen
    res.redirect('/');
});



app.post('/addVisual', function (req, res) {
    var table_n = "visuals";
    var table_1 = "sweets";
    var bridgetable = "sweets_visuals";
    var column_n = "img"
    if (req.files.visual) var uploadedVisual = req.files.visual.name;
    if (req.body.id_1) var id_1 = req.body.id_1;

    db.addVisual(table_n, table_1, bridgetable, column_n, uploadedVisual, id_1,function(){
        //console.log("visual added to db");
    });
    res.redirect('/');
});



/*
 Socket.io
 */

io.on('connection', function (socket) {          // mit dem Param socket (beliebiger Name) wird der anonymen Fkt eine Ref. auf Socket.io weitergegeben.
    socket.on('chat message', function (msg) {   // "on": Empfangen, "emit": Senden;
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });


    // Update Text, see maincontent_new_update.html
    socket.on('update', function (data) {   // "on": Empfangen, "emit": Senden;

        if (data.description){
            var table = "sweets";
            var id = data.id;
            var columnName = "description";
            var newEntry = data.description;
        }
        if (data.examples) {
            var table = "sweets";
            var id = data.id;
            var columnName = "examples";
            var newEntry = data.examples;
        }

        db.updateEntry(table, id, columnName, newEntry, function(){
            setTimeout(function(){
                io.emit('update', "ready");
            },30);
        });
    });

    // Delete from table n, see maincontent_new_update.html
    socket.on('delete', function (data) {

        var id_1 = data.id_1;
        var id_n = data.id_n;
        // table_1, table_n, bridge table, data
        db.deleteEntry("sweets", "visuals", "sweets_visuals", id_1, id_n, function(){
            io.emit('delete', "ready");
        });
    });






    socket.on('linkVisual', function (data) {   // "on": Empfangen, "emit": Senden;
        var bridgetable = "sweets_visuals";
        var table_1 = "sweets";
        var table_n = "visuals";
        var id_1 = data.id_1;
        var id_n = data.id_n;

        db.linkVisual(bridgetable, table_1, table_n, id_1, id_n, function(msg){
            if(msg=="success"){
                setTimeout(function(){
                    io.emit('linkVisual', "ready");
                },30);
            }
            else if(msg=="fail"){
                io.emit('linkVisual', "fail");
            }
        });
    });








});



/*
 Server auf den TCP-Port 3000 legen
 */

server.listen(3000, function () {
    console.log('listening on port 3000');
});