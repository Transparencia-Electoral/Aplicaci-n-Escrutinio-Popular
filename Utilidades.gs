function asignarHojasdeCalculoAVerificadores() {
  var hojaDeVerificadores = SpreadsheetApp.getActive().getSheetByName("Verificadores");
  var verificadores = hojaDeVerificadores.getDataRange().getValues();
  for (var nVer = 1 ; nVer < verificadores.length ; nVer++) {
    if (verificadores[nVer][4] == "Acepto las condiciones del servicio") {
      if (verificadores[nVer][8] == "") {
        var modelo = SpreadsheetApp.openById("13k1Cj6VDzFCCnQVpY1n6KMqW00vx35TBqTYuY8SJc88");
        var email = verificadores[nVer][1];
        //var email = "ignaciobaixauli@ignaciobaixauli.com";
        var nombreDeHoja = "Hoja de verificación de actas de "+email;
        var nuevaHoja = modelo.copy(nombreDeHoja);
        var idCarpetaVerificadores = "1SirUrAnUbfs3bhPSWBMJyaTeGo5vTXOg";
        var idNuevaHoja = nuevaHoja.getId();
        var file = DriveApp.getFileById(idNuevaHoja);
        var folder = DriveApp.getFolderById(idCarpetaVerificadores);
        var newFile = file.makeCopy(nombreDeHoja,folder);
        newFile.addEditors([email,"sergio@eleccionestransparentes.org","ignaciobaixauli@ignaciobaixauli.com"]);

        DriveApp.getFileById(idNuevaHoja).setTrashed(true);
        var urlNuevahoja = newFile.getUrl();
        hojaDeVerificadores.getRange(nVer+1, 9).setValue(urlNuevahoja);
        MailApp.sendEmail({
          to: email,
          subject: "Nueva hoja de cálculo de verificaciones",
          htmlBody: "Hola, <br>" +
          "Te ha sido asignada una nueva hoja de verificaciones en " + urlNuevahoja + "<br>" +
          "En el menú de la parte superior (Tarda un poco en salir), selecciona Verificación de actas / Obtener actas para verificar (Tendrás que dar las autorizaciones necesaria, sólo la primera vez que lo ejecutes), y si tienes algún acta por verificar te aparecerá. Piensa que aún estamos de pruebas, tenemos pocas actas y quizá no lleguen para todos. Sube muchas actas a https://www.eleccionestransparentes.org/escrutinios/popular/subida-de-actas y todos tendremos mejores posibilidades de probar el sistema <br>" + 
          "En https://docs.google.com/document/d/1XoANycTvtmDEzYXiAUVSEcYvTvN3_CGEssYRssp8k7o/edit?usp=sharing , tienes el manual de la aplicación por si tienes alguna duda.<br>" +
          "Gracias como siempre por tu esfuerzo y colaboración."
        });
        var nada = "";
      }
    }
  }
  SpreadsheetApp.flush();
}

function obtenerActasVerificadas() {
   var hojaActasSubidas = SpreadsheetApp.getActive().getSheetByName("Actas subidas");
  var hojaVerificadas = SpreadsheetApp.getActive().getSheetByName("Actas verificadas");
  //Bucle por verificador
  var hojaDeVerificadores = SpreadsheetApp.getActive().getSheetByName("Verificadores");
  var verificadores = hojaDeVerificadores.getDataRange().getValues();
  for (var nVer = 1 ; nVer < verificadores.length ; nVer++) {
    var verificador = verificadores[nVer][1];
    var urlHoja = verificadores[nVer][8];
    if (urlHoja != "") {
      var actasVerificadasDeVerificador = SpreadsheetApp.openByUrl(urlHoja).getSheetByName("Actas verificadas").getDataRange().getValues();
      for (var nActa = 1 ; nActa < actasVerificadasDeVerificador.length ; nActa++) {
        var urlFormulario = actasVerificadasDeVerificador[nActa][3];
        var urlFoto = actasVerificadasDeVerificador[nActa][2];
        hojaVerificadas.appendRow([verificador,urlFormulario,urlFoto]);
      }
    }
  }
  SpreadsheetApp.flush();
  //Quitar duplicados
  var rango = hojaVerificadas.getDataRange();
  rango.removeDuplicates();
  SpreadsheetApp.flush();
}

function respuestas() {
  var sheetActas = SpreadsheetApp.getActive().getSheetByName("Actas subidas");
  var sheetRespuestas = SpreadsheetApp.getActive().getSheetByName("Respuestas");
  var urlForm = sheetActas.getFormUrl();
  var form = FormApp.openByUrl(urlForm);
  var respuestas = form.getResponses();
  for (var nRes in respuestas) {
    var respuesta = respuestas[nRes];
    var timestamp = respuesta.getTimestamp();
    var email = respuesta.getRespondentEmail();
    var urlRespuesta = respuesta.getEditResponseUrl();
    sheetRespuestas.appendRow([timestamp,urlRespuesta,email])
  }
}

