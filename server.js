process.umask(0);
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

//open or create the db file
let db = new sqlite3.Database(path.join(__dirname,'prova.db'),(err) => {
	if (err) {
    		console.log(err,__dirname);
  	}
  	else{
		console.log('Connected to the database.');		
	} 
});

app.get('/', (req,res) =>{
	res.status(200).sendFile(path.join(__dirname,'index.html'));

})

app.get('/example', (req,res) =>{
	let tmp = [];
	db.all('SELECT * FROM tasks', [], (err, rows) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		}
		rows.forEach((row) => {
	  		tmp.push(row);
		});
	
		res.json(tmp);
	});
})

app.listen(8000, ()=>{
	console.log("Server is listening");
});

/* close the database connection
db.close((err) => {
  if (err) {
     console.log(err);
	  return;
  }
  console.log('Close the database connection.');
});
*/

  /*Esempio di inserimento dati in tabella
  db.run('INSERT INTO tasks (name, description, isComplete, projectId) VALUES (?, ?, ?, ?)',[name,description,isComplete,projectId], function (err) {
	  if (err) {
		 console.log(err)
	  } else {
		 console.log("Aggiunto valore");
	  }
  })*/
