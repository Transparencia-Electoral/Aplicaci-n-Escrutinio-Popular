function guardarVerificacion2(form_data) {
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
