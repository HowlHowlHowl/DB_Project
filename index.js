var fertilizzanti = [];
var pesticidi = [];
var mangimi = [];

var new_tuple = {};

/* form management functions */

function getTable() {
    let index = $('#tables').val();
    $.ajax({
        url: '/table/' + index,
        data: JSON.stringify(form),
        success: (data) => {
            displayTable(data);
        },
        error: (e) => {

        }
    });
}
function displayTable(table) {
    let db_table = document.createElement('table');
    let thead = document.createElement('thead');
    db_table.appendChild(
        thead.innerHTML(
            getHeader(table)
        )
    );
    let tbody = document.createElement('tbody');
    table.forEach((element) => {
        let tr = document.createElement(tr);
        Object.keys(element).forEach((key) => {
            tr.innerHTML(tr.innerHTML() + '<td>' + element[key] + '</td>');	
        });
        tbody.appendChild(tr);
    });
    db_table.appendChild(tbody);
}
function getHeader(table) { 
    let header = '';
    Object.keys(table[0]).forEach((key) => {
        header += '<th>' + key + '</th>';
    });
    let tr = document.createElement('tr');
    return tr.innerHTML(header);
}

function changeTypeMP() {
    let type_mp = $('#tipologia').val();
    if(type_mp == 'animale') {
        pesticidi = []; fertilizzanti = [];
        $('#div_fertilizzanti').remove();
        $('#div_pesticidi').remove();
        if(!$('div_mangimi').length > 0){
            $('#parameters').append(`
            <div id="div_mangimi">
            <form id="form_mangimi">
                <p> Aggiungi i mangimi utilizzati per la materia prima inserita </p>
                <div class="form-group">
                    <label for="mangime">Nome</label>
                    <input type="text" class="form-control" id="mangime" placeholder="">
                </div>
                <div class="form-group">
                    <label for="quantita">Quantità di mangime utilizzata</label>
                    <input type="text" class="form-control" id="quantita" placeholder="">
                </div>
                <input type="submit" value="Aggiungi">
            </form>
            <ul id="lista_mangimi"></ul>
            </div>`);
        }
    }
    if(type_mp == 'vegetale') {
        mangimi = [];
        $('#div_mangimi').remove();
        if(!$('div_fertilizzati').length > 0){
            $('#parameters').append(`
            <div id="div_fertilizzanti">
            <form id="form_fertilizzanti">
                <p> Aggiungi i fertilizzanti utilizzati per la materia prima inserita </p>
                <div class="form-group">
                    <label for="fertilizzante">Nome</label>
                    <input type="text" class="form-control" id="fertilizzante" placeholder="">
                </div>
                <div class="form-group">
                    <label for="quantita_fert">Quantità di fertilizzante utilizzata</label>
                    <input type="text" class="form-control" id="quantita_fert" placeholder="">
                </div>
                <input type="submit" value="Aggiungi">
            </form>
            <ul id="lista_fertilizzanti"></ul>
            </div>`);
            $('#parameters').append(`
            <div id="div_pesticidi">
            <form id="form_pesticidi">
                <p> Aggiungi i pesticidi utilizzati per la materia prima inserita </p>
                <div class="form-group">
                    <label for="pesticida">Nome</label>
                    <input type="text" class="form-control" id="pesticida" placeholder="">
                </div>
                <div class="form-group">
                    <label for="quantita_pesticida">Quantità di pesticida utilizzata</label>
                    <input type="text" class="form-control" id="quantita_pesticida" placeholder="">
                </div>
                <input type="submit" value="Aggiungi">
            </form>
            <ul id="lista_pesticidi"></ul>
            </div>`);
        }
    }
}
function changeForm() {
    let table = $('#tables').val();

    /* remove additional forms */
    $('#div_mangimi').remove();
    $('#div_fertilizzanti').remove();
    $('#div_pesticidi').remove();
    /* clear arrays */
    fertilizzanti = []; pesticidi = []; mangimi = [];

    $('#form_mangimi').remove();
    if(table =='produttore' || table =='fornitore' || table=='azienda_trasporti') {
        $('#form').html(`<div class="form-group">
            <label for="partita_iva">P.I.</label>
            <input type="text" class="form-control" id="partita_iva" placeholder="11111111111">
            </div>
            <div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" class="form-control" id="nome" placeholder="">
            </div>
            <div class="form-group">
                <label for="ragione_sociale">Ragione sociale</label>
                <input type="text" class="form-control" id="ragione_sociale" placeholder="Bianchi & Rossi S.a.s.">
            </div>`);
    }
    else if(table == 'prodotto') {
        $('#form').html(`<div class="form-group">
            <label for="EAN">Codice EAN</label>
            <input type="text" class="form-control" id="ean" placeholder="1111111111111">
            </div>
            <div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" class="form-control" id="nome" placeholder="Mozzarella">
            </div>
            <div class="form-group">
                <label for="peso">Peso</label>
                <input type="text" class="form-control" id="peso" placeholder="200g">
            </div>
            <div class="form-group">
                <label for="data">Data</label>
                <input type="text" class="form-control" id="data" placeholder="30/12/2020">
            </div>
            <div class="form-group">
                <label for="azienda_trasporti">Azienda di trasporto</label>
                <input type="text" class="form-control" id="azienda_trasporti" placeholder="">
            </div>
            <div class="form-group">
                <label for="tipo_trasporto">Tipo di trasporto</label>
                <input type="text" class="form-control" id="tipo_trasporto" placeholder="">
            </div>
            <div class="form-group">
                <label for="package">Package</label>
                <input type="text" class="form-control" id="package" placeholder="">
            </div>
            <div class="form-group">
                <label for="produttore">Azienda produttrice</label>
                <input type="text" class="form-control" id="azienda_produttrice" placeholder="">
            </div>`);
    }
    else if(table == 'materia_prima') {
        $('#form').html(`<div class="form-group">
            <div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" class="form-control" id="nome" placeholder="">
            </div>
            <div class="form-group">
                <label for="luogo">Luogo</label>
                <input type="text" class="form-control" id="peso" placeholder="">
            </div>
            <div class="form-group">
                <label for="tipologia">Tipologia</label>
                <select id="tipologia">
                    <option value="-">-</option>
                    <option value="animale">Animale</option>
                    <option value="vegetale">Vegetale</option>
                </select>
            </div>
            <div class="form-group">
                <label for="q_terra">Superficie di terreno utilizzata</label>
                <input type="text" class="form-control" id="q_terra" placeholder="">
            </div>
            <div class="form-group">
                <label for="q_acqua">Quantità di acqua</label>
                <input type="text" class="form-control" id="q_acqua" placeholder="">
            </div>
            <div class="form-group">
                <label for="CO2">Quantità di gas serra prodotta (CO2 eq.)</label>
                <input type="text" class="form-control" id="CO2 placeholder="">
            </div>
            <div class="form-group">
                <label for="fornitore">Fornitore</label>
                <input type="text" class="form-control" id="fornitore" placeholder="">
            </div>`);
    }
    else if(table == 'package') {
        $('#form').html(`<div class="form-group">
            <label for="codice">Codice package</label>
            <input type="text" class="form-control" id="codice" placeholder="">
            </div>
            <div class="form-group">
                <label for="tipo">Tipo</label>
                <input type="text" class="form-control" id="tipo" placeholder="">
            </div>
            <div class="form-group">
                <label for="materiale">Materiale utilizzato</label>
                <input type="text" class="form-control" id="materiale" placeholder="">
            </div>
            <div class="form-group">
                <label for="volume">Volume occupato</label>
                <input type="text" class="form-control" id="volume" placeholder="">
            </div>
            <div class="form-group">
                <label for="peso">Peso del package</label>
                <input type="text" class="form-control" id="azienda_trasporti" placeholder="">
            </div>`);
    }
    else if(table == 'procedura_lavorazione') {
        $('#form').html(`<div class="form-group">
            <label for="tipo">Tipologia di lavorazione</label>
            <input type="text" class="form-control" id="tipo" placeholder="">
            </div>
            <div class="form-group">
                <label for="CO2">Quantità di gas serra prodotta (CO2 eq.)</label>
                <input type="text" class="form-control" id="CO2" placeholder="">
            </div>
            <div class="form-group">
                <label for="q_acqua">Quantità di acqua</label>
                <input type="text" class="form-control" id="q_acqua" placeholder="">
            </div>`);
    }
    else if(table == 'fertilizzante' || table == 'pesticida') {
        $('#form').html(`<div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" class="form-control" id="nome" placeholder="">
            </div>
            <div class="form-group">
                <label for="acidificazione">Valore di acidificazione</label>
                <input type="text" class="form-control" id="CO2" placeholder="">
            </div>
            <div class="form-group">
                <label for="eutrofizzazione">Valore di eutrofizzazione</label>
                <input type="text" class="form-control" id="eutrofizzazione" placeholder="">
            </div>`);
    }
    else if(table == 'mangime') {
        $('#form').html(`<div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" class="form-control" id="nome" placeholder="">
            </div>
            <div class="form-group">
                <label for="componente">Componente principale</label>
                <input type="text" class="form-control" id="componente" placeholder="farine di cereali">
            </div>`);
    }
    $('#form').append('<input type="submit" value="Inserisci elemento">');
}
function insertElement() {
    let table = $('#tables').val();
    switch (table) {
        case "materia_prima":
            insertRaw();
            break;
        case "prodotto":
            insertProduct();
            break;
        default:
            insert();
            break;
    }
}
function insert() {
    $('body inpyut[type="text"]').each((input) => {
        new_tuple[input.id]=input.val();
    });
}
function insertRaw() {
    let type_mp = $('#tipologia').val();
    if(type_mp=="vegetale") {
        new_tuple['mangime'] = mangimi; 
    } else {
        new_tuple['fertilizzanti'] = fertilizzanti;
        new_tuple['pesticidi'] = pesticidi;
    }
    insert();
}
$(document).on('change','#tipologia', () =>{
    this.changeTypeMP();
});

