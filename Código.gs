/*
Todo este código, ha sido copiado y pegado del proyecto 10N, por lo que habrá cambios sustanciales

Los cambios previstos van encaminados a:

- La verificación y el recuento es el mismo proceso
- No hay preferencias de asignaciones por provincias

Cuando trabajemos sobre una función, lo comentamos en la primera línea de la función

Nunca he trabajado con este editor en grupo, no sé que tal resultará

Aplicación:
Exec: https://script.google.com/macros/s/AKfycbwx_K6IfIX_9z4qc_ZnedfD77uhywSQzRAshWdgu-pfzQTzl1I/exec
LAst code: https://script.google.com/macros/s/AKfycbwx_K6IfIX_9z4qc_ZnedfD77uhywSQzRAshWdgu-pfzQTzl1I/dev
*/

function doGet() { //Modificando Nacho
  return HtmlService.createHtmlOutputFromFile('index');
}


function usuarioCorrecto() {
  //Esta función es necesaria para saber que el usuario no ha rechazado las condiciones del formulario y por tante se le pueden asignar actas
  //Se usa en el html
  var usuarioCorrecto = false;
  var email = Session.getActiveUser().getEmail();
  //var email = "jaimegomila89@gmail.com";
  var datos = SpreadsheetApp.getActive().getSheetByName('Verificadores').getDataRange().getValues();
  for (var nDato = 1 ; nDato < datos.length ; nDato++) {
    if (email == datos[nDato][1]) {
      if (datos[nDato][4] == "Acepto las condiciones del servicio") {
        return [email,true];
      }
    }
  }
  return [email,false];
}

function getUsuarios() { 
  //Devuelve usuarios en formato JSON
  var datos = SpreadsheetApp.getActive().getSheetByName('Verificadores').getDataRange().getValues();
  var usuarios = [];
  var cabecera = [];
  for (var nCab in datos[0]) {
    cabecera.push(datos[0][nCab]);
  }
  for (var nDato = 1 ; nDato < datos.length ; nDato++) {
    //usuarios.push(datos[nDato][1]);
    usuarios[datos[nDato][1]] = {};
    for (nCab in cabecera) {
      usuarios[datos[nDato][1]][cabecera[nCab]] = datos[nDato][nCab];
    }
    usuarios[datos[nDato][1]]["Actas asignadas sesión"] = 0;
  }
  return usuarios;
}

function guardarVerificacion(form_data) {
//Esta función sustituirá a guardarRecuento y aglutinará ambas funciones en una. Es llamada desde html
//Guardamos las actas verificadas en una nueva hoja, o les ponemos la marca de verificación?
  var sheet = SpreadsheetApp.getActive().getSheetByName('Actas verificadas');
  var email = Session.getActiveUser().getEmail();
  sheet.appendRow([new Date(), 
                   form_data.id, 
                   form_data.correcta, 
                   form_data.provincia, 
                   form_data.municipio, 
                   form_data.distrito, 
                   form_data.seccion, 
                   form_data.mesa, 
                   form_data.censados, 
                   form_data.electores, 
                   form_data.interventores, 
                   email, //verificador
                   form_data.nulos,
                   form_data.blanco,
                   form_data.vcandidatura1,
                   form_data.vcandidatura2,
                   form_data.vcandidatura3,
                   form_data.vcandidatura4,
                   form_data.vcandidatura5,
                   form_data.vcandidatura6,
                   form_data.vcandidatura7,
                   form_data.vcandidatura8,
                   form_data.vcandidatura9,
                   form_data.vcandidatura10,
                   form_data.vcandidatura11,
                   form_data.vcandidatura12,
                   form_data.vcandidatura13,
                   form_data.vcandidatura14,
                   form_data.vcandidatura15,
                   form_data.vcandidatura16,
                   form_data.vcandidatura17,
                   form_data.vcandidatura18,
                   form_data.vcandidatura19,
                   "=VLOOKUP(B:B;'Actas subidas'!B$2:J;9;false)",
                   "=if(isna(VLOOKUP(B:B;'Actas recontadas'!B$2:B;1;false));false;true)"
                  ]);

  //SpreadsheetApp.flush();
}



