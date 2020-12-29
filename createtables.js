const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('test.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.run(`
CREATE TABLE Produttore(
    partita_iva     CHAR(13)    PRIMARY KEY,
    nome            CHAR(50), 
    ragione_sociale CHAR(10)
)`);