$(document).on('submit','#form_mangimi',  (event) =>{
    event.preventDefault();
    mangimi.push({mangime: $('#mangime').val(), quantita: $('#quantita').val()});
    $("#lista_mangimi").html("");
    mangimi.forEach( (item) => {
        $("#lista_mangimi").append(`<li> ${item.mangime} ${item.quantita}</li>`)
    })
    $('#form_mangimi')[0].reset();
});

$(document).on('submit','#form_fertilizzanti', (event) =>{
    event.preventDefault();
    fertilizzanti.push({fertilizzante: $('#fertilizzante').val(), quantita: $('#quantita_fert').val()});
    $("#lista_fertilizzanti").html("");
    fertilizzanti.forEach( (item) => {
        $("#lista_fertilizzanti").append(`<li> ${item.fertilizzante} ${item.quantita}</li>`)
    })
    $('#form_fertilizzanti')[0].reset();
});

$(document).on('submit','#form_pesticidi', (event) =>{
    event.preventDefault();
    pesticidi.push({pesticida: $('#pesticida').val(), quantita: $('#quantita_pesticida').val()});
    $("#lista_pesticidi").html("");
    pesticidi.forEach( (item) => {
        $("#lista_pesticidi").append(`<li> ${item.pesticida} ${item.quantita}</li>`)
    })
    $('#form_pesticidi')[0].reset();
});
