process.umask(0);
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let ins_functions = require('./functions').insert_functions;

//open or create the db file
let db = new sqlite3.Database(path.join(__dirname,'db/database.db'),(err) => {
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

app.get('/index.js', (req,res) =>{
	res.status(200).sendFile(path.join(__dirname,'index.js'));
})


//route to insert data into tables
app.post('/insertData', (req,res) =>{
	let el = req.body.content;
	console.log(el);
	
	switch(el.table){
		//same attributes for these 3 cases
		case 'produttore':
		case 'fornitore':
		case 'azienda_trasporti': ins_functions.ins_azienda(el,db,res); break;
		case 'prodotto': ins_functions.ins_prod(el,db,res); break;
		case 'materia_prima': ins_functions.ins_matprima(el,db,res); break;
		case 'package': ins_functions.ins_package(el,db,res); break;
		case 'procedura_lavorazione': ins_functions.ins_proc_lav(el,db,res); break;
		//same attributes for these 2 cases
		case 'fertilizzante':
		case 'pesticida': ins_functions.ins_fert_pest(el,db,res); break;
		case 'mangime': ins_functions.ins_mangime(el,db,res); break;
		default: res.status(400).end(); console.log("Tabella inesistente");
	}
})



function return_rows(res, err, rows) {
	if(err) {
		console.log(err);
		return res.status(400).end();
	}

	return res.json(rows);
}

app.get('/table/:name', (req,res) => {
	let table = req.params.name.replace(/\W/g, '');
	db.all(`select * from ${table}`,
		(err, rows) => return_rows(res, err, rows))
});

app.get('/query/:number', (req, res) => {
	switch(Number(req.params.number)) {
		case  9: query9 (res); break;
		case 10: query10(res); break;
		case 11: query11(res); break;
		case 12: query12(res); break;
		case 13: query13(res); break;
		case 14: query14(res); break;
		default: return res.status(400).end();
	}
});

function query9(res) {
	db.all(`
		select p.EAN, 
			   p.nome as 'Nome', 
			   sum(pl.CO2) as 'CO2 Totale (kg)', 
			   sum(pl.qAcqua) as 'Acqua totale (m3)'
		from (prodotto as p join lavorazione as l on p.EAN = l.prodotto)
			join procedura_lavorazione as pl on l.procedura_lavorazione = pl.tipo
		group by p.EAN
	`, (err, rows) => return_rows(res, err, rows));
}

function query10(res) {
	db.all(`
		select EAN, 
			   nome as 'Nome', 
			   valore_di_impatto as 'Valore di impatto'
		from prodotto
	`, (err, rows) => return_rows(res, err, rows));
}

function query11(res) {
	db.all(`
		select p.EAN as 'EAN', 
			   nome as 'Nome', 
			   k.tipo as 'Tipo package',
			   k.materiale as 'Materiale package',
			   k.volume as 'Volume package (cm3)',
			   k.peso as 'Peso package (kg)'
		from prodotto as p join package as k on p.package = k.codice
	`, (err, rows) => return_rows(res, err, rows));
}

function query12(res) {
	db.all(`
		select u.nome_materia_prima as 'Nome', 
		       u.luogo_materia_prima as 'Luogo', 
			   sum(s.acidificazione * u.quantita) as 'Totale Acidificazione per kg (kg SO2 eq)', 
			   sum(s.eutrofizzazione * u.quantita) as 'Totale Eutrofizzazione per kg (kg PO4 eq)'
		from utilizzo as u join sostanza as s on u.sostanza = s.nome
		group by u.nome_materia_prima, u.luogo_materia_prima
	`, (err, rows) => return_rows(res, err, rows));
}

function query13(res) {
	db.all(`
		select a.nome_materia_prima as 'Nome', 
			   a.luogo_materia_prima as 'Luogo', 
			   a.quantita as 'Quantità (kg)',
			   m.componente as 'Componente'
		from (alimentazione as a join max_alimentazione as maxa 
			  on a.nome_materia_prima = maxa.nome and a.luogo_materia_prima = maxa.luogo and a.quantita = maxa.quantita) 
			 join mangime as m on a.mangime = m.nome
	`, (err, rows) => return_rows(res, err, rows));
}

function query14(res) {
	db.all(`
		select nome as Nome, 
			   tipo_trasporto as 'Tipo trasporto', 
			   CO2_trasporto as 'CO2 trasporto (kg/tkm)',
			   tratta_trasporto as 'Lunghezza tratta (km)',
			   CO2_trasporto * tratta_trasporto * (peso / 1000.0) as 'CO2 per unità di prodotto (kg)'
		from prodotto
	`, (err, rows) => return_rows(res, err, rows));
}


app.listen(8000, ()=>{
	console.log("Server is listening");
});


