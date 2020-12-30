process.umask(0);
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

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

//route to insert data into tables
app.post('/insertData', (req,res) =>{
	let dati = JSON.parse(req.body.content);
	
	dati.forEach(el => {
		switch(el.table){
			//same attributes for these 3 cases
			case 'produttore':
			case 'fornitore':
			case 'azienda_trasporti':
				db.run(`INSERT INTO ${el.table} (partita_iva, nome, ragione_sociale)
						VALUES(?,?,?)`,[el.partita_iva,el.nome,el.ragione_sociale], (err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				break;
			case 'prodotto':
				//to avoid parallel execution
				db.serialize(()=>{
					db.run(`INSERT INTO ${el.table} (EAN, nome, valore_di_impatto, peso, data, azienda_trasporti, tipo_trasporto, CO2, package, produttore)
						VALUES(?,?,?,?,?,?,?,?,?,?)`,[el.EAN,el.nome,el.valore_di_impatto,el.peso,el.data,el.azienda_trasporti,el.tipo_trasporto,
							el.CO2,el.package,el.produttore],(err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
					})
					db.run(`INSERT INTO composizione (nome_materia_prima, luogo_materia_prima, prodotto, quantita)
							VALUES(?,?,?,?)`,[el.nome_materia_prima,el.luogo_materia_prima,el.EAN,el.quantita],(err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
					})
					db.run(`INSERT INTO lavorazione (prodotto, procedura_lavorazione)
							VALUES(?,?)`,[el.EAN,el.procedura_lavorazione],(err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
					})

				})
				break;
			case 'materia_prima':
				db.run(`INSERT INTO ${el.table} (nome, luogo, tipologia, qTerra, qAcqua, CO2, fornitore)
						VALUES(?,?,?,?,?,?,?)`,[el.nome,el.luogo,el.tipologia,el.qTerra,el.qAcqua,el.CO2,el.fornitore],
						(err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				//if exists some relationships with 'fertilizzante' and 'pesticida'
				if(el.tipologia === 'vegetale'){
					db.serialize(()=>{
						if(el.fertilizzanti.length != 0){
							el.fertilizzanti.forEach(fert => {
								db.run(`INSERT INTO utilizzo_fertilizzante (nome_materia_prima, luogo_materia_prima, fertilizzante, quantita)
									VALUES(?,?,?,?)`,[el.nome,el.luogo,fert.nome,fert.quantita],(err)=> {
									if (err) {
										console.log(err);
										res.status(500).end();
									}
								})
							});
						}
						if(el.pesticidi.length != 0){
							el.pesticidi.forEach(pest => {
								db.run(`INSERT INTO utilizzo_pesticida (nome_materia_prima, luogo_materia_prima, pesticida, quantita)
									VALUES(?,?,?,?)`,[el.nome,el.luogo,pest.nome,pest.quantita],(err)=> {
									if (err) {
										console.log(err);
										res.status(500).end();
									}
								})
							});
						}
					})
				}
				else{
					if(el.mangimi.length != 0){
						el.mangimi.forEach(mang => {
							db.run(`INSERT INTO alimentazione (nome_materia_prima, luogo_materia_prima, mangime, quantita)
								VALUES(?,?,?,?)`,[el.nome,el.luogo,mang.nome,mang.quantita],(err)=> {
								if (err) {
									console.log(err);
									res.status(500).end();
								}
							})
						});
					}
				}
				
				break;
			case 'package':
				db.run(`INSERT INTO ${el.table} (codice, tipo, materiale, volume, peso)
						VALUES(?,?,?,?,?)`,[el.codice,el.tipo,el.materiale,el.volume,el.peso],(err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				break;
			case 'procedura_lavorazione':
				db.run(`INSERT INTO ${el.table} (tipo, CO2, qAcqua)
						VALUES(?,?,?)`,[el.tipo,el.CO2,el.qAcqua], (err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				break;
			//same attributes for these 2 cases
			case 'fertilizzante':
			case 'pesticida':
				db.run(`INSERT INTO ${el.table} (nome, acidificazione, eutrofizzazione)
						VALUES(?,?,?)`,[el.nome,el.acidificazione,el.eutrofizzazione], (err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				break;
			case 'mangime':
				db.run(`INSERT INTO ${el.table} (nome, componente) VALUES(?,?)`,[el.nome,el.componente], (err)=> {
							if (err) {
								console.log(err);
								res.status(500).end();
							}
				})
				break;
			default:
				res.status(400).end();
				console.log("Tabella non esistente");
		}
	});
	
	
	res.status(200).end();

})

app.get('/table/:name', (req,res) => {
	let table = req.params.name.replace(/\W/g, '');
	db.all(`select * from ${table}`, (err, rows) => {
		if(err) {
			console.log(err);
			return res.status(400).end();
		}

		return res.json(rows);
	});
});

app.listen(8000, ()=>{
	console.log("Server is listening");
});


