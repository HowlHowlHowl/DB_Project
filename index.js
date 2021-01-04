let already_ins = false;
var obj = {content: {}};

/* form management functions */

function getTable() {
    let opt = $("#selTable option:selected");
    if(!opt || opt.val() == "-")
        return;
    
    let url = "/" + opt.parent("optgroup").attr("route") + "/" + opt.val();

    $.ajax({
        url: url,
        success: (data) => {
            if(data.length > 0) displayTable(data);
            else $('#display').html(`<p style="margin-top:2rem">Nessun dato da visualizzare</p>`)
        },
        error: (e) => {
            console.log(e);
            $('#db_error').show();
        }
    });
}
function displayTable(data) {
    let db_table = document.createElement('table');
    let header = '';
    Object.keys(data[0]).forEach((key) => {
        header += '<th>' + key + '</th>';
    });
    let tr = document.createElement('tr');
    tr.innerHTML = header;
    let thead = document.createElement('thead');
    thead.appendChild(tr);
    db_table.appendChild(thead)
    let tbody = document.createElement('tbody');
    data.forEach((element) => {
        let tr = document.createElement('tr');
        let row = '';
        Object.keys(element).forEach((key) => {
            row += '<td>' + element[key] + '</td>';
        });
        tr.innerHTML = row;
        tbody.appendChild(tr);
    });
    db_table.appendChild(tbody);
    $('#display').html(db_table)
}


function changeTypeMP() {
    let type_mp = $('#tipologia').val();
    if(type_mp == 'animale') {
        $('#div_mangimi').show();
        $('#div_sostanze').hide();
    }
    if(type_mp == 'vegetale') {
        $('#div_mangimi').hide();
        $('#div_sostanze').show();
    }
}

function fillSelect(table) {
    if(table == 'prodotto') {
        $.get( '/table/azienda_trasporti', function( data ) {
            if(data.length > 0) {
                $('#azienda_trasporti').attr('disabled', false);
                $('#azienda_trasporti').html("");
                data.forEach((element) => {
                    $('#azienda_trasporti').append(`<option>${element['nome']} ${element['ragione_sociale']}</option>`);
                })
            }
        });
        $.get( '/table/package', function( data ) {
            if(data.length > 0) {
                $('#package').attr('disabled', false);
                $('#package').html("");
                data.forEach((element) => {
                    $('#package').append(`<option value='${element['codice']}'>${element['codice']} - ${element['tipo']}</option>`);
                })
            }
        });

        $.get('/table/produttore', function( data ) {
            if(data.length > 0) {
                $('#produttore').attr('disabled', false);
                $('#produttore').html("");
                data.forEach((element) => {
                    $('#produttore').append(`<option>${element['nome']} ${element['ragione_sociale']}</option>`);
                })
            }
        });

        $.get('/table/materia_prima', function( data ) {
            if(data.length > 0) {
                $('#materie_prime').html("");
                data.forEach((element, index) => {
                    $('#materie_prime').append(`
                    <div style="margin-right: 2rem; float: left;">
                        <input type="checkbox" id="mat${index}" value="${element['nome']}-${element['luogo']}" onchange="add_required_checkbox(${index})" required>
                        <label for="mat${index}"> ${element['nome']} - ${element['luogo']}</label>
                    </div>
                    <div style="width: 20%;display: flex; margin-bottom: 1rem;">
                        <input type="text" class="form-control" id="quantita${index}" placeholder="0.2">
                    </div>`);
                })
            }
        });

        $.get('/table/procedura_lavorazione', function( data ) {
            if(data.length > 0) {
                $('#lavorazioni').html("");
                data.forEach((element, index) => {
                    $('#lavorazioni').append(`
                    <input type="checkbox" id="lavorazione${index}" value="${element['tipo']}">
                    <label for="lavorazione${index}"> ${element['tipo']}</label><br>`);
                })
            }
        });
    }
    else if(table == 'materia_prima') {
        $.get('/table/fornitore', function( data ) {
            if(data.length > 0) {
                $('#fornitore').attr('disabled', false);
                $('#fornitore').html("");
                data.forEach((element) => {
                    $('#fornitore').append(`<option>${element['nome']} ${element['ragione_sociale']}</option>`);
                })
            }
        });
        
        $.get('/table/mangime', function( data ) {
            if(data.length > 0) {
                $('#mangimi').html("");
                data.forEach((element, index) => {
                    $('#mangimi').append(`
                    <div style="margin-right: 2rem; float: left; ">
                    <input type="checkbox" id="mangime${index}" value="${element['nome']}">
                    <label for="mangime${index}">${element['nome']}</label>
                    </div>
                    <div style="width: 20%;display: flex; margin-bottom: 1rem;">
                        <input type="text" class="form-control" id="quantita_m${index}" placeholder="20">
                    </div>`);
                })
            }
        });

        $.get('/table/sostanza', function( data ) {
            if(data.length > 0) {
                $('#sostanze').html("");
                data.forEach((element, index) => {
                    $('#sostanze').append(`
                    <div style="margin-right: 2rem; float: left;">
                    <input type="checkbox" id="sostanza${index}" value="${element['nome']}">
                    <label for="sostanza${index}">${element['nome']}</label>
                    </div>
                    <div style="width: 20%;display: flex; margin-bottom: 1rem;">
                        <input type="text" class="form-control" id="quantita_s${index}" placeholder="20">
                    </div>`);
                })
            }
        });
    }
}