function guardarActaIncorrecta(form_data) {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Actas verificadas');
  sheet.appendRow([new Date(), form_data.id, form_data.correcta, "", "", "", "", "", "", "", "", Session.getActiveUser().getEmail()]);
}

function obtenerAsignaciones() { //Devuelve las asignaciones de verificación pertenecientes a un usuario. 
  var actasdeUsuario = [];
  
  var maxAsignaciones = 100;
  var asignadas = 0;
  var ss = SpreadsheetApp.getActive();
  var sheetActas = ss.getSheetByName("Actas sin verificar");
  var email = Session.getActiveUser().getEmail();
  //email = "admin@eleccionestransparentes.org"; //Línea para hacer pruebas
  var actas = sheetActas.getDataRange().getValues();
  var cabecera = actas[0];
  var actasdeUsuario = [];
  for (var nActa = 0 ; nActa < actas.length ; nActa++) {    
    if (actas[nActa][125] == email) {
      if (actas[nActa][10] != true) { //El acta no debe estar verificada
        var actaObj = {};
        for (var nCab in cabecera) {
          actaObj[cabecera[nCab]] = actas[nActa][nCab];
        }
        actaObj["Usuario"] = email;
        actasdeUsuario.push(actaObj);
        var nada = "nada";
        asignadas++;
        if (asignadas >= maxAsignaciones) {
          break;
        }
      }
    }
  }
  //Logger.log("actas:"+actasdeUsuario);
  //return [1,2,3,4];
  
  return JSON.stringify(actasdeUsuario);
  var nada = "";
}


function onFormSubmit(e) {
  //Diferenciar si es un alta de acta o de verificador
  var datosFormulario = e.namedValues;
  Logger.log('e.namedValues:'+ e.namedValues);
  Logger.log('Datos:'+ datosFormulario);
  //console.log({message: 'Registro', Datos: datosFormulario});
  if (datosFormulario.hasOwnProperty('Fotografía del acta')) { //El formulario enviado es de actas
    
    //Añadir función para ver si está verificado
    //=iferror(VLOOKUP(B2;'Actas verificadas'!B$2:M;2;false);false)
    var range = e.range;
    var fila = range.getRow();
    var ssActasSubidas = SpreadsheetApp.getActive().getSheetByName("Actas subidas");
    var verificadaCell = ssActasSubidas.getRange(fila, 11);
    verificadaCell.setValue("=iferror(if(VLOOKUP(B:B;'Actas verificadas'!B$2:B;1;false)<>\"\";true;false);false)");
    var contadaCell = ssActasSubidas.getRange(fila, 12);
    contadaCell.setValue("=iferror(if(VLOOKUP(B:B;'Actas recontadas'!B$1:B;1;false)<>\"\";true;false);false)");
    var correctaCell = ssActasSubidas.getRange(fila, 13);
    correctaCell.setValue("=iferror(VLOOKUP(B:B;'Actas verificadas'!B$2:C;2;FALSO);\"\")");
    //Cambio de nombre de fichero
    var fotoUrl = datosFormulario["Fotografía del acta"][0];
    var fotoUrlArray = fotoUrl.split("=");
    var fotoId = fotoUrlArray[1];
    Logger.log("fotoId:"+fotoId);
    var fotoFile = DriveApp.getFileById(fotoId);
    fotoFile.setName(fotoId);

    //Asignar verificación
    asignarVerificaciones();
    //DesasignarAsignarVerificaciones();
    
  } else { //El formulario enviado es de verificadores
    
    //Asignar funciones/fórmulas
    var range = e.range;
    var fila = range.getRow();
    var ssVerificadores = SpreadsheetApp.getActive().getSheetByName("Verificadores");
    //Calculo de verificaciones
    var asignacionesCell = ssVerificadores.getRange(fila, 6);
    asignacionesCell.setValue("=countif('Actas subidas'!I$2:I;B:B)"); //Actas asignadas
    var asignacionesCell = ssVerificadores.getRange(fila, 7);
    asignacionesCell.setValue("=countif('Actas verificadas'!L$2:L;B:B)"); //Actas verificadas
    var ratioCell = ssVerificadores.getRange(fila, 8);
    ratioCell.setValue('=if(E:E<>"";F:F-G:G;"")'); //Ratio de asignaciónes
    //Cálculo de conteos
    var asignacionesCell = ssVerificadores.getRange(fila, 9);
    asignacionesCell.setValue("=countif('Actas subidas'!J$2:JI;B:B)"); //Actas asignadas para contar
    var asignacionesCell = ssVerificadores.getRange(fila, 10);
    asignacionesCell.setValue("=countif('Actas recontadas'!K$1:K;B:B)"); //Actas contadas
    //=countif('Actas recontadas'!K$1:K;B:B)
    var ratioCell = ssVerificadores.getRange(fila, 11);
    ratioCell.setValue('=if(E:E<>"";I:I-J:J;"")'); //Ratio de actas contadas  
    
    DesasignarAsignarVerificaciones();
    DesasignarAsignarRecuentos();

  }
}

