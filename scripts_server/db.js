var fs = require('fs');
var mysql = require('mysql');             // Datenbank

/*
 MySQL: Database Connection
 */

var db = mysql.createConnection(
    {
        host: 'localhost',
        port: 8889,							// Standard: 3306, bei MAMP: 8889
        user: 'root',						// Standard: root
        password: 'root',					// Standard: root
        database: 'dropdown_test'
    });
db.connect();


/*
 MySQL-Operationen
 */


/*
 // START: Datenbank vorbefüllen zum Entwickeln
 */


// destroy old db
db.query('DROP DATABASE IF EXISTS dropdown_test', function (err) {
    if (err) console.log("Probably no connection to database");
});

// create database
db.query('CREATE DATABASE IF NOT EXISTS dropdown_test', function (err) {
    if (err) console.log("Could not create a new database");
});

// Use this database
db.query('USE dropdown_test');

// create tables

var createTable_sweets =
        "create table IF NOT EXISTS sweets(" +
        "   sweets_id integer not null auto_increment," +
        "   description varchar(100)," +
        "   examples varchar(100)," +
        "   primary key (sweets_id)" +
        ");";

var createTable_visuals =
        "create table IF NOT EXISTS visuals(" +
        "   visuals_id integer not null auto_increment," +
        "   img varchar(100)," +
        "   primary key (visuals_id)" +
        ");";

var createTable_sweets_visuals =
        "create table IF NOT EXISTS sweets_visuals(" +
        "   sweets_id integer," +
        "   visuals_id integer," +
        "   primary key (sweets_id, visuals_id)," +
        "   foreign key (sweets_id) references sweets(sweets_id)," +
        "   foreign key (visuals_id) references visuals(visuals_id)" +
        ");";

db.query(createTable_sweets, function (err) {
    if (err) console.log("Could not create table sweets");
});

db.query(createTable_visuals, function (err) {
    if (err) console.log("Could not create table visuals");
});

db.query(createTable_sweets_visuals, function (err) {
    if (err) console.log("Could not create table sweets_visuals");
});


// Pre-fill table
var insert_sweets = "insert into sweets (sweets_id, description, examples) values " +
                    "(1, 'Bubble Gum', 'Hubba Bubba, Wrigleys, Orbit')," +
                    "(2, 'Chocolate', 'Milka, Ritter Sport, Lindt')," +
                    "(3, 'Bonbons', 'TicTac, Nimm2')," +
                    "(4, 'Jelly Bears', 'Trolli, Haribo, Katjes');";

var insert_visuals = "insert into visuals (visuals_id, img) values " +
                     "(1, 'Kaugummis.mp4')," +
                     "(2, 'TicTac.jpg')," +
                     "(3, 'Mint_Dragees.mp4')," +
                     "(4, 'Milka.jpg')," +
                     "(5, 'Ritter.mp4')," +
                     "(6, 'Nimm2.jpg')," +
                     "(7, 'Gummibärchen.jpg')," +
                     "(8, 'Trolli.mp4');";

var insert_sweets_visuals = "insert into sweets_visuals (sweets_id, visuals_id) values " +
                            "(1, 1)," +
                            "(1, 3)," +
                            "(2, 4)," +
                            "(2, 5)," +
                            "(3, 2)," +
                            "(3, 6)," +
                            "(4, 7)," +
                            "(4, 8);";

db.query(insert_sweets, function (err) {
    if (err) console.log("Could not insert values into table sweets");
});

db.query(insert_visuals, function (err) {
    if (err) console.log("Could not insert values into table visuals");
});

db.query(insert_sweets_visuals, function (err) {
    if (err) console.log("Could not insert values into table sweets_visuals");
});



queries = {
    query_1: "SELECT distinct sweets.sweets_id, sweets.description, sweets.examples FROM sweets;",

    query_n: "SELECT distinct sweets.sweets_id, visuals.visuals_id, visuals.img " +
             "FROM sweets, visuals, sweets_visuals " +
             "WHERE sweets.sweets_id = sweets_visuals.sweets_id " +
             "and visuals.visuals_id = sweets_visuals.visuals_id ",

    insertSweets: "insert into sweets (description, examples) values (?,?)",
    insertVisuals: "insert into visuals (img) values (?)"
}


/*
 Read data from 3 tables (1:n relationship) and save into JSON
 */

// selected_query_n,  id_t1_query_n,  id_t2_query_n

