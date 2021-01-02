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
	package INT NOT NULL,
	produttore VARCHAR(11) NOT NULL, 
	FOREIGN KEY(azienda_trasporti) REFERENCES azienda_trasporti(partita_iva),
	FOREIGN KEY(package) REFERENCES package(codice),
	FOREIGN KEY(produttore) REFERENCES produttore(partita_iva),
	CHECK(peso>0)
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
)




