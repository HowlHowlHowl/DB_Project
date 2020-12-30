process.umask(0);
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

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