function query_1_n(query_1, query_n, selected_query_n, id_t1_query_n, id_t2_query_n, file) {

    // Fetch all datasets (rows) from table_n
    function getTableN(callback) {
        db.query(query_n, function (err, rows) {
            if (err) console.log("Could not read from table_n.");
            else allData_n = rows;
            callback();
        });
    };


    // Fetch all datasets (rows) from table_1
    function getTable1_mergeN() {

        db.query(query_1, function (err, rows) {
            if (err) console.log("Could not read from table_1.");
            else {
                // Tasks for each row of table_1:
                for (var i = 0; i < rows.length; i++) {

                    //console.log(i + 1 + ". row of table_1 " + JSON.stringify(rows[i])); //
                    // Fetch all datasets (rows) of table_n which match to this dataset of table_1
                    function getFields() {
                        var output = [];
                        for (var j = 0; j < allData_n.length; ++j) {
                            // WHERE table_1.id = table_n.id -> pick all the data in table_n matching to this row of
                            // table_1

                            if (i + 1 == allData_n[j][id_t1_query_n]) {
                                var visuals = {}; // create new empty inner object img
                                visuals.visuals_id = allData_n[j][id_t2_query_n]; // add properties to inner object
                                // -> pick all the data in table_n matching to this row of table 1
                                visuals.img = allData_n[j][selected_query_n];
                                output.push(visuals); // this data packet will later be added to an array
                            }
                        }
                        return output;
                    }

                    var match_n = getFields();
                    //console.log("Datasets from table_n matching to this dataset of table_1: "
                    // JSON.stringify(match_n)); //

                    // Add a property "img" to this dataset (row) of table_1 whose value will be the array match_n
                    rows[i].visuals = match_n;
                }
                //console.log("Composed Array with both tables: " + JSON.stringify(rows)); //


                // Save composed array ("rows") as JSON-File. The client will pick the data from there.
                var outputFilename = './public/json/' + file;
                fs.writeFile(outputFilename, JSON.stringify(rows), function (err) {
                    if (err) console.log("SELECT query could not be saved to JSON file.");
                });
            }
        });
    };
    // First get entries from table_n, then use them to merge with table_1
    getTableN(getTable1_mergeN);
}


updateJSON();
function updateJSON() {
//        Query table_1,   Query table_n    selected_query_n,  id_t1_query_n,  id_t2_query_n, output file
    query_1_n(queries.query_1, queries.query_n, "img", "sweets_id", "visuals_id", "sweets.json");
}



/*
 Update Database (2 tables and 1 bridge table) and JSON-File
 e.g. when upload form was submitted
 */

function addEntry(table1, table2, bridgetable, table1_insert, table2_insert, table1_val1, table2_val1, table1_val2, table2_val2, table1_val3, table2_val3, table1_val4, table2_val4, table1_val5, table2_val5) {

    function insert_maintables(callback) {
        var table1_id;
        var table2_ids = [];
        var isCallbackReady = false;

        db.query(eval(table1_insert), [table1_val1, table1_val2, table1_val3, table1_val4, table1_val5], function (err) {
            if (err) console.log("Could not insert data into table 1: " + table1);
            if (!err) {
                db.query("SELECT MAX(" + table1 + "_id) as maxID FROM " + table1, function (err, rows) { // get Last inserted ID
                    if (err) console.log("Could not get the ID of table 1: " + table1);
                    if (!err) {
                        table1_id = rows[0].maxID;
                        triggerCallback();
                        isCallbackReady = true;
                    }
                });
            }
        });

        var count_2 = 0;
        insert_table2();
        function insert_table2() {

            if (table2_val1[count_2] == undefined) { // if no visual was uploaded
                updateJSON();
                //console.log("No visual uploaded");
            }
            else { //
                db.query(eval(table2_insert), [table2_val1[count_2], table2_val2, table2_val3, table2_val4, table2_val5], function (err) {
                    if (err) console.log("Could not insert data into table 2: " + table2);
                    if (!err) {
                        db.query("SELECT MAX(" + table2 + "_id) as maxID FROM " + table2, function (err, rows) { // get Last inserted ID
                            if (err) console.log("Could not get the ID of table 2: " + table2);
                            if (!err) {
                                table2_ids.push(rows[0].maxID);
                                count_2++;
                                if (count_2 < table2_val1.length)insert_table2();
                                if (count_2 >= table2_val1.length) {
                                    triggerCallback();
                                    isCallbackReady = true;
                                }
                            }
                        });
                    }
                });
            }
        }

        function triggerCallback() {
            if (isCallbackReady == true) {
                callback(table1_id, table2_ids);
                isCallbackReady = false;
            }
        }
    }

    function insert_bridgetable(table1_id, table2_ids) {
        for (var count_bridge = 0; count_bridge < table2_ids.length; count_bridge++) {
            db.query("insert into " + bridgetable + " (" + table1 + "_id, " + table2 + "_id) values (?,?)", [table1_id, table2_ids[count_bridge]], function (err, res) {
                if (err) console.log("Could not insert into bridge table: " + bridgetable);

                updateJSON();
            });
        }
    }

    insert_maintables(insert_bridgetable);
};