function crearHojas() {
  var hojaProvincias = SpreadsheetApp.getActive().getSheetByName("Circunscripciones");
  var provincias = hojaProvincias.getDataRange().getValues();
  var idCarpeta = "1O5kYqaVcMk-e_FInEHajF_xnaTY-eG7T";
  var carpeta = DriveApp.getFolderById(idCarpeta);
  //folder.createFile('new Spreadsheet', '', MimeType.GOOGLE_SHEETS);
  for (var nProv = 0 ; nProv < provincias.length ; nProv++) {
    var provincia = provincias[nProv][1];
    var nuevaHoja = SpreadsheetApp.create(provincia);
    var rango = hojaProvincias.getRange(nProv+1, 3);
    rango.setValue(nuevaHoja.getUrl());
    var nada = "";
  }
}

function cargarCandidaturas() {
  var hojaProvincias = SpreadsheetApp.getActive().getSheetByName("Circunscripciones");
  var provincias = hojaProvincias.getDataRange().getValues();
  for (var nProv = 1 ; nProv < provincias.length ; nProv++) {
    var provincia = provincias[nProv][1];
    var urlss = provincias[nProv][2];
    var ss = SpreadsheetApp.openByUrl(urlss);
    //var sheet1 = ss.insertSheet("Mesas");
    //var sheet2 = ss.insertSheet("Actas verificadas");
    var sheet2 = ss.insertSheet("Actas escrutadas");
    //var sheet = ss.insertSheet("Candidaturas");
    var candidaturas = getCandidaturas();
    var candidaturas = candidaturas[provincia]["CONGRESO DE LOS DIPUTADOS"];
    var cabecera = [
      "Foto del acta",
      "Reportar incidencia",
      "Circunscripción",
      "Municipio",
      "Distrito",
      "Sección",
      "Mesa",
      "Censados en la mesa",
      "Votantes en la mesa",
      "Interventores no censados que votan en la mesa",
      "Votos nulos",
      "Votos en blanco"
    ]
    for (var nCan in candidaturas) {
      cabecera.push(candidaturas[nCan].candidatura);
    }
    sheet2.appendRow(cabecera);
    
    var nada = "";
  }
}

function enviarRecuentos() {
  //function guardarVerificacion(form_data) {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();
  var objCircunscripciones = [];
  for (var nCir = 0 ; nCir < circunscripciones.length ; nCir++) {
    objCircunscripciones.push(circunscripciones[nCir][1]);
    objCircunscripciones[circunscripciones[nCir][1]] = {};
    objCircunscripciones[circunscripciones[nCir][1]]["hoja"] = circunscripciones[nCir][2];
  }
  var sheet = SpreadsheetApp.getActive().getSheetByName('Actas recontadas');
  var actas = sheet.getDataRange().getValues();
  var hojasUsadas = [];
  for (var nAct = 2630 ; nAct < actas.length ; nAct++) {
    //Comprobar si el acta no ha sido transferida ya
    var enviada = actas[nAct][32];
    if (!enviada) {                          
      var provincia = actas[nAct][2];
      if (!objCircunscripciones[provincia].hasOwnProperty('hojaRecuentos')) {
        objCircunscripciones[provincia]["hojaRecuentos"] = SpreadsheetApp.openByUrl(objCircunscripciones[provincia]["hoja"]).getSheetByName("Actas escrutadas");
        hojasUsadas.push(objCircunscripciones[provincia]["hojaRecuentos"]);
        var nada = "";
      }
      var hojaRecuentos = objCircunscripciones[provincia]["hojaRecuentos"]; 
      hojaRecuentos.appendRow([actas[nAct][1], 
                               "https://docs.google.com/forms/d/e/1FAIpQLSdCU8djiIGVa0PN9QT_DH5cbZBWk0kWXyo1K0Q3hiZNCim7uA/viewform?usp=pp_url&entry.664129634="+actas[nAct][2]+"&entry.249177396="+actas[nAct][3]+"&entry.936045545="+actas[nAct][4]+"&entry.7355165="+actas[nAct][5]+"&entry.111889479="+actas[nAct][6]+"&entry.16541082="+actas[nAct][1]+"",
                              actas[nAct][2], 
                              actas[nAct][3], 
                              actas[nAct][4], 
                              actas[nAct][5], 
                              actas[nAct][6], 
                              actas[nAct][7], 
                              actas[nAct][8], 
                              actas[nAct][9], 
                              actas[nAct][11], 
                              actas[nAct][12], 
                              actas[nAct][13], 
                              actas[nAct][14], 
                              actas[nAct][15], 
                              actas[nAct][16], 
                              actas[nAct][17], 
                              actas[nAct][18], 
                              actas[nAct][19], 
                              actas[nAct][20], 
                              actas[nAct][21], 
                              actas[nAct][22], 
                              actas[nAct][23], 
                              actas[nAct][24], 
                              actas[nAct][25], 
                              actas[nAct][26], 
                              actas[nAct][27], 
                              actas[nAct][28], 
                              actas[nAct][29], 
                              actas[nAct][30], 
                              actas[nAct][31]
                              ]);
      var rango = sheet.getRange(nAct+1, 33);
      rango.setValue(true);
      SpreadsheetApp.flush();
      var nada = "";
    }
  }
  
  SpreadsheetApp.flush();
}
  
