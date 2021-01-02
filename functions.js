
/* 
	FUNCTIONS FOR INSERTIONS  
*/
function ins_azienda(az,db,res){
	db.run(`INSERT INTO ${az.table} (partita_iva, nome, ragione_sociale)
			VALUES(?,?,?)`,[az.partita_iva,az.nome,az.ragione_sociale], (err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
}

function ins_prod(prod,db,res){
	//add info
	prod['CO2'] = 0.4;
	prod['valore_di_impatto'] = 10;

	//to avoid parallel execution
	db.serialize(()=>{
		db.run(`INSERT INTO ${prod.table} (EAN, nome, valore_di_impatto, peso, data, azienda_trasporti, tipo_trasporto, CO2_trasporto, package, produttore)
			VALUES(?,?,?,?,?,?,?,?,?,?)`,[prod.EAN,prod.nome,prod.valore_di_impatto,prod.peso,prod.data,prod.azienda_trasporti,prod.tipo_trasporto,
				prod.CO2,prod.package,prod.produttore],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
		})
		prod.materie_prime.forEach( (materia) => {
			db.run(`INSERT INTO composizione (nome_materia_prima, luogo_materia_prima, prodotto, quantita)
				VALUES(?,?,?,?)`,[materia.nome_materia_prima,materia.luogo_materia_prima,prod.EAN,prod.quantita],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
			})
		})
		prod.lavorazioni.forEach( (materia) => {
			db.run(`INSERT INTO lavorazione (prodotto, procedura_lavorazione)
					VALUES(?,?)`,[prod.EAN,prod.procedura_lavorazione],(err)=> {
					if (err) {
						console.log(err);
						res.status(500).end();
					}
			}) 
		})
	})
}

function ins_package(pack,db,res){
	db.run(`INSERT INTO ${pack.table} (codice, tipo, materiale, volume, peso)
			VALUES(?,?,?,?,?)`,[pack.codice,pack.tipo,pack.materiale,pack.volume,pack.peso],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
}

function ins_matprima(mat,db,res){
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
			if(mat.fertilizzanti){
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
			if(mat.pesticidi){
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


function ins_proc_lav(proc,db,res){
	db.run(`INSERT INTO ${proc.table} (tipo, CO2, qAcqua)
			VALUES(?,?,?)`,[proc.tipo,proc.CO2,proc.qAcqua], (err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
}

function ins_fert_pest(obj,db,res){
	db.run(`INSERT INTO ${obj.table} (nome, acidificazione, eutrofizzazione)
			VALUES(?,?,?)`,[obj.nome,obj.acidificazione,obj.eutrofizzazione], (err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
	})
}

function ins_mangime(mang,db,res){
	db.run(`INSERT INTO ${mang.table} (nome, componente) VALUES(?,?)`,[mang.nome,mang.componente], (err)=> {
			if (err) {
				console.log(err);
				res.status(500).end();
			}
	})
}
/* 
	END FUNCTIONS FOR INSERTIONS  
*/

let insert_functions = {
    ins_azienda : ins_azienda,
    ins_prod : ins_prod,
    ins_matprima : ins_matprima,
    ins_package : ins_package,
    ins_proc_lav : ins_proc_lav,
    ins_fert_pest : ins_fert_pest,
    ins_mangime : ins_mangime
}

module.exports = {
    insert_functions
}