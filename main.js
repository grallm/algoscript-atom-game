// Valeurs variables par défaut
var atomes = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"];
var centre = [Math.round(document.documentElement.clientWidth / 2), Math.round(document.documentElement.clientHeight / 2)-15];
var localisation; // Connaître quel menu
var jeu = [false, 0, 1, 1, 0]; // Paramètre jeu: [EN JEU, TYPE, ATOME et ELECTRONS, COUCHES, NOMBRES ELECTRONS, ACCU pos tour ELEC]
var electrons = [1]; // Stockage tous les électrons: nb élec / couche
var electronsLibres = []; // Electrons se déplaçant: [[x, y, x0, y0, direction, déplacements, comb touches],[...]]
FrameRate=60;

// Démarrage
menuPrincipal();
//partieUnJoueur();


// Menu principal

function menuPrincipal() {
  Initialiser();
  localisation = "principal";

  setCanvasFont("helvetica", "40pt", "bold");
  Texte(700, 100, "Atome excitator", "black");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(500, 200, 300, 100, "lightblue");
  Texte(550, 265, "1 joueur", "black");

  RectanglePlein(950, 200, 300, 100, "yellow");
  Texte(1000, 265, "2 joueurs", "black");

  RectanglePlein(725, 500, 300, 100, "lightgray");
  Texte(735, 565, "Paramètres", "black");
}



function MouseClick(x, y) {
  switch (localisation) {
  case "principal":
	// Menu: 1 joueur
	if (x > 500 && x < 800 && y > 200 && y < 300) {
      partieUnJoueur();

    // Menu: 2 joueurs
	} else if (x > 950 && x < 1150 && y > 200 && y < 300) {
    alert("2 joueurs");

    // Menu: paramètres
	} else if (x > 725 && x < 1025 && y > 500 && y < 600) {
    alert("Paramètres");
	}
	break;
    
  case "TEST": // TEST = ACTION LORS CLICK (click en bas)
    if(y > (centre[1]+2*(centre[1]/3))){
      spawnElec();
    }
  }
}


// Dessiner noyau et couches
function dessinerUnAtome(n,couche) {
  CerclePlein(centre[0], centre[1], 50 + 5 * (n - 1), "red");
  setCanvasFont("helvetica", "18pt", "normal");
  Texte(centre[0] - 10, centre[1] + 10, atomes[n - 1], "black");

  // Dessiner toutes les sous-couches
  for (var i = 0; i < couche; i++) {
	Cercle(centre[0], centre[1], 150 + 50 * (i), "red");
  }
}


// Rajouter un électron à l'atome
function addElec(){
  if(electrons[jeu[3]-1] < 2+4*(jeu[3]-1)){ // Ajouter 1 électron à la dernière couche
    electrons[jeu[3]-1] = enEntier(electrons[jeu[3]-1])+1;
    jeu[2]++;
  }else{
    jeu[2]++; // Ajouter numéro atomique
    jeu[3]++; // Add couche
    electrons.push(1);
  }
}

// Retirer un électron à l'atome
function delElec(){
  
}


// Déplacer tous les électrons d'un degré
function deplacElecs(){
  // ELECTRONS ATOME
  var angle = 2*Math.PI*jeu[4]/360;
  
  // Regarder toutes les couches
  //Ecrire(electrons[1][0]);
  var couche = Taille(electrons);
  for(var n=0; n<couche; n++){
    var rayon = 75+25*n;
    // Regarder tous les électrons par couche
    for(var e=0; e<electrons[n]; e++){
      //Ecrire(typeof(electrons[n][0]) + " / " + electrons[n][0]);
      // Déplacement circulaire
      CerclePlein(rayon*Math.cos(angle + 2*e*Math.PI/electrons[n] + n*Math.PI/2)+centre[0], rayon*Math.sin(angle + 2*e*Math.PI/electrons[n] + n*Math.PI/2)+centre[1], 20,"gray");
    }
  }
  
  
  // ELECTRONS LIBRES
  var elecsL = Taille(electronsLibres);
  for(var eL=0; eL<elecsL; eL++){
    if(electronsLibres[eL]){ // Eviter bugs: essaie de déplacer alors que supprimé
      electronsLibres[eL][5] += 6; // Vitesse déplacement (par frame)
      electronsLibres[eL][0] = Math.cos(2*Math.PI*electronsLibres[eL][4]/360)*electronsLibres[eL][5]+electronsLibres[eL][2]; // Déplacement X
      if(electronsLibres[eL][3] == 0){ // Déplacement vers le haut ou le bas selon l'apparition
        electronsLibres[eL][1] = Math.sin(2*Math.PI*electronsLibres[eL][4]/360)*electronsLibres[eL][5]+electronsLibres[eL][3]; // Déplacement X
      }else{
        electronsLibres[eL][1] = -Math.sin(2*Math.PI*electronsLibres[eL][4]/360)*electronsLibres[eL][5]+electronsLibres[eL][3]; // Déplacement X
      }

      // S'ils dépassent la fenêtre ils disparaissent
      if(electronsLibres[eL][0]>centre[0]*2 || electronsLibres[eL][0]<0 || electronsLibres[eL][1]>centre[1]*2 || electronsLibres[eL][1]<0){
        electronsLibres.splice(eL, 1);
      }else{
        CerclePlein(electronsLibres[eL][0], electronsLibres[eL][1], 20,"gray");
      }
    }
  }
}