function quitarDuplicados() {  
  //Quitar duplicados
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();
  for (var nHoja = 1 ; nHoja < circunscripciones.length-1 ; nHoja++) {
    var hoja = SpreadsheetApp.openByUrl(circunscripciones[nHoja][2]).getSheetByName('Actas escrutadas');
    var rango = hoja.getDataRange();
    rango.removeDuplicates();
    SpreadsheetApp.flush();
    var nada = "";
  }
}
  
function ordenarHojas() {
  //Ordenar hojas
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();
  for (var nHoja = 1 ; nHoja < circunscripciones.length-1 ; nHoja++) {
    var provincia = circunscripciones[nHoja][1];
    var hoja = SpreadsheetApp.openByUrl(circunscripciones[nHoja][2]).getSheetByName('Actas escrutadas');
    var rangoAOrdenar = hoja.getDataRange();
    var maxCol = rangoAOrdenar.getLastColumn();
    var maxRow = rangoAOrdenar.getLastRow();
    if (maxRow == 1) maxRow = 2;
    var rangoAOrdenar = hoja.getRange(2,1,maxRow-1,maxCol);
    rangoAOrdenar.sort([{column: 3, ascending: true},
                        {column: 4, ascending: true},
                        {column: 5, ascending: true},
                        {column: 6, ascending: true},
                        {column: 7, ascending: true}
                       ]);
    SpreadsheetApp.flush();
    var nada = "";
  }
}

function copiarModelodeHoja() {
  var modelodeHoja = "Almería";
  var modelodeLibro = "https://docs.google.com/spreadsheets/d/1ETJOsQSl5WjHyKf-WOMWf7Itybf_bfOiR5Awvgyz_o8/edit";
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();
  
  var hojaModelo = SpreadsheetApp.openByUrl(modelodeLibro).getSheetByName(modelodeHoja);
  
  for (var nHoja = 1 ; nHoja < circunscripciones.length ; nHoja++) {
    var provincia = circunscripciones[nHoja][1];
    var libro = SpreadsheetApp.openByUrl(circunscripciones[nHoja][2]);
    var hojas = libro.getSheets();
    var modeloenLibro = false;
    for (var nHojaInterna in hojas) {
      var nombredeHoja = hojas[nHojaInterna].getName();
      if (nombredeHoja == modelodeHoja) {
        hojas[nHojaInterna].activate();
        libro.moveActiveSheet(1);       
        modeloenLibro = true;
        break; 
      }    
    }
    if (!modeloenLibro) {
      var nuevaHoja = hojaModelo.copyTo(libro);
      nuevaHoja.setName(modelodeHoja);
      nuevaHoja.activate();
      libro.moveActiveSheet(1);
      var nada = "";
    }
  }
}

function copiarModelodeHojayCambiarUnDato() {
  var modelodeHoja = "Model";
  var modelodeLibro = "https://docs.google.com/spreadsheets/d/1ETJOsQSl5WjHyKf-WOMWf7Itybf_bfOiR5Awvgyz_o8/edit";
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();
  
  var ssModelo = SpreadsheetApp.openByUrl(modelodeLibro);
  var hojaModelo = ssModelo.getSheetByName(modelodeHoja);
  
  for (var nHoja = 1 ; nHoja < circunscripciones.length ; nHoja++) {
    var provincia = circunscripciones[nHoja][1];
    var nuevaHoja = hojaModelo.copyTo(ssModelo);
    //Cambiar nombre a la hoja
    nuevaHoja.setName(provincia);
    //Cambiar celda de referencia
    var rango = nuevaHoja.getRange("B2");
    rango.setValue(["=IMPORTRANGE(\""+circunscripciones[nHoja][2]+"\";\"Resultados!A10:B31\")"]);
    SpreadsheetApp.flush();
    var nada = "";
  }
}

function borraHoja() {
  var modelodeHoja = "Hoja 1";
  
  var sheet = SpreadsheetApp.getActive().getSheetByName('Circunscripciones');
  var circunscripciones = sheet.getDataRange().getValues();

  
  for (var nHoja = 1 ; nHoja < circunscripciones.length ; nHoja++) {
    var provincia = circunscripciones[nHoja][1];
    var libro = SpreadsheetApp.openByUrl(circunscripciones[nHoja][2]);
    var hojas = libro.getSheets();
    var modeloenLibro = false;
    for (var nHojaInterna in hojas) {
      var nombredeHoja = hojas[nHojaInterna].getName();
      if (nombredeHoja == modelodeHoja) {
        libro.deleteSheet(hojas[nHojaInterna]);
        break; 
      }    
    }
    var nada = "";
  }
}

function ponerTamanodeFicheroActasVerificadas() {
  var nombredeHoja = "Actas verificadas";
  var columnaSize = 18;
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombredeHoja);
  var actas = hoja.getDataRange().getValues();
  for (var nAct = 1 ; nAct < actas.length ; nAct++) {
    //for (var nAct = 1 ; nAct < 11 ; nAct++) {
    
    var id = actas[nAct][1];
    if (id != "") {
      var id = id.split("id=")[1];
      var file = Drive.Files.get(id);
      var size = file.fileSize;
      var fila = Number(nAct)+1;
      
      if (actas[nAct][columnaSize-1] == "") {
        var celda = hoja.getRange(fila, columnaSize);
        var size = file.fileSize;
        celda.setValue(size);
        SpreadsheetApp.flush();
        var nada = "";
     }
    }
  }
}