function changeForm() {
    let table = $('#tables').val();
    $('#info').show();
    $('#db_error').hide();

    /* remove additional forms */
    $('#div_mangimi').remove();
    $('#div_sostanze').remove();
    $('#div_materie_prime').remove();
    $('#div_lavorazione').remove(); 

    if(table == '-') {
        $('#form').html("");
        $('#info').hide();
    }
    else {
        if(table =='produttore' || table =='fornitore' || table=='azienda_trasporti') {
            $('#form').html(`<div class="form-group">
                <label for="partita_iva">P.I.</label>
                <input type="text" class="form-control" id="partita_iva" name="partita_iva" placeholder="08100750010" required>
                </div>
                <div class="form-group">
                    <label for="nome">Nome</label>
                    <input type="text" class="form-control" id="nome" name="nome" placeholder="Rossi & F.lli">
                </div>
                <div class="form-group">
                    <label for="ragione_sociale">Ragione sociale</label>
                    <input type="text" class="form-control" id="ragione_sociale" name="ragione_sociale" placeholder="Bianchi & Rossi S.a.s.">
                </div>`);
        }
        else if(table == 'prodotto') {
            let today =  new Date(); 
            $('#form').html(`<div class="form-group">
                <label for="EAN">Codice EAN</label>
                <input type="text" class="form-control" id="EAN" placeholder="2412345678901" required>
                </div>
                <div class="form-group">
                    <label for="nome">Nome</label>
                    <input type="text" class="form-control" id="nome" placeholder="Mozzarella">
                </div>
                <div class="form-group">
                    <label for="peso">Peso (kg)</label>
                    <input type="text" class="form-control" id="peso" placeholder="0.2" required>
                </div>
                <div class="form-group">	
                    <label for="data">Data</label>	
                    <input type="text" class="form-control" id="data" placeholder="30/12/2020">	
                </div>
                <div class="form-group">
                    <label for="azienda_trasporti">Azienda di trasporto</label>
                    <select id="azienda_trasporti" class="dropdown" disabled required>
                        <option value="">---</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tipo_trasporto">Tipo di trasporto</label>
                    <select id="tipo_trasporto" class="dropdown">
                            <option value="strada">Su strada</option>
                            <option value="rotaia">Su rotaia</option>
                            <option value="marittimo">Marittimo</option>
                            <option value="areo">Aereo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="CO2">Quantità di CO2 emessa per tonnellata-km (kg/tkm)</label>
                    <input type="text" class="form-control" id="CO2" placeholder="0.2" required>
                </div>
                <div class="form-group">
                    <label for="tratta_trasporto">Tratta media del trasporto (km)</label>
                    <input type="text" class="form-control" id="tratta_trasporto" placeholder="100" required>
                </div>
                <div class="form-group">
                    <label for="package">Package</label>
                    <select id="package" class="dropdown" disabled required>
                            <option value="">---</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="produttore">Azienda produttrice</label>
                    <select id="produttore" class="dropdown" disabled required>
                            <option value="-">---</option>
                    </select>
                </div>
            `);
            $('#data').val(String(today.getDate()).padStart(2, '0') + 
                    '/' + String(today.getMonth() + 1).padStart(2, '0') + 
                    '/' + String(today.getFullYear()));
            $('#form').append(`
            <div id="div_materie_prime" style="margin-top: 2rem;">
                <p style="font-weight:bold"> Seleziona le materie prime che compongono il prodotto e specificane la quantità utilizzata (kg)</p>
                <div id="materie_prime">
                <p> Nessuna materia prima disponibile </p>
                </div>
            </div>`);
            
    
            $('#form').append(`
            <div id="div_lavorazione" style="margin-top: 2rem;">
                <p style="font-weight:bold"> Seleziona le lavorazioni necessarie alla produzione </p>
                <div id="lavorazioni">
                <p> Nessuna lavorazione disponibile </p>
                </div>
            </div>`);
        }
        else if(table == 'materia_prima') {
            $('#form').html(`<div class="form-group">
                <div class="form-group">
                    <label for="nome">Nome</label>
                    <input type="text" class="form-control" id="nome" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="luogo">Luogo</label>
                    <input type="text" class="form-control" id="luogo" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="tipologia">Tipologia</label>
                    <select id="tipologia">
                        <option value="animale">Animale</option>
                        <option value="vegetale">Vegetale</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="qTerra">Superficie di terreno utilizzata (m<sup>2</sup>/kg)</label>
                    <input type="text" class="form-control" id="qTerra" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="qAcqua">Quantità di acqua (m<sup>3</sup>/kg)</label>
                    <input type="text" class="form-control" id="qAcqua" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="CO2">Quantità di gas serra prodotta (Kg CO2 eq.)</label>
                    <input type="text" class="form-control" id="CO2" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="fornitore">Fornitore</label>
                    <select id="fornitore" class="dropdown" disabled required>
                        <option value="-">---</option>
                    </select>
                </div>`);

                $('#form').append(`
                    <div id="div_mangimi" style="margin-top: 2rem;" >
                        <p style="font-weight:bold"> Seleziona i mangimi utlizzati e specificane la quantità utilizzata(kg)</p>
                        <div id="mangimi">
                        <p> Nessuna mangime disponibile </p>
                        </div>
                    </div>`);

                $('#form').append(`
                <div id="div_sostanze" style="margin-top: 2rem; display: none">
                    <p style="font-weight:bold"> Seleziona i fertilizzanti/pesticidi e specificane la quantità utilizzata(kg)</p>
                    <div id="sostanze">
                    <p> Nessuna sostanza disponibile </p>
                    </div>
                </div>`);
                
        }
        else if(table == 'package') {
            $('#form').html(`<div class="form-group">
                <label for="codice">Codice package</label>
                <input type="text" class="form-control" id="codice" placeholder="1" required>
                </div>
                <div class="form-group">
                    <label for="tipo">Tipo</label>
                    <input type="text" class="form-control" id="tipo" placeholder="Scatola Tetra Pak">
                </div>
                <div class="form-group">
                    <label for="materiale">Materiale utilizzato</label>
                    <input type="text" class="form-control" id="materiale" placeholder="Cartone">
                </div>
                <div class="form-group">
                    <label for="volume">Volume occupato (cm<sup>3</sup>)</label>
                    <input type="text" class="form-control" id="volume" placeholder="200">
                </div>
                <div class="form-group">
                    <label for="peso">Peso del package (kg)</label>
                    <input type="text" class="form-control" id="peso" placeholder="0.05">
                </div>`);
        }
        else if(table == 'procedura_lavorazione') {
            $('#form').html(`<div class="form-group">
                <label for="tipo">Tipologia di lavorazione</label>
                <input type="text" class="form-control" id="tipo" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="CO2">Quantità di gas serra prodotta (kg CO2 eq.)</label>
                    <input type="text" class="form-control" id="CO2" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="qAcqua">Quantità di acqua (m<sup>3</sup>/kg)</label>
                    <input type="text" class="form-control" id="qAcqua" placeholder="">
                </div>`);
        }
        else if(table == 'fertilizzante' || table == 'pesticida') {
            $('#form').html(`<div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" class="form-control" id="nome" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="acidificazione">Valore di acidificazione (kg SO<sub>2</sub>eq)</label>
                    <input type="text" class="form-control" id="acidificazione" placeholder="" required>
                </div>
                <div class="form-group">
                    <label for="eutrofizzazione">Valore di eutrofizzazione (kg PO<sub>4</sub><sup>3-</sup>eq)</label>
                    <input type="text" class="form-control" id="eutrofizzazione" placeholder="" required>
                </div>`);
        }
        else if(table == 'mangime') {
            $('#form').html(`<div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" class="form-control" id="nome" placeholder="COD M2PL" required>
                </div>
                <div class="form-group">
                    <label for="componente">Componente principale</label>
                    <input type="text" class="form-control" id="componente" placeholder="Farine di cereali">
                </div>`);
        }

        fillSelect(table);

    }
   
}