function asignarVerificaciones() { //Asigna actas para verificar
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  var usuarios = getUsuarios();
  //Ordenamos en función del más eficaz
  verificadores.shift();
  verificadores = verificadores.sort(function(b,a) {
    return a[11] - b[11]; //0 hace referencia a la primera columna
  });
  var nada ="";
  
  //Capturamos los datos de actas subidas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas 
  var maxActas = 1200; //Número máximo de actas asignada simultáneamente en este proceso
  var maxActasUsuario = 2; //Número máximo de actas asignada simultáneamente a un usuario en este proceso
  var maxActasYaAsignadas = 2; //Número máximo de actas ya asignadas a un usuario. Si supera ese número de actas, no se le asignan más
  var actasAsignadas = 0;
  for (var nActa = 0 ; nActa < actas.length ; nActa++) {
    if (!actas[nActa][127]) { //Comprobamos que el acta no ha sido ya verificada
      if (actas[nActa][125] == "") { //Si el acta no tiene asignado verificador
        //Bucle por verificadores
        //var actasAsignadasUsuario = 0;
        for (var nVeri in verificadores) {
          var verificadorEscogido = verificadores[nVeri][1];
          if (usuarios[verificadorEscogido]["Faltan por verificar"] < maxActasYaAsignadas) {
            if (usuarios[verificadorEscogido]["Condiciones del servicio"] == "Acepto las condiciones del servicio") {
              if (usuarios[verificadorEscogido]["Actas asignadas sesión"] < maxActasUsuario) {
                var rangoActa = sheetActas.getRange(Number(nActa)+2, 126); //Celda en la que se guarda el correo electrónico del verificador escogido para este acta
                rangoActa.setValue(verificadorEscogido);
                actasAsignadas++;
                usuarios[verificadorEscogido]["Actas asignadas sesión"]++;
                var nada = "";
                break;
                SpreadsheetApp.flush();
              }
            }
          }     
        }
      }
    }
    if (actasAsignadas >= maxActas) {
      var nada = "";
      break;
    }
  }
  SpreadsheetApp.flush();
}

/*
function asignarRecuentos() { //Asigna actas para recontar
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  var usuarios = getUsuarios();
  //Ordenamos en función del más eficaz
  verificadores.shift();
  verificadores = verificadores.sort(function(b,a) {

    return a[12] - b[12]; //0 hace referencia a la primera columna
  });
  var nada ="";
  
  //Capturamos los datos de actas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas  
  var maxActasYaAsignadas = 15; //Número máximo de actas ya asignadas
  for (var nActa = 3471 ; nActa < actas.length ; nActa++) {
    if (actas[nActa][12] == true) { //Si el acta ha sido verificada y es correcta
      if (actas[nActa][9] == "") { //Si el acta no tiene asignado un contador
        if (actas[nActa][11] == false) {//si el acta no ha sido contada
          for (var nVeri in verificadores) {
            var provinciaDelActa = actas[nActa][2];
            var provinciaDelVerificador = verificadores[nVeri][2];
            if (provinciaDelVerificador.toUpperCase() == provinciaDelActa.toUpperCase()) { //Comprobamos si al contador le corresponde esta provincia
              var verificadorEscogido = verificadores[nVeri][1];
              if (usuarios[verificadorEscogido]["Faltan por contar"] < maxActasYaAsignadas) {
                if (usuarios[verificadorEscogido]["Condiciones del servicio"] == "Acepto las condiciones del servicio") {
                  var rangoActa = sheetActas.getRange(Number(nActa)+2, 10);
                  rangoActa.setValue(verificadorEscogido);
                  var nada = "";
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
  SpreadsheetApp.flush();
}
*/

