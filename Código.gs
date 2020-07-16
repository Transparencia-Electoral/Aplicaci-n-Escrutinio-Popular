/*
Todo este código, ha sido copiado y pegado del proyecto 10N, por lo que habrá cambios sustanciales
Los cambios previstos van encaminados a:
- La verificación y el recuento es el mismo proceso
- No hay preferencias de asignaciones por provincias

Cuando trabajemos sobre una función, lo comentamos en la primera línea de la función

Nunca he trabajado con este editor en grupo, no sé que tal resultará

Aplicación:
Exec: https://script.google.com/macros/s/AKfycbwx_K6IfIX_9z4qc_ZnedfD77uhywSQzRAshWdgu-pfzQTzl1I/exec
Last code: https://script.google.com/macros/s/AKfycbwx_K6IfIX_9z4qc_ZnedfD77uhywSQzRAshWdgu-pfzQTzl1I/dev
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

function obtenerAsignaciones() { //Devuelve las asignaciones de verificación pertenecientes a un usuario. 
  var actasdeUsuario = [];
  
  var maxAsignaciones = 100;
  var asignadas = 0;
  var ss = SpreadsheetApp.getActive();
  var sheetActas = ss.getSheetByName("Actas subidas");
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
  try{
    //Diferenciar si es un alta de acta o de verificador
    var datosFormulario = e.namedValues;
    Logger.log('e.namedValues:'+ e.namedValues);
    Logger.log('Datos:'+ datosFormulario);
    //console.log({message: 'Registro', Datos: datosFormulario});
    if (datosFormulario.hasOwnProperty('Fotografía del acta')) { //El formulario enviado es de actas
            
      //Asignar verificación
      asignarVerificaciones();
      //DesasignarAsignarVerificaciones();
      //Renombrar fotos
      renombrarFotos();
      //Logger.log("Ejecución correcta acta");
      
    } else { //El formulario enviado es de verificadores
      
      //Asignar funciones/fórmulas
      var range = e.range;
      var fila = range.getRow();
      var ssVerificadores = SpreadsheetApp.getActive().getSheetByName("Verificadores");
      //Calculo de verificaciones
      var asignacionesCell = ssVerificadores.getRange(fila, 6);
      asignacionesCell.setValue("=CONTAR.SI('Actas subidas'!DV$2:DV;B:B)"); //Actas asignadas
      var asignacionesCell = ssVerificadores.getRange(fila, 7);
      asignacionesCell.setValue("=CONTAR.SI('Actas verificadas'!DX$2:DX;B:B)"); //Actas verificadas
      var ratioCell = ssVerificadores.getRange(fila, 8);
      ratioCell.setValue('=if(E:E<>"";F:F-G:G;"")'); //Ratio de asignaciónes    
      asignarVerificaciones();
      Logger.log("Ejecución correcta verificador");
      
      asignarHojasdeCalculoAVerificadores(); //Le creamos y asignamos una hoja de cálculo
    }
  } catch(error) {
    var errorMag = error.message;
    Logger.log("Error: "+errorMag);
    var nada = "";
  }
}

function asignarVerificaciones() { //Asigna actas para verificar
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  var usuarios = getUsuarios();
  //Ordenamos en función del más eficaz
  verificadores.shift();
  verificadores = verificadores.sort(function(b,a) {
    return a[6] - b[6]; //Ordenar descendente de mejor a peor verificador
  });
  var nada ="";
  
  //Capturamos los datos de actas subidas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas 
  var maxActas = 1200; //Número máximo de actas asignada simultáneamente en este proceso
  var maxActasUsuario = 1; //Número máximo de actas asignada simultáneamente a un usuario en este proceso
  var maxActasYaAsignadas = 2; //Número máximo de actas ya asignadas a un usuario. Si supera ese número de actas, no se le asignan más
  var actasAsignadas = 0; //Contador a cero
  for (var nActa = 0 ; nActa < actas.length ; nActa++) {
    if (!actas[nActa][126]) { //Comprobamos que el acta no ha sido ya verificada
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
                var rangoActa = sheetActas.getRange(Number(nActa)+2, 127); //Celda en la que se guarda la fórmula que indica si el acta está verificada o no
                rangoActa.setValue("=COUNTIF('Actas verificadas'!B$2:B;B:B)");
                actasAsignadas++;
                usuarios[verificadorEscogido]["Actas asignadas sesión"]++;
                var nada = "";
                break;
                //SpreadsheetApp.flush();
                //=CONTAR.SI('Actas verificadas'!B$2:B;B:B)
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

function desasignarVerificaciones() {
  //Dadas las grandes cantidades de asignaciones que acumulan algunos usuario y que en cambio no están dispuestos a atender. Se plantea un sistema de desasignación de verificaciones para que estas puedan ser reasignadas a gente más competente
  //Esto estará dentro de un trigger diario
  var ss = SpreadsheetApp.getActive();
  var verificadores = ss.getSheetByName("Verificadores").getDataRange().getValues();
  //Ordenamos en función del más eficaz
  verificadores.shift(); //Quitamos la cabecera
  verificadores = verificadores.sort(function(a,b) {
    return b[7] - a[7]; //Ordenamos descendente por actas pendientes de verificar
  });
  var nada ="";
  
    //Capturamos los datos de actas subidas
  var sheetActas = ss.getSheetByName("Actas subidas");
  var actas = sheetActas.getDataRange().getValues();
  //Quitamos la cabecera
  actas.shift();
  
  //Bucle por actas 
  var maxActas = 4; //Número máximo de actas desasignadas simultáneamente en este proceso
  var actasDesasignadas = 0; //Contador a cero
  //Bucle por verificadores ordenados por última fecha de modificación ascendente. Ya veremos como queda esto
  for (var nVeri in verificadores) {
    var verificadorEscogido = verificadores[nVeri][1];
    //for (var nActa = 0 ; nActa < actas.length ; nActa++) {
    for (var nActa = actas.length-1 ; nActa >= 0 ; nActa--) {
      if (actas[nActa][126] <= 1) { //Comprobamos que el acta no ha sido ya verificada
        if (actas[nActa][125] !== "") { //Si el acta tiene asignado verificador
          if (verificadorEscogido == actas[nActa][125]) { //Comprobamos si al verificador es el elegido
            if (actasDesasignadas >= maxActas) {
              var nada = "";
              break;
            }
            var actaEscogida = actas[nActa][1];
            var rangoActa = sheetActas.getRange(Number(nActa)+2, 126);
            rangoActa.setValue("");
            //SpreadsheetApp.flush();
            actasDesasignadas++;
          }
        }
      }
    }
    if (actasDesasignadas >= maxActas) {
      var nada = "";
      break;
    }
  }
  asignarVerificaciones();
  SpreadsheetApp.flush();
}

function renombrarFotos() {
  var hojaFotos = SpreadsheetApp.getActive().getSheetByName("Fotos");
  var fotos = hojaFotos.getDataRange().getValues();
  for (var nFoto = 0 ; nFoto < fotos.length ; nFoto++) {
    var renombrada = fotos[nFoto][1];
    if (renombrada != "Renombrada") {
      var fotoUrl = fotos[nFoto][0];
      var fotoUrlArray = fotoUrl.split("=");
      var fotoId = fotoUrlArray[1];
      //Logger.log("fotoId:"+fotoId);
      var fotoFile = DriveApp.getFileById(fotoId);
      var nombreAterior = fotoFile.getName();
      fotoFile.setName(fotoId);
      var celda = hojaFotos.getRange(nFoto+1, 2);
      celda.setValue("Renombrada");
      var celda = hojaFotos.getRange(nFoto+1, 3);
      celda.setValue(nombreAterior);
      //SpreadsheetApp.flush();
    }
  }
}

function DesasignarAsignarVerificaciones() {
  desasignarVerificaciones();
  asignarVerificaciones();
}

function obtenerActasVerificadas() {
  var hojaActasSubidas = SpreadsheetApp.getActive().getSheetByName("Actas subidas");
  var hojaVerificadas = SpreadsheetApp.getActive().getSheetByName("Actas verificadas");
  var hojaDeVerificadores = SpreadsheetApp.getActive().getSheetByName("Verificadores");
  var verificadores = hojaDeVerificadores.getDataRange().getValues();
  for (var nVer = 1 ; nVer < verificadores.length ; nVer++) { //Bucle por verificador
    var verificador = verificadores[nVer][1];
    var urlHoja = verificadores[nVer][8];
    if (urlHoja != "") {
      var hojaActasVerificadasDeVerificador = SpreadsheetApp.openByUrl(urlHoja).getSheetByName("Actas verificadas");
      var actasVerificadasDeVerificador = hojaActasVerificadasDeVerificador.getDataRange().getValues();
      for (var nActa = 1 ; nActa < actasVerificadasDeVerificador.length ; nActa++) { //Bucle de actas verificadas
        if (actasVerificadasDeVerificador[nActa][128] != "Registrada") {
          actasVerificadasDeVerificador[nActa][127] = verificador;
          hojaVerificadas.appendRow(actasVerificadasDeVerificador[nActa]);
          hojaActasVerificadasDeVerificador.getRange(nActa+1, 129).setValue("Registrada");
        }
      }
    }
    SpreadsheetApp.flush();
  }
  SpreadsheetApp.flush();
  //Quitar duplicados
  var rango = hojaVerificadas.getDataRange();
  rango.removeDuplicates();
  SpreadsheetApp.flush();
  desasignarVerificaciones();
  asignarVerificaciones();
}