/* code for insertions */

function insert(table) {
    obj.content['table'] = table;
    $('#form input[type="text"], #form select').each((index, elem) => {
        if(elem.id.startsWith('quantita'));
        obj.content[elem.id] = elem.value;
    });

}

function insertProduct(table) {
    let materie_prime = [], lavorazioni = []; 

    $('#div_materie_prime input[type="checkbox"]').each((index, elem) => {
        if(elem.checked) {
            let mat = elem.value.split("-");
            materie_prime.push({nome_materia_prima: mat[0], luogo_materia_prima: mat[1], quantita: $(`#quantita${index}`).val()});
        }
    })
    $('#div_lavorazione input:checked').each((index, elem) => {
        let lavorazione =  elem.value;
        lavorazioni.push({procedura_lavorazione:lavorazione});
    })
    obj.content['materie_prime'] = materie_prime;
    obj.content['lavorazioni'] = lavorazioni;
}

function insertRaw(table) {
    let mangimi = [], sostanze = [];
    $('#div_mangimi input[type="checkbox"]').each((index, elem) => {
        if(elem.checked) {
            let mangime =  elem.value;
            let quantita = $(`#quantita_m${index}`).val();
            mangimi.push({nome: mangime, quantita: quantita});
        }
    })

    $('#div_sostanze input[type="checkbox"]').each((index, elem) => {
        if(elem.checked) {
            let sostanza =  elem.value;
            let quantita = $(`#quantita_s${index}`).val();
            sostanze.push({nome: sostanza, quantita: quantita});
        }
    })

    if(obj.content['tipologia'] == 'animale')
        obj.content['mangimi'] = mangimi;
    else 
        obj.content['sostanze'] = sostanze;
}