function desasignarVerificaciones() {
  //Dadas las grandes cantidades de asignaciones que acumulan algunos usuario y que en cambio no están dispuestos a atender. Se plantea un sistema de desasignación de verificaciones para que estas puedan ser reasignadas a gente más competente
  //Esto estará dentro de un trigger diario
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  //Ordenamos en función del más eficaz
  verificadores.shift(); //Quitamos la cabecera
  verificadores = verificadores.sort(function(a,b) {
    return a[11] - b[11]; //0 hace referencia a la primera columna
  });
  var nada ="";
  
    //Capturamos los datos de actas subidas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas 
  var maxActas = 100; //Número máximo de actas desasignada simultáneamente en este proceso
  var actasDesasignadas = 0;
  //Bucle por verificadores
  for (var nVeri in verificadores) {
    var verificadorEscogido = verificadores[nVeri][1];
    for (var nActa = 3810 ; nActa < actas.length ; nActa++) {
      if (!actas[nActa][10]) { //Comprobamos que el acta no ha sido ya verificada
        if (actas[nActa][8] !== "") { //Si el acta tiene asignado verificador
          if (verificadorEscogido == actas[nActa][8]) { //Comprobamos si al verificador es el elegido
            var actaEscogida = actas[nActa][1];
            var rangoActa = sheetActas.getRange(Number(nActa)+2, 9);
            rangoActa.setValue("");
            actasDesasignadas++;
            if (actasDesasignadas >= maxActas) {
              var nada = "";
              break;
            }
          }
        }
      }
    }
    if (actasDesasignadas >= maxActas) {
      var nada = "";
      break;
    }
  }
  SpreadsheetApp.flush();
}

/*
function desasignarRecuentos() { //Desasigna actas para contar cuando alguien acumula demasiadas
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  var usuarios = getUsuarios();
  //Ordenamos en función del más eficaz
  verificadores.shift();
  verificadores = verificadores.sort(function(a,b) { //Ordenamos por orden inverso del que más tiene al que menos

    return a[12] - b[12]; //0 hace referencia a la primera columna
  });
  var nada ="";
  
  //Capturamos los datos de actas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas  
  var maxActas = 25; //Número máximo de actas desasignada simultáneamente en este proceso
  var actasDesasignadas = 0;

  for (var nVeri in verificadores) {
    var verificadorEscogido = verificadores[nVeri][1];
    for (var nActa = 3400 ; nActa < actas.length ; nActa++) {
      if (actas[nActa][12] == true) { //Si el acta ha sido verificada y es correcta
        if (actas[nActa][9] == verificadorEscogido) { //Si el acta tiene asignado un contador
          if (actas[nActa][11] != true) {//si el acta no ha sido contada
            var rangoActa = sheetActas.getRange(Number(nActa)+2, 10);
            rangoActa.setValue("");
            //SpreadsheetApp.flush();
            actasDesasignadas++;
            if (actasDesasignadas >= maxActas) {
              var nada = "";
              break;
            }
            var nada = "";
          }
        }
      }
    }
    if (actasDesasignadas >= maxActas) {
      var nada = "";
      break;
    }
    
  }
  SpreadsheetApp.flush();
}
*/

function DesasignarAsignarVerificaciones() {
  desasignarVerificaciones();
  asignarVerificaciones();
}

/*
function DesasignarAsignarRecuentos() {
  desasignarRecuentos();
  asignarRecuentos();
}
*/