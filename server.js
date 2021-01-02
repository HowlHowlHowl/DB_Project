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
	console.log(el)
	
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
		default: res.status(400).end(); console.log("Tabella non esistente");
	}
	
	res.status(200).end();
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
	switch(number) {
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
		select p.EAN, p.nome, sum(pl.CO2) as CO2_totale, sum(pl.acqua) as acqua_totale
		from (prodotto as p join lavorazione as l on p.EAN = l.prodotto)
			join procedura_lavorazione as pl on l.procedura_lavorazione = pl.tipo
		group by p.EAN
	`, (err, rows) => return_rows(res, err, rows));
}

function query10(res) {
	db.all(`
		select EAN, nome, valore_di_impatto 
		from prodotto
	`, (err, rows) => return_rows(res, err, rows));
}

function query11(res) {
	db.all(`
		select EAN, nome, valore_di_impatto, data
		from prodotto
		where data > date('now', '-1 year')
	`, (err, rows) => return_rows(res, err, rows));
}

function query12(res) {
	db.all(`
		create view materia_f(nome, luogo, eutrofizzazione, acidificazione) as (
			select m.nome, m.luogo, uf.quantita * f.eutrofizzazione,  uf.quantita * f.acidificazione
			from (materia_prima as m join utilizzo_fertilizzante as uf on 
				  m.luogo = uf.luogo_materia_prima and m.nome = uf.nome_materia_prima) join
				  fertilizzante as f on uf.fertilizzante = f.nome
		)

		create view materia_p(nome, luogo, eutrofizzazione, acidificazione) as (
			select m.nome, m.luogo, up.quantita * p.eutrofizzazione,  up.quantita * p.acidificazione
			from (materia_prima as m join utilizzo_pesticida as up on 
				  m.luogo = up.luogo_materia_prima and m.nome = up.nome_materia prima) join
				  pesticida as p on up.pesticida = p.nome
		)

		create view materia_totale_f(nome, luogo, eutrofizzazione_totale, acidificazione_totale) as (
			select nome, luogo, sum(eutrofizzazione), sum(acidificazione)
			from materia_f
			group by nome, luogo
		)
		
		create view materia_totale_p(nome, luogo, eutrofizzazione_totale, acidificazione_totale) as (
			select nome, luogo, sum(eutrofizzazione), sum(acidificazione)
			from materia_p
			group by nome, luogo
		)

		select m.nome, m.luogo, (ifnull(f.eutrofizzazione, 0) + ifnull(p.eutrofizzazione, 0)), 
								(ifnull(f.acidificazione, 0)  + ifnull(p.acidificazione, 0))
		from materia_totale_f as f full outer join materia_totale_p as p on f.nome = p.nome and f.luogo = p.luogo
	`, (err, rows) => return_rows(res, err, rows));
}

function query13(res) {
	db.all(`
		create view max_alimentazione(nome, luogo, quantita) as (
			select nome_materia_prima, luogo_materia_prima, MAX(quantita)
			from alimentazione
			group by nome_materia_prima, luogo_materia_prima
		)

		select a.nome_materia_prima, a.luogo_materia_prima, a.quantita, m.componente
		from (alimentazione as a join max_alimentazione as maxa 
			  on a.nome_materia_prima = maxa.nome and a.luogo_materia_prima = maxa.luogo and a.quantita = maxa.quantita) 
			 join mangime as m on a.mangime = m.name
	`, (err, rows) => return_rows(res, err, rows));
}

function query14(res) {
	db.all(`
		select nome, CO2_trasporto, tipo_trasporto
		from prodotto
	`, (err, rows) => return_rows(res, err, rows));
}

app.listen(8000, ()=>{
	console.log("Server is listening");
});


