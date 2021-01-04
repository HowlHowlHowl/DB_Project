
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
	prod['valore_di_impatto'] = 0;

	//to avoid parallel execution
	db.serialize(()=>{
		db.run(`INSERT INTO ${prod.table} (EAN, nome, valore_di_impatto, peso, data, azienda_trasporti, tipo_trasporto, CO2_trasporto, tratta_trasporto, package, produttore)
			VALUES(?,?,?,?,?,?,?,?,?,?,?)`,[prod.EAN,prod.nome,prod.valore_di_impatto,prod.peso,prod.data,prod.azienda_trasporti,prod.tipo_trasporto,
				prod.CO2,prod.tratta_trasporto,prod.package,prod.produttore],(err)=> {
				if (err) {
					console.log(err);
					res.status(500).end();
				}
		})
		if(prod.materie_prime) {
			prod.materie_prime.forEach( (materia,ind) => {
				db.run(`INSERT INTO composizione (nome_materia_prima, luogo_materia_prima, prodotto, quantita)
					VALUES(?,?,?,?)`,[materia.nome_materia_prima,materia.luogo_materia_prima,prod.EAN,prod[`quantita${ind}`]],(err)=> {
					if (err) {
						console.log(err);
						res.status(500).end();
					}
				})
			})
		}

		if(prod.lavorazioni) {
			console.log(prod.lavorazioni);
			prod.lavorazioni.forEach( (lav) => {
				db.run(`INSERT INTO lavorazione (prodotto, procedura_lavorazione)
						VALUES(?,?)`,[prod.EAN, lav.procedura_lavorazione],(err)=> {
						if (err) {
							console.log(err);
							res.status(500).end();
						}
				}) 
			})
		}

		/* Update score */
		db.run(`
			update prodotto
			set valore_di_impatto = (
				select i.acqua * 1.15e4 +
					   i.CO2 * 8.4e3 +
					   (i.terra * 79) * 1.4e6 +
					   (i.eutr / 1000) * 7.34e-1 +
					   (i.acid / 32) * 5.55e1
				from impatto_prodotto as i
				where i.EAN = ?
			)
			where EAN = ?
		`, [prod.EAN, prod.EAN],  (err)=> {
			if (err) {
				console.log(err);
				res.status(500).end();
			}
		});
	});
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
			if(mat.sostanze){
				mat.sostanze.forEach(sostanza => {
					db.run(`INSERT INTO utilizzo (nome_materia_prima, luogo_materia_prima, sostanza, quantita)
						VALUES(?,?,?,?)`,[mat.nome,mat.luogo,sostanza.nome,sostanza.quantita],(err)=> {
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
		if(mat.mangimi){
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
	db.run(`INSERT INTO sostanza (nome, tipo, acidificazione, eutrofizzazione)
			VALUES(?,?,?,?)`,[obj.nome, obj.table, obj.acidificazione, obj.eutrofizzazione], (err)=> {
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