/*
 add visual
 */

function addVisual(table_n, table_1, bridgetable, column_n, uploadedVisual, id_1, callback) {

    dbOperation(function () {
        callback();
    });

    function dbOperation(nextTask) {
        insert_tableN(insert_bridgetable);

        function insert_tableN(callback) {
            db.query("insert into " + table_n + " (" + column_n + ") values ('" + uploadedVisual + "');", function (err) {
                if (err) console.log("Could not insert data into table 1: " + table_n);
                if (!err) {
                    db.query("SELECT MAX(" + table_n + "_id) as maxID FROM " + table_n, function (err, rows) { // get Last inserted ID
                        if (err) console.log("Could not get the ID of table 1: " + table_n);
                        if (!err) {
                            var id_n = rows[0].maxID;
                            callback(id_n);
                        }
                    });
                }
            });
        }

        function insert_bridgetable(id_n) {
            db.query("insert into " + bridgetable + " (" + table_1 + "_id, " + table_n + "_id) values ('" + id_1 + "','" + id_n + "')", function (err) {
                if (err) console.log("Could not insert into bridge table: " + bridgetable);
                updateJSON();
                nextTask();
            });
        }
    }
};



function updateEntry(table, id, columnName, newEntry, callback) {
    db.query("UPDATE " + table + " SET " + columnName + "='" + newEntry + "' WHERE " + table + "_id=" + id, function (err) {
        if (err) console.log("Could not update description in table " + table);
        if (!err) {
            updateJSON();
            callback();
        }
    });
}



function deleteEntry(table_1, table_n, bridgetable, id_1, id_n, callback) {
    dbOperation(function () {
        callback();
    });

    function dbOperation(nextTask) {
        deleteFromBridgeTable(deleteFromTable_n);

        function deleteFromBridgeTable(callback) {
            // f.e. "DELETE FROM sweets_visuals WHERE sweets_id=? AND visuals_id=?"
            db.query("DELETE FROM " + bridgetable + " WHERE " + table_1 + "_id=" + id_1 + " AND " + table_n + "_id=" + id_n, function (err) {
                if (err) console.log("Could not delete from bridge table " + bridgetable);
                if (!err) callback();
            });
        }

        function deleteFromTable_n() {
            // f.e. "DELETE FROM visuals WHERE visuals_id=?"
            db.query("DELETE FROM " + table_n + " WHERE " + table_n + "_id=" + id_n, function (err) {
                if (err) console.log("Could not delete from " + table_n);
                if (!err) {
                    updateJSON();
                    nextTask();
                }
            });
        }
    }
}




function linkVisual(bridgetable, table_1, table_n, id_1, id_n, callback) {
    db.query("INSERT INTO " + bridgetable + " (" + table_1 + "_id, " + table_n + "_id) VALUES(" + id_1 + "," + id_n + ");", function (err) {
        if (err) {
            callback("fail");
            console.log("Could not set link into " + bridgetable +". Maybe duplicate?");
        }
        if (!err) {
            updateJSON();
            callback("success");
        }
    });
}



// make specific objects available in app index.js or whereever they are required with require(..)
exports.addEntry = addEntry;
exports.updateEntry = updateEntry;
exports.deleteEntry = deleteEntry;
exports.addVisual = addVisual;
exports.linkVisual = linkVisual;



/*
 query_1:
 SELECT distinct sweets.description, sweets.examples
 FROM sweets, visuals, sweets_visuals
 WHERE sweets.sweets_id = sweets_visuals.sweets_id
 and visuals.visuals_id = sweets_visuals.visuals_id

 query2:
 SELECT distinct visuals.img
 FROM sweets, visuals, sweets_visuals
 WHERE sweets.sweets_id = sweets_visuals.sweets_id
 and visuals.visuals_id = sweets_visuals.visuals_id


 UPDATE sweets SET examples="pancake" WHERE sweets_id=1;
 */