function ponerTamanodeFicheroActasSubidas() {
  var nombredeHoja = "Actas subidas";
  var columnaSize = 14;
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombredeHoja);
  var actas = hoja.getDataRange().getValues();
  for (var nAct = 1 ; nAct < actas.length ; nAct++) {
    //for (var nAct = 1 ; nAct < 11 ; nAct++) {
    
    var id = actas[nAct][1];
    if (id != "") {
      var id = id.split("id=")[1];
      var file = Drive.Files.get(id);
      var size = file.fileSize;
      var fila = Number(nAct)+1;
      
      if (actas[nAct][columnaSize-1] == "") {
        var celda = hoja.getRange(fila, columnaSize);
        var size = file.fileSize;
        celda.setValue(size);
        SpreadsheetApp.flush();
        var nada = "";
     }
    }
  }
}

function getCandidaturas() {
var candidaturas = {
    "ALBACETE": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "ALICANTE": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 5,
                "candidatura": "REPÚBLICA VALENCIANA/PARTIT VALENCIANISTE EUROPEU (RVPVE)"
            },
            {
                "numero": 6,
                "candidatura": "LOS VERDES ECOPACIFISTAS ADELANTE (AVANT ADELANTE LOS VERDES)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 10,
                "candidatura": "FAMILIA Y VIDA (PFyV)"
            },
            {
                "numero": 11,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 12,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 13,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 14,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 15,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 5,
                "candidatura": "LOS VERDES ECOPACIFISTAS ADELANTE (AVANT ADELANTE LOS VERDES)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 9,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 10,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 13,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ]
    },
    "ALMERÍA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "ANDALUCÍA POR SÍ (AxSÍ)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 9,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "ANDALUCÍA POR SÍ (AxSÍ)"
            }
        ]
    },
    "ÁLAVA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA (PSOE) [PSE-EE (PSOE)]"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE EUSKADI/EUSKADIKO"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "BIDEZKO MUNDURANTZ-POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA (PSOE) [PSE-EE (PSOE)]"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE EUSKADI/EUSKADIKO LANGILEEN ALDERDI KOMUNISTA (PCTE/ELAK)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "BIDEZKO MUNDURANTZ-POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "ASTURIAS": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS-XUNÍES PODEMOS (PODEMOS-IX)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR-FORO (PP-FORO)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "ANDECHA ASTUR (ANDECHA)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS-XUNÍES PODEMOS (PODEMOS-IX)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR-FORO (PP-FORO)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "ANDECHA ASTUR (ANDECHA)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ]
    },
    "ÁVILA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 7,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 11,
                "candidatura": "POR ÁVILA (XAV)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 7,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 10,
                "candidatura": "POR ÁVILA (XAV)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            }
        ]
    },
    "BADAJOZ": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 9,
                "candidatura": "EXTREMADURA UNIDA (EXTREMADURA UNIDA)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 9,
                "candidatura": "EXTREMADURA UNIDA (EXTREMADURA UNIDA)"
            }
        ]
    },
    "BALEARES": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)."
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUIB)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "MÉS ESQUERRA (MÉS-ESQUERRA)"
            },
            {
                "numero": 8,
                "candidatura": "MÁS PAÍS (M PAÍS)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUIB)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "MÉS ESQUERRA (MÉS-ESQUERRA)"
            },
            {
                "numero": 8,
                "candidatura": "MÁS PAÍS (M PAÍS)"
            },
            {
                "numero": 9,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 14,
                "candidatura": "MÉS PER MENORCA (MxMe)"
            },
            {
                "numero": 15,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 16,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 17,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUIB)"
            },
            {
                "numero": 18,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 19,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 20,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 21,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 22,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 23,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUIB)"
            },
            {
                "numero": 24,
                "candidatura": "ESQUERRA REPUBLICANA (ESQUERRA)"
            },
            {
                "numero": 25,
                "candidatura": "PARTIDO POPULAR (PP)."
            },
            {
                "numero": 26,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 27,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "BARCELONA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 5,
                "candidatura": "PARTIT POPULAR/PARTIDO POPULAR (PP)"
            },
            {
                "numero": 6,
                "candidatura": "CANDIDATURA D’UNITAT POPULAR-PER LA RUPTURA (CUP-PR)"
            },
            {
                "numero": 7,
                "candidatura": "FAMILIA I VIDA (PFiV)"
            },
            {
                "numero": 8,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 9,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 10,
                "candidatura": "INICIATIVA FEMINISTA (I.Fem)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIT ANIMALISTA CONTRA EL MALTRACTAMENT ANIMAL (PACMA)"
            },
            {
                "numero": 14,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 15,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 16,
                "candidatura": "ESCONS EN BLANC/ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 17,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 18,
                "candidatura": "MÁS PAÍS (MÁS PAÍS)"
            },
            {
                "numero": 19,
                "candidatura": "UNIDOS Actuando por la Democracia (UNIDOS SI-ACPS-DEF)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES (ERC-SOBIRANISTES)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIT POPULAR/PARTIDO POPULAR (PP)"
            },
            {
                "numero": 6,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 7,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 8,
                "candidatura": "INICIATIVA FEMINISTA (I.Fem)"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIT ANIMALISTA CONTRA EL MALTRACTAMENT ANIMAL (PACMA)"
            },
            {
                "numero": 12,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 13,
                "candidatura": "ESCONS EN BLANC/ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 14,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 15,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 16,
                "candidatura": "MÁS PAÍS (MÁS PAÍS)"
            },
            {
                "numero": 17,
                "candidatura": "UNIDOS ACTUANDO POR LA DEMOCRACIA (UNIDOS SI-ACPS-DEF)"
            }
        ]
    },
    "VIZCAYA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA"
            },
            {
                "numero": 3,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE EUSKADI/EUSKADIKO"
            },
            {
                "numero": 6,
                "candidatura": "BIDEZKO MUNDURANTZ/POR UN MUNDO MÁS JUSTO (PUM+J)."
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 9,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO FAMILIA Y VIDA (PFyV)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO DE ACCIÓN SOLIDARIA EUROPEA (SOLIDARIA)"
            },
            {
                "numero": 14,
                "candidatura": "MÁS PAÍS-CANDIDATURA ECOLOGISTA (MÁS PAÍS-CANDIDATURA ECOLOGISTA)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA (PSOE) [PSE-EE (PSOE)]"
            },
            {
                "numero": 3,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE EUSKADI/EUSKADIKO LANGILEEN ALDERDI KOMUNISTA (PCTE/ELAK)"
            },
            {
                "numero": 6,
                "candidatura": "BIDEZKO MUNDURANTZ/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 9,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "MÁS PAÍS-CANDIDATURA ECOLOGISTA (MÁS PAÍS-CANDIDATURA ECOLOGISTA)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO DE ACCIÓN SOLIDARIA EUROPEA (SOLIDARIA)"
            }
        ]
    },
    "BURGOS": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            }
        ]
    },
    "CÁCERES": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "EXTREMADURA UNIDA (EXTREMADURA UNIDA)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "EXTREMADURA UNIDA (EXTREMADURA UNIDA)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "CÁDIZ": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            },
            {
                "numero": 9,
                "candidatura": "ANDALUCÍA POR SÍ (AxSÍ)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 11,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)."
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 7,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            },
            {
                "numero": 8,
                "candidatura": "ANDALUCÍA POR SÍ (AxSÍ)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "CANTABRIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO REGIONALISTA DE CANTABRIA (PRC)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 5,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO REGIONALISTA DE CANTABRIA (PRC)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            }
        ]
    },
    "CASTELLÓN": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIT COMUNISTA DELS POBLES D´ESPANYA (PCPE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 7,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 8,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 9,
                "candidatura": "REPÚBLICA VALENCIANA / PARTIT VALENCIANISTE EUROPEU (RVPVE)"
            },
            {
                "numero": 10,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 11,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 12,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 14,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 15,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "AVANT ADELANTE LOS VERDES (AVANT LOS VERDES)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 7,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIT COMUNISTA DELS POBLES D´ESPANYA (PCPE)"
            },
            {
                "numero": 9,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 13,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 14,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "CIUDAD REAL": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ]
    },
    "CÓRDOBA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 3,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 12,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 13,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "LA CORUÑA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 12,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ]
    },
    "CUENCA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            }
        ]
    },
    "GUIPÚZCOA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA"
            },
            {
                "numero": 3,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 4,
                "candidatura": "ESCAÑOS EN BLANCO-AULKI ZURIAK (EB)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "EUSKADIKO LANGILEEN ALDERDI KOMUNISTA/PARTIDO COMUNISTA DE LOS TRABAJADORES DE EUSKADI (ELAK/PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "BIDEZKO MUNDURANTZ/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "VOX (VOX)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA"
            },
            {
                "numero": 3,
                "candidatura": "EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)"
            },
            {
                "numero": 4,
                "candidatura": "ESCAÑOS EN BLANCO-AULKI ZURIAK (EB)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "EUSKADIKO LANGILEEN ALDERDI KOMUNISTA/PARTIDO COMUNISTA"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "ELKARREKIN PODEMOS-UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "BIDEZKO MUNDURANTZ/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "VOX (VOX)"
            }
        ]
    },
    "GERONA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 2,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 8,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 9,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 10,
                "candidatura": "ESCONS EN BLANC (EB)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR/PARTIT POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 13,
                "candidatura": "CANDIDATURA D’UNITAT POPULAR-PER LA RUPTURA (CUP-PR)"
            },
            {
                "numero": 14,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 15,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 2,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 8,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 9,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 10,
                "candidatura": "ESCONS EN BLANC (EB)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR/PARTIT POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 13,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 14,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "GRANADA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "CONVERGENCIA ANDALUZA (CAnda)"
            },
            {
                "numero": 9,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 11,
                "candidatura": "IZQUIERDA ANTICAPITALISTA REVOLUCIONARIA (IZAR)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 14,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "GUADALAJARA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 12,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 10,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "HUELVA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 6,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ]
    },
    "HUESCA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "UNIDAS PODEMOS-ALTOARAGÓN EN COMÚN"
            },
            {
                "numero": 12,
                "candidatura": "CHUNTA ARAGONESISTA (CHA)"
            },
            {
                "numero": 13,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 14,
                "candidatura": "PUYALON (PYLN)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "UNIDAS PODEMOS-ALTOARAGÓN EN COMÚN (PODEMOS-IU-Alto Aragón en Común)"
            },
            {
                "numero": 12,
                "candidatura": "CHUNTA ARAGONESISTA (CHA)"
            },
            {
                "numero": 13,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 14,
                "candidatura": "PUYALON (PYLN)"
            }
        ]
    },
    "JAÉN": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO REPUBLICANO INDEPENDIENTE SOLIDARIO ANDALUZ (RISA)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO REPUBLICANO INDEPENDIENTE SOLIDARIO ANDALUZ (RISA)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            }
        ]
    },
    "LEÓN": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "FAMILIA Y VIDA (PFyV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "LÉRIDA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 4,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES (ERC-SOBIRANISTES)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "ESCONS EN BLANC/ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIT POPULAR/PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "CANDIDATURA D’UNITAT POPULAR-PER LA RUPTURA (CUP-PR)"
            },
            {
                "numero": 11,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 13,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 14,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 15,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 4,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "ESCONS EN BLANC/ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIT POPULAR/PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 12,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 13,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 14,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            }
        ]
    },
    "LUGO": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 7,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 8,
                "candidatura": "CONVERXENCIA 21 (C 21)"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 11,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 7,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 8,
                "candidatura": "CONVERXENCIA 21 (C 21)"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "MADRID": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 8,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 9,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            }
        ]
    },
    "MÁLAGA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 6,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 5,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            }
        ]
    },
    "MURCIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "DEMOCRACIA PLURAL (DPL)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "SOMOS REGIÓN (SOMOS REGIÓN)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 12,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 14,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 15,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "DEMOCRACIA PLURAL (DPL)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "SOMOS REGIÓN (SOMOS REGIÓN)"
            },
            {
                "numero": 11,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 14,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            }
        ]
    },
    "NAVARRA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "NAVARRA SUMA (NA+)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "GEROA BAI (GBAI)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO / BIDEZKO MUNDURANTZ (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA/ESPANIAKO LANGILEEN ALDERDI KOMUNISTA (PCTE/ELAK)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU-BATZARRE)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "EUSKAL HERRIA BILDU (EH Bildu)"
            },
            {
                "numero": 2,
                "candidatura": "NAVARRA SUMA (NA+)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "GEROA BAI (GBAI)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO / BIDEZKO MUNDURANTZ (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA/ESPANIAKO LANGILEEN ALDERDI KOMUNISTA (PCTE/ELAK)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU-BATZARRE)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            }
        ]
    },
    "ORENSE": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "POR UN MUNDO MÁIS XUSTO POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 7,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 8,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "POR UN MUNDO MÁIS XUSTO POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 6,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "PALENCIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "LAS PALMAS": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 2,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo (AHORA CANARIAS)"
            },
            {
                "numero": 3,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "NUEVA CANARIAS-COALICIÓN CANARIA (NC-CCa-PNC)"
            },
            {
                "numero": 11,
                "candidatura": "LOS VERDES (VERDES)"
            },
            {
                "numero": 12,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 13,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 14,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 15,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 16,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo (AHORA CANARIAS)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 6,
                "candidatura": "COALICIÓN CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO HUMANISTA (PH)"
            },
            {
                "numero": 13,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo (AHORA CANARIAS)"
            },
            {
                "numero": 14,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 15,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 16,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 17,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 18,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 19,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 20,
                "candidatura": "NUEVA CANARIAS-COALICIÓN CANARIA (NC-CCa-PNC)"
            },
            {
                "numero": 21,
                "candidatura": "LOS VERDES (VERDES)"
            },
            {
                "numero": 22,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 23,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 24,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 25,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 26,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 27,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo (AHORA CANARIAS)"
            },
            {
                "numero": 28,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 29,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 30,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 31,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 32,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 33,
                "candidatura": "COALICIÓN CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 34,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 35,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 36,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 37,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 38,
                "candidatura": "VOX (VOX)"
            }
        ]
    },
    "PONTEVEDRA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 10,
                "candidatura": "ESCANOS EN BRANCO (EB)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO COMUNISTA DOS TRABALLADORES DE GALIZA (PCTG)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁIS XUSTO/POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "EN COMÚN-UNIDAS PODEMOS (PODEMOS-EU)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "BLOQUE NACIONALISTA GALEGO (BNG)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSdeG-PSOE)"
            },
            {
                "numero": 10,
                "candidatura": "ESCANOS EN BRANCO (EB)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            }
        ]
    },
    "LA RIOJA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ]
    },
    "SALAMANCA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MáS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 9,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "VOX (VOX)."
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MáS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 8,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO‑TIERRA"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "VOX (VOX)"
            }
        ]
    },
    "SANTA CRUZ DE TENERIFE": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "COALICION CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 6,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 9,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 11,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 12,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo (AHORA CANARIAS)"
            },
            {
                "numero": 13,
                "candidatura": "LOS VERDES (VERDES o LOS VERDES o LV)"
            },
            {
                "numero": 14,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 15,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "AGRUPACIÓN HERREÑA INDEPENDIENTE-COALICIÓN CANARIANUEVA CANARIAS (AHI-CCa-NC)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 9,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 11,
                "candidatura": "COALICIÓN CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 13,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 14,
                "candidatura": "AGRUPACION SOCIALISTA GOMERA (ASG)"
            },
            {
                "numero": 15,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 16,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 17,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 18,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 19,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 20,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 21,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 22,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 23,
                "candidatura": "COALICIÓN CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 24,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 25,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 26,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 27,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 28,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 29,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 30,
                "candidatura": "COALICION CANARIA-NUEVA CANARIAS (CCa-PNC-NC)"
            },
            {
                "numero": 31,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 32,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 33,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 34,
                "candidatura": "MÁS PAÍS-EQUO (MÁS PAÍS-EQUO)"
            },
            {
                "numero": 35,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 36,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 37,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 38,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 39,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 40,
                "candidatura": "AHORA CANARIAS: Alternativa Nacionalista Canaria (ANC) y Unidad del Pueblo"
            },
            {
                "numero": 41,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO CANARIO (PCPC)"
            },
            {
                "numero": 42,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            }
        ]
    },
    "SEGOVIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 3,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 13,
                "candidatura": "CENTRADOS (centrados)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO LIBERTARIO (P-LIB)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO DEMÓCRATA SOCIAL JUBILADOS EUROPEOS (PDSJE)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 11,
                "candidatura": "CENTRADOS (centrados)"
            }
        ]
    },
    "SEVILLA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 8,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 9,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 12,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "ANDALUCÍA POR SÍ (AxSI)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU LV CA)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DEL PUEBLO ANDALUZ (PCPA)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 11,
                "candidatura": "MÁS PAÍS-ANDALUCÍA (MÁS PAÍS-ANDALUCÍA)"
            }
        ]
    },
    "SORIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 2,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 7,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "TARRAGONA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)"
            },
            {
                "numero": 2,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 5,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 9,
                "candidatura": "ESCONS EN BLANC/ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 13,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 14,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 15,
                "candidatura": "CANDIDATURA D’UNITAT POPULAR-PER LA RUPTURA (CUP-PR)"
            },
            {
                "numero": 16,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)"
            },
            {
                "numero": 2,
                "candidatura": "CIUTADANS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 4,
                "candidatura": "ESQUERRA REPUBLICANA DE CATALUNYA-SOBIRANISTES"
            },
            {
                "numero": 5,
                "candidatura": "PER UN MÓN MÉS JUST (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIT COMUNISTA DEL POBLE DE CATALUNYA (PCPC)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "JUNTS PER CATALUNYA-JUNTS (JxCAT-JUNTS)"
            },
            {
                "numero": 9,
                "candidatura": "ESCONS EN BLANC / ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 11,
                "candidatura": "EN COMÚ PODEM-GUANYEM EL CANVI (ECP-GUANYEM EL CANVI)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)"
            },
            {
                "numero": 13,
                "candidatura": "IZQUIERDA EN POSITIVO (IZQP)"
            },
            {
                "numero": 14,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            }
        ]
    },
    "TERUEL": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "UNIÓN DE TODOS (UDT)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 8,
                "candidatura": "AGRUPACIÓN DE ELECTORES «TERUEL EXISTE» (¡TERUEL EXISTE!)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 13,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 14,
                "candidatura": "PUYALON (PYLN)"
            },
            {
                "numero": 15,
                "candidatura": "PARTIDO COMUNISTA OBRERO ESPAÑOL (PCOE)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "UNIÓN DE TODOS (UDT)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 8,
                "candidatura": "AGRUPACIÓN DE ELECTORES «TERUEL EXISTE» (¡TERUEL EXISTE!)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 12,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 13,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 14,
                "candidatura": "PUYALON (PYLN)"
            }
        ]
    },
    "TOLEDO": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 9,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            }
        ]
    },
    "VALENCIA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "REPÚBLICA VALENCIANA/PARTIT VALENCIANISTE EUROPEU (RVPVE)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 7,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 8,
                "candidatura": "SOM VALENCIANS EN MOVIMENT (UIG-SOM-CUIDES)"
            },
            {
                "numero": 9,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 10,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 11,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 12,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 13,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 14,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 15,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 16,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 17,
                "candidatura": "AVANT ADELANTE LOS VERDES (AVANT ADELANTE LOS VERDES)"
            },
            {
                "numero": 18,
                "candidatura": "UNIDOS Actuando por la Democracia (UNIDOS SÍ-ACPS-DEf)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 5,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 6,
                "candidatura": "UNIDAS PODEMOS-UNIDES PODEM (PODEMOS-EUPV)"
            },
            {
                "numero": 7,
                "candidatura": "SOM VALENCIANS EN MOVIMENT (UIG-SOM-CUIDES)"
            },
            {
                "numero": 8,
                "candidatura": "AUNA COMUNITAT VALENCIANA (AUNACV)"
            },
            {
                "numero": 9,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 10,
                "candidatura": "MÉS COMPROMÍS (MÉS COMPROMÍS)"
            },
            {
                "numero": 11,
                "candidatura": "ESQUERRA REPUBLICANA DEL PAÍS VALENCIÀ (ERPV)"
            },
            {
                "numero": 12,
                "candidatura": "CONTIGO SOMOS DEMOCRACIA (CONTIGO)"
            },
            {
                "numero": 13,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 14,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 15,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 16,
                "candidatura": "AVANT ADELANTE LOS VERDES (AVANT ADELANTE LOS VERDES)"
            },
            {
                "numero": 17,
                "candidatura": "UNIDOS Actuando por la Democracia (UNIDOS SÍ-ACPS-DEf)"
            }
        ]
    },
    "VALLADOLID": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "UNIÓN REGIONALISTA DE CASTILLA Y LEÓN (UNIÓN REGIONALISTA)"
            },
            {
                "numero": 4,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 7,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            },
            {
                "numero": 9,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            },
            {
                "numero": 10,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 12,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA"
            },
            {
                "numero": 8,
                "candidatura": "UNIÓN REGIONALISTA DE CASTILLA Y LEÓN (UNIÓN REGIONALISTA)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "FALANGE ESPAÑOLA DE LAS JONS (FE de las JONS)"
            }
        ]
    },
    "ZAMORA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 10,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO REGIONALISTA DEL PAÍS LEONÉS (PREPAL)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "RECORTES CERO-GRUPO VERDE-PARTIDO CASTELLANO-TIERRA COMUNERA (RECORTES CERO-GV-PCAS-TC)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 9,
                "candidatura": "UNIÓN DEL PUEBLO LEONÉS (UPL)"
            },
            {
                "numero": 10,
                "candidatura": "PARTIDO POPULAR (PP)"
            }
        ]
    },
    "ZARAGOZA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 2,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 3,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 4,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 7,
                "candidatura": "MOVIMIENTO ARAGONÉS SOCIAL (MAS)"
            },
            {
                "numero": 8,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)"
            },
            {
                "numero": 9,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 12,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 13,
                "candidatura": "MÁS PAÍS-CHUNTA ARAGONESISTA-EQUO (M.PAÍS-CHA-EQUO)"
            },
            {
                "numero": 14,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 15,
                "candidatura": "PUYALON (PYLN)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 2,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 4,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 5,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 6,
                "candidatura": "ESCAÑOS EN BLANCO (EB)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO ANIMALISTA CONTRA EL MALTRATO ANIMAL (PACMA)"
            },
            {
                "numero": 8,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 9,
                "candidatura": "FEDERACIÓN DE LOS INDEPENDIENTES DE ARAGÓN (FIA)"
            },
            {
                "numero": 10,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 11,
                "candidatura": "PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)."
            },
            {
                "numero": 12,
                "candidatura": "PUYALON (PYLN)"
            },
            {
                "numero": 13,
                "candidatura": "MOVIMIENTO ARAGONÉS SOCIAL (MAS)"
            },
            {
                "numero": 14,
                "candidatura": "MÁS PAÍS-CHUNTA ARAGONESISTA-EQUO (M.PAÍS-CHA-EQUO)"
            },
            {
                "numero": 15,
                "candidatura": "PARTIDO COMUNISTA DE LOS PUEBLOS DE ESPAÑA (PCPE)"
            }
        ]
    },
    "CEUTA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 3,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 4,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "MOVIMIENTO POR LA DIGNIDAD Y LA CIUDADANÍA DE CEUTA (MDyC)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 2,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 3,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 4,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 5,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 6,
                "candidatura": "MOVIMIENTO POR LA DIGNIDAD Y LA CIUDADANÍA DE CEUTA (MDyC)"
            },
            {
                "numero": 7,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 8,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            }
        ]
    },
    "MELILLA": {
        "CONGRESO DE LOS DIPUTADOS": [
            {
                "numero": 1,
                "candidatura": "LOS VERDES (VERDES o LOS VERDES o LV)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 9,
                "candidatura": "COALICIÓN POR MELILLA (CpM)"
            }
        ],
        "SENADO": [
            {
                "numero": 1,
                "candidatura": "LOS VERDES (VERDES o LOS VERDES o LV)"
            },
            {
                "numero": 2,
                "candidatura": "POR UN MUNDO MÁS JUSTO (PUM+J)"
            },
            {
                "numero": 3,
                "candidatura": "PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE)"
            },
            {
                "numero": 4,
                "candidatura": "VOX (VOX)"
            },
            {
                "numero": 5,
                "candidatura": "UNIDAS PODEMOS (PODEMOS-IU)"
            },
            {
                "numero": 6,
                "candidatura": "PARTIDO POPULAR (PP)"
            },
            {
                "numero": 7,
                "candidatura": "RECORTES CERO-GRUPO VERDE (RECORTES CERO-GV)"
            },
            {
                "numero": 8,
                "candidatura": "CIUDADANOS-PARTIDO DE LA CIUDADANÍA (Cs)"
            },
            {
                "numero": 9,
                "candidatura": "COALICION POR MELILLA (CpM)"
            }
        ]
    }
}
return candidaturas;
}