function insertElement(event) {
    event.preventDefault();
    let table = $('#tables').val();
    insert(table);
    
    switch (table) {
        case "prodotto":
            insertProduct(table);
            break;
        case "materia_prima":
            insertRaw(table);
            break;
        default:
            break;
    }

    $.ajax({
        type: "POST",
        url: "/insertData",
        data: obj,
        cache: false,
        success: (data) =>{
            console.log('ok')
        },
        error: function (e) {
            console.log("error",e);
            $('#db_error').show();
        }
    }); 

    $('#form')[0].reset();
    if(table === "prodotto"){
        let today = new Date();
        $('#data').val(String(today.getDate()).padStart(2, '0') + 
                    '/' + String(today.getMonth() + 1).padStart(2, '0') + 
                    '/' + String(today.getFullYear()));
    }
    /* Update table in case the user is watching one that he just inserted into */
    getTable();
}


$(document).on('change','#tipologia', () =>{
    this.changeTypeMP();
});

//add required attribute to the 'quantita' input of the checked checkboxes
function add_required_checkbox(index){
    let el = $(`#mat${index}`);
    //if i check the checkbox
    if(el.is(':checked')){
        $(`#quantita${index}`).prop('required',true);
    }
    else{
        $(`#quantita${index}`).prop('required',false);
    }  

    //At least one materia_prima needs to be selected when a product is inserted
    let mat_prime_checkbox = $("#materie_prime input[type=checkbox]");
    if($("#materie_prime input[type=checkbox]:checked").length > 0){
        mat_prime_checkbox.prop('required',false);
    }else{
        mat_prime_checkbox.prop('required',true);
    }
}

window.onload = function() {
    $('#db_error').hide();
}


