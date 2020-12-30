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

function ins_azienda(az){
	db.run(`INSERT INTO ${az.table} (partita_iva, nome, ragione_sociale)
			VALUES(?,?,?)`,[az.partita_iva,az.nome,az.ragione_sociale], (err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
}

function ins_prod(prod){
	//to avoid parallel execution
	db.serialize(()=>{
		db.run(`INSERT INTO ${prod.table} (EAN, nome, valore_di_impatto, peso, data, azienda_trasporti, tipo_trasporto, CO2, package, produttore)
			VALUES(?,?,?,?,?,?,?,?,?,?)`,[prod.EAN,prod.nome,prod.valore_di_impatto,prod.peso,prod.data,prod.azienda_trasporti,prod.tipo_trasporto,
				prod.CO2,prod.package,prod.produttore],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
		})
		db.run(`INSERT INTO composizione (nome_materia_prima, luogo_materia_prima, prodotto, quantita)
				VALUES(?,?,?,?)`,[prod.nome_materia_prima,prod.luogo_materia_prima,prod.EAN,prod.quantita],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
		})
		db.run(`INSERT INTO lavorazione (prodotto, procedura_lavorazione)
				VALUES(?,?)`,[prod.EAN,prod.procedura_lavorazione],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
		})
	})
}

function ins_matprima(mat){
	db.run(`INSERT INTO ${mat.table} (nome, luogo, tipologia, qTerra, qAcqua, CO2, fornitore)
			VALUES(?,?,?,?,?,?,?)`,[mat.nome,mat.luogo,mat.tipologia,mat.qTerra,mat.qAcqua,mat.CO2,mat.fornitore],
			(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
	//if exists some relationships with 'fertilizzante' and 'pesticida'
	if(mat.tipologia === 'vegetale'){
		db.serialize(()=>{
			if(mat.fertilizzanti.length != 0){
				mat.fertilizzanti.forEach(fert => {
					db.run(`INSERT INTO utilizzo_fertilizzante (nome_materia_prima, luogo_materia_prima, fertilizzante, quantita)
						VALUES(?,?,?,?)`,[mat.nome,mat.luogo,fert.nome,fert.quantita],(err)=> {
						if (err) {
							console.log(err);
							res.status(500).end();
						}
					})
				});
			}
			if(mat.pesticidi.length != 0){
				mat.pesticidi.forEach(pest => {
					db.run(`INSERT INTO utilizzo_pesticida (nome_materia_prima, luogo_materia_prima, pesticida, quantita)
						VALUES(?,?,?,?)`,[mat.nome,mat.luogo,pest.nome,pest.quantita],(err)=> {
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
		if(mat.mangimi.length != 0){
			mat.mangimi.forEach(mang => {
				db.run(`INSERT INTO alimentazione (nome_materia_prima, luogo_materia_prima, mangime, quantita)
					VALUES(?,?,?,?)`,[mat.nome,mat.luogo,mang.nome,mang.quantita],(err)=> {
					if (err) {
						console.log(err);
						res.status(500).end();
					}
				})
			});
		}
	}			
}

//route to insert data into tables
app.post('/insertData', (req,res) =>{
	let dati = JSON.parse(req.body.content);
	
	dati.forEach(el => {
		switch(el.table){
			//same attributes for these 3 cases
			case 'produttore':
			case 'fornitore':
			case 'azienda_trasporti':
				ins_azienda(el);
				break;
			case 'prodotto':
				ins_prod(el);
				break;
			case 'materia_prima':
				ins_matprima(el);
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