function Keypressed(k){
  if(jeu[0] && Taille(electronsLibres)>0){
    // Regarder si touche appuyée correspond
    var touches = Taille(electronsLibres[0][6]);
    var delEL = false; // Supprimer l'eL = erreur ou fini 
    var t = 0;
    // Test touches dans l'ordre
    do{
      if(electronsLibres[0][6][t][1] == 1){ // Si touche déjà faite on passe
      }else if(k == electronsLibres[0][6][t][0]){ // Si bonne touche
        if(t == touches-1){
          delEL = true;
          // SUCCEED
          addElec();
        }
        electronsLibres[0][6][t][1] = 1;
        break; 
      }else{ // Si mauvaise touche
        delEL = true;
        break;
      }
      t++;
      //AfficherTableau(electronsLibres[0][6]);
    }while(electronsLibres[0][6][t-1][1]==1 && t<touches && t<20);
    
    if(delEL){
      electronsLibres.shift(); // Retire le premier électron des libres si réussi ou raté
    }
  }
}


// Combinaison de touches pour ajouter électron
function genCombTouchesElec(n){
  var combTouches = [];
  
  // Générer touches, n électrons = combinaison n touches
  var nbTouches = Math.round(jeu[2]/4)+1;
  for(var i=0; i<nbTouches; i++){
    var touche = Hasard(36)+65; // Lettre ou chiffre
    touche = (touche > 90) ? touche-43 : touche;
    combTouches.push([touche,0]);
  }
  
  electronsLibres[n].push(combTouches);
}
// Afficher combinaisons de touches à faire et lesquelles sont faites
function showCombTouchesElec(){
  if(Taille(electronsLibres)>0){
    setCanvasFont("helvetica", "18pt", "bold");
    RectanglePlein(centre[0]*2-400, centre[1]-75, 400, 200, "lightblue");
    Texte(centre[0]*2-320, centre[1]-50, "Combinaisons touches\n      électrons libres", "black");
    
    // Afficher les touches des eL
    setCanvasFont("helvetica", "16pt", "bold");
    var touches = Taille(electronsLibres[0][6]);
    for(var t=0; t<touches;t++){
      RectanglePlein(centre[0]*2-390+t*30, centre[1]-10, 25, 25, "gray");
      Texte(centre[0]*2-385+t*30, centre[1]+10, Ascii_vers_Caractere(electronsLibres[0][6][t][0]), (electronsLibres[0][6][t][1] == 0) ? "black" : "green");
    }
  }
}


// Faire apparaître un électron
function spawnElec(){
  var x = Hasard(Math.round(centre[0]*2 - centre[0]/2 - centre[0]/3)) + Math.round(centre[0]/2); // Coordonnée X entre 1/4 et 5/6 de l'écran
  var direction = Hasard(96) + 45; // Angle entre 45 et 135° (direction électron)
  var y = (Hasard(2) == 1) ? centre[1]*2 : 0; // En haut ou en bas
  
  CerclePlein(x, y, 20,"gray");
  electronsLibres.push([x, y, x, y, direction, 0]);
  genCombTouchesElec(Taille(electronsLibres)-1);
}


// Afficher nombre électrons
function numElec(){
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0]+5, 50, jeu[2], "black");
  CerclePlein(centre[0]-10, 40, 20,"gray");
}


// Animer, actualisation toutes les frames
// ANIMATIONS
function draw(){
  if(jeu[0] && jeu[1] == 1){ // Si jeu activé et 1 joueur
	Initialiser();
	dessinerUnAtome(jeu[2], jeu[3]);
     
    showCombTouchesElec();
	deplacElecs();
    numElec();
    
    // Angle en degrés, passe à 0 si 360
	jeu[4] = (jeu[4]+3 > 359) ? 0 : jeu[4]+3;
  }
}


// Lancer jeu 1 joueur
function partieUnJoueur() {
  Initialiser();
  localisation = "partieUnJoueur";
  localisation = "TEST";
  
  jeu[0] = true; // Jeu lancé
  jeu[1] = 1; // Jeu 1 joueur

  // Combien de sous-couches selon numéro atomique
  var couche;
  if (jeu[1] % 2 == 0) {
	couche = jeu[1] / 2;
  } else {
	couche = (jeu[1] + 1) / 2;
  }
 
  // Activer l'animation
  Loop(-1);
}


// Lancer jeu 2 joueurs
function partieDeuxJoueurs() {

}
