CREATE TABLE produttore(
	partita_iva VARCHAR(11) NOT NULL PRIMARY KEY,
	nome VARCHAR(20),
	ragione_sociale VARCHAR(20)
);
CREATE TABLE fornitore(
	partita_iva VARCHAR(11) NOT NULL PRIMARY KEY,
	nome VARCHAR(20),
	ragione_sociale VARCHAR(20)
);
CREATE TABLE azienda_trasporti(
	partita_iva VARCHAR(11) NOT NULL PRIMARY KEY,
	nome VARCHAR(20),
	ragione_sociale VARCHAR(20)
);
CREATE TABLE prodotto(
	EAN VARCHAR(13) NOT NULL PRIMARY KEY,
	nome VARCHAR(20),
	valore_di_impatto DOUBLE NOT NULL,
	peso DOUBLE NOT NULL,
	data DATE NOT NULL ,
	azienda_trasporti VARCHAR(11) NOT NULL,
	tipo_trasporto VARCHAR(20), 
	CO2_trasporto DOUBLE NOT NULL,
	tratta_trasporto DOUBLE NOT NULL,
	package INT NOT NULL,
	produttore VARCHAR(11) NOT NULL, 
	FOREIGN KEY(azienda_trasporti) REFERENCES azienda_trasporti(partita_iva),
	FOREIGN KEY(package) REFERENCES package(codice),
	FOREIGN KEY(produttore) REFERENCES produttore(partita_iva),
	CHECK(peso>0)
	CHECK(tipo_trasporto = 'marittimo' or tipo_trasporto = 'strada' or tipo_trasporto = 'rotaia' or tipo_trasporto = 'aereo')
);
CREATE TABLE package(
	codice INT NOT NULL PRIMARY KEY,
	tipo VARCHAR(20),
	materiale VARCHAR(20),
	volume DOUBLE,
	peso DOUBLE,
	CHECK(peso>0)
);
CREATE TABLE procedura_lavorazione(
    tipo VARCHAR(20) NOT NULL PRIMARY KEY,
	CO2 DOUBLE NOT NULL,
	qAcqua DOUBLE
);
CREATE TABLE lavorazione(
	prodotto VARCHAR(13) NOT NULL,
	procedura_lavorazione VARCHAR(20) NOT NULL,
	FOREIGN KEY(prodotto) REFERENCES prodotto(EAN),
	FOREIGN KEY(procedura_lavorazione) REFERENCES   
           procedura_lavorazione(tipo)
);
 
CREATE TABLE materia_prima(
	nome VARCHAR(20) NOT NULL,
	luogo VARCHAR(20) NOT NULL,
	tipologia VARCHAR(20) NOT NULL,
	qTerra DOUBLE NOT NULL,
	qAcqua DOUBLE NOT NULL,
	CO2 DOUBLE NOT NULL,
	fornitore VARCHAR(11) NOT NULL,
	PRIMARY KEY(nome, luogo),
	CHECK(qAcqua>0),
	CHECK(qTerra>0),
	CHECK(CO2>=0),
	CHECK(tipologia = 'vegetale' or tipologia = 'animale')
	FOREIGN KEY(fornitore) REFERENCES fornitore(partita_iva)
);

CREATE TABLE composizione(
	nome_materia_prima VARCHAR(20) NOT NULL,
	luogo_materia_prima varchar(20) NOT NULL,
	prodotto VARCHAR(13) NOT NULL,
	quantita DOUBLE NOT NULL,
	FOREIGN KEY(nome_materia_prima, luogo_materia_prima) REFERENCES materia_prima(nome, luogo),
	FOREIGN KEY(prodotto) REFERENCES prodotto(ean)
);
 
CREATE TABLE sostanza(
	nome VARCHAR(20) NOT NULL PRIMARY KEY,
	tipo VARCHAR(20) NOT NULL,
	acidificazione DOUBLE NOT NULL,
	eutrofizzazione DOUBLE NOT NULL,
	CHECK(tipo = 'fertilizzante' or tipo = 'pesticida')
);


CREATE TABLE mangime(
	nome VARCHAR(20) NOT NULL PRIMARY KEY,
	componente VARCHAR(20)
);

CREATE TABLE utilizzo(
	nome_materia_prima VARCHAR(20) NOT NULL,
	luogo_materia_prima VARCHAR(20) NOT NULL,
	sostanza VARCHAR(20) NOT NULL,
	quantita DOUBLE NOT NULL,
	FOREIGN KEY (nome_materia_prima, luogo_materia_prima) REFERENCES materia_prima(nome, luogo),
	FOREIGN KEY(sostanza) REFERENCES sostanza(nome),
	PRIMARY KEY(nome_materia_prima, luogo_materia_prima, sostanza),
	CHECK(quantita > 0)
);

CREATE TABLE alimentazione(
	nome_materia_prima VARCHAR(20) NOT NULL,
	luogo_materia_prima VARCHAR(20) NOT NULL,
	mangime VARCHAR(20) NOT NULL,
	quantita DOUBLE NOT NULL,
	FOREIGN KEY (nome_materia_prima, luogo_materia_prima) REFERENCES materia_prima(nome, luogo),
	FOREIGN KEY (mangime) REFERENCES mangime(nome),
	PRIMARY KEY(nome_materia_prima, luogo_materia_prima, mangime),
	CHECK(quantita > 0)
);



create view materia_acid_eutr(nome, luogo, acid, eutr) as
    select  u.nome_materia_prima, 
            u.luogo_materia_prima,
            sum(s.acidificazione * u.quantita),
            sum(s.eutrofizzazione * u.quantita)
    from utilizzo as u join sostanza as s on u.sostanza = s.nome
    group by u.nome_materia_prima, u.luogo_materia_prima;

create view impatto_materia(nome, luogo, acqua, CO2, terra, acid, eutr) as
    select  m.nome, 
            m.luogo, 
            m.qAcqua,
            m.qTerra,
            m.CO2,
			ifnull(mae.acid, 0),
			ifnull(mae.eutr, 0)
    from materia_prima as m left join materia_acid_eutr as mae on m.luogo = mae.luogo and m.nome = mae.nome;

create view impatto_composizione(EAN, acqua, CO2, terra, acid, eutr) as
    select c.prodotto,
            sum(m.acqua * c.quantita),
            sum(m.CO2 * c.quantita),
            sum(m.terra * c.quantita), 
            sum(m.acid * c.quantita), 
            sum(m.eutr * c.quantita)
    from impatto_materia as m join composizione as c on m.luogo = c.luogo_materia_prima and m.nome = c.nome_materia_prima
    group by c.prodotto;

create view impatto_lavorazione(EAN, acqua, CO2) as
    select l.prodotto, sum(pl.CO2), sum(pl.qAcqua)
    from lavorazione as l join procedura_lavorazione as pl on l.procedura_lavorazione = pl.tipo
    group by l.prodotto;

create view impatto_prodotto(EAN, acqua, CO2, terra, acid, eutr) as
    select  p.EAN,
            c.acqua + ifnull(l.acqua, 0), 
            c.CO2 + ifnull(l.CO2, 0) + (p.CO2_trasporto * (p.peso / 1000) * p.tratta_trasporto),
            c.terra,
            c.acid,
            c.eutr
    from (prodotto as p left join impatto_lavorazione as l on p.EAN = l.EAN) join impatto_composizione as c on p.EAN = c.EAN;


create view max_alimentazione(nome, luogo, quantita) as
	select nome_materia_prima, luogo_materia_prima, MAX(quantita)
	from alimentazione
	group by nome_materia_prima, luogo_materia_prima;