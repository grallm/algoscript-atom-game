// Images
turtleEnabled = false;
var paramsButton = PreloadImage("https://images.ecosia.org/ilbROjBxJe3GqUG2WczJ7H9nxKM=/0x390/smart/https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2014%2F10%2F09%2F13%2F14%2Fsettings-481826_960_720.png");
var backToMenu = PreloadImage("https://image.flaticon.com/icons/png/512/0/340.png");

// Valeurs variables par défaut
var atomes = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"];
var centre = [Math.round(document.documentElement.clientWidth / 2), Math.round(document.documentElement.clientHeight / 2) - 15];
var r = 250,
 g = 100,
 b = 150;
var localisation; // Connaître quel menu
//var jeu = [false, 0, 1, 1, 0]; // Paramètre jeu: [EN JEU, TYPE, ATOME et ELECTRONS, COUCHES, NOMBRES ELECTRONS, ACCU pos tour ELEC]
var jeu = [false, 0, [1, 1], [1, 1], 0];
var electronsRotating = [[1]]; // Electrons sur couches et sur atomes
var electronsLibres = []; // Electrons se déplaçant: [[x, y, x0, y0, direction, déplacements, comb touches:[ASCII, clickée ? (=1)]],[...]]
var polyElecL = []; // [[x,y,t]] Explosion lors disparition électrons libres (raté)
FrameRate = 60;
var recordPartie = 1; // Score partie
if (!recordSession) var recordSession = [1,1,1]; // Score record
var difficulte = 1; // Permet de régler difficulté: nombres de touches + vitesse de baisse/montée de l'énergie

// Variables multi joueurs
var multiAtomes = []; // Coord des atomes multiples (pour atome + deplac elec) [[x,y],[]]

// Démarrage
//menuPrincipal();
//menuDeuxJoueurs();
//partieDeuxJoueurs();
partieUnJoueur();


// Remettre les valeurs par défaut

function resetVars() {
  jeu = [false, 0, [1, 1], [1, 1], 0];
  electronsRotating = [[1]];
  electronsLibres = [];
  polyElecL = [];
  energie = 500;
  virerElec = 0;
  recordPartie = 1;
}

// Menu principal

function menuPrincipal() {
  Initialiser();
  localisation = "principal";

  setCanvasFont("helvetica", "40pt", "bold");
  Texte(centre[0] - 200, 100, "Atome excitator", "black");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(centre[0] - 350, 150, 300, 100, "lightblue");
  Texte(centre[0] - 300, 215, "1 joueur", "black");

  RectanglePlein(centre[0] + 50, 150, 300, 100, "yellow");
  Texte(centre[0] + 100, 215, "2 joueurs", "black");

  // Règles
  setCanvasFont("helvetica", "17pt", "normal");
  Texte(50, centre[1] - 20, "Le but est d'avoir le plus gros atome avec le plus d'électrons, vous devez : \n" +
        "   - attraper les électrons en réalisant la combinaison de touche à droite\n" + "   - rester entre les 2 traits de la barre d'énergie en cliquant\n\n" +
        "Vous perdrez des électrons en restant en-dehors des barres de limite\n" + "Votre atome explosera si vous sortez des limites de la barre d'énergie\n" +
		"Vous perdrez si votre atome n'a plus d'électrons\n" +
		"Votre atome gagne de l'énergie si vous vous trompez de combinaison\n"+
		"(Les chiffres pour les combinaisons NE SONT PAS ceux du pavé numérique)", "black");

  // Affiche records de la session
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0] + centre[0]/3 + 20, centre[1] - 30, "Records:", "black");
  setCanvasFont("helvetica", "25pt", "normal");
  Texte(centre[0] + centre[0]/3 - 50, centre[1] + 60, "Normal: " + recordSession[0], "green"); // Normal
  dessinerNoyau(centre[0] + centre[0]/3 + 250, centre[1] + 50, recordSession[0]);
  setCanvasFont("helvetica", "25pt", "normal");
  Texte(centre[0] + centre[0]/3 - 50, centre[1] + 160, "Difficile: " + recordSession[1], "orange"); // Difficile
  dessinerNoyau(centre[0] + centre[0]/3 + 250, centre[1] + 150, recordSession[1]);
  setCanvasFont("helvetica", "20pt", "italic");
  Texte(centre[0] + centre[0]/3 - 50, centre[1] + 260, "Insurmontable: " + recordSession[2], "red"); // Insurmontable
  dessinerNoyau(centre[0] + centre[0]/3 + 250, centre[1] + 250, recordSession[2]);

  DrawImageObject(paramsButton, 20, 20, 100, 100);
}
//WaitPreload(menuPrincipal);

// Menu paramètres

function menuParams() {
  localisation = "params";

  noLoop();
  jeu[0] = false;

  Initialiser();

  setCanvasFont("helvetica", "40pt", "normal");
  Texte(centre[0] - 140, 100, "Paramètres", "black");

  RectanglePlein(centre[0] - 500, 200, 300, 100, (difficulte == 1) ? "gray" : "lightgray");
  Texte(centre[0] - 440, 265, "Normal", "green");

  RectanglePlein(centre[0] - 150, 200, 300, 100, (difficulte == 2) ? "gray" : "lightgray");
  Texte(centre[0] - 90, 265, "Difficile", "orange");

  setCanvasFont("helvetica", "30pt", "italic");
  RectanglePlein(centre[0] + 200, 200, 300, 100, (difficulte == 3) ? "gray" : "lightgray");
  Texte(centre[0] + 220, 265, "Insurmontable", "red");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(centre[0] - 150, 400, 300, 100, "orange");
  Texte(centre[0] - 75, 465, "Menu", "black");
}


// Page de perte

function menuPerdu() {
  localisation = "perduGagne";

  noLoop();
  jeu[0] = false;

  // Changer le record
  if (recordPartie > recordSession[difficulte-1]) {
    recordSession[difficulte-1] = recordPartie;
  }

  // Fond flou
  RectanglePlein(0, 0, centre[0] * 2, centre[1] * 2, rgba(255, 255, 255, 0.6));

  setCanvasFont("helvetica", "40pt", "bold");
  Texte(centre[0] - 100, 100, "Perdu !", "red");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(centre[0] - 350, 200, 300, 100, "lightblue");
  Texte(centre[0] - 300, 265, "Rejouer", "black");

  RectanglePlein(centre[0] + 50, 200, 300, 100, "orange");
  Texte(centre[0] + 130, 265, "Menu", "black");

  // Affiche score de la partie
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0] - 200, centre[1] + 70, "Score: " + recordPartie, "black");
  dessinerNoyau(centre[0] + 40, centre[1] + 55, recordPartie);

  // Affiche record de la session
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0] - 220, centre[1] + 200, "Record: " + recordSession[difficulte-1], "black");
  dessinerNoyau(centre[0] + 40, centre[1] + 185, recordSession[difficulte-1]);

  resetVars();
}


// Page de victoire

function menuGagne() {
  localisation = "perduGagne";

  noLoop();
  jeu[0] = false;

  // Fond flou
  RectanglePlein(0, 0, centre[0] * 2, centre[1] * 2, rgba(255, 255, 255, 0.6));

  setCanvasFont("helvetica", "40pt", "bold");
  Texte(centre[0] - 100, 100, "Gagné !", "green");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(centre[0] - 350, 200, 300, 100, "lightblue");
  Texte(centre[0] - 300, 265, "Rejouer", "black");

  RectanglePlein(centre[0] + 50, 200, 300, 100, "orange");
  Texte(centre[0] + 130, 265, "Menu", "black");

  setCanvasFont("helvetica", "18pt", "normal");
  Texte(centre[0] - 230, 150, "Bravo vous avez vaincu Atome Excitator !", "green");
  Texte(centre[0] - 410, 175, "Vous avez atteint l'Argon, vous devez donc être un chimiste de renom", "green");

  // Affiche record de la session
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0] - 300, centre[1] + 200, "Record précédent: " + recordSession[difficulte-1], "black");
  dessinerNoyau(centre[0] + 150, centre[1] + 185, recordSession[difficulte-1]);

  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0]*3/8, centre[1], "Essayez de rejouer avec la difficulté supérieure !", "black");

  // Changer le record
  recordSession[difficulte-1] = 18;

  resetVars();
}


function MouseClick(x, y) {
  switch (localisation) {
  case "principal":
    // Menu: 1 joueur
    if (x > centre[0] - 350 && x < centre[0] - 50 && y > 150 && y < 250) {
      partieUnJoueur();

      // Menu: 2 joueurs
    } else if (x > centre[0] + 50 && x < centre[0] + 250 && y > 150 && y < 250) {
      menuDeuxJoueurs();

      // Menu: paramètres
    } else if (x < 110 && y < 110) {
      menuParams();
    }
    break;

  case "partieUnJoueur":
    // Pause
    if (x > centre[0] * 2 - 140 && y < 150) {
      if (jeu[0]) {
        noLoop();
        jeu[0] = false;
        drawPlay();
      } else {
        Loop(-1);
        jeu[0] = true;
      }
      // Retour Menu
    } else if (x > (centre[0] * 2 - 115) && y > (centre[1] * 2 - 115)) {
      noLoop();
      jeu[0] = false;
      resetVars();
      menuPrincipal();

    } else if (jeu[0]) {
      energie += 20 * difficulte; // Difficulte : vitesse énergie augmente
    }
    break;

  case "perduGagne":
    // Rejouer
    if (x > centre[0] - 350 && x < centre[0] - 50 && y > 200 && y < 300) {
      partieUnJoueur();

      // Menu principal
    } else if (x > centre[0] + 50 && x < centre[0] + 350 && y > 200 && y < 300) {
      menuPrincipal();
    }
    break;

  case "params":
    // Difficulté
    if (x > centre[0] - 500 && x < centre[0] - 200 && y > 200 && y < 300) { // Normal
      difficulte = 1;
      menuParams();
    } else if (x > centre[0] - 150 && x < centre[0] + 150 && y > 200 && y < 300) { // Difficile
      difficulte = 2;
      menuParams();
    } else if (x > centre[0] + 200 && x < centre[0] + 500 && y > 200 && y < 300) { // Insurmontable
      difficulte = 3;
      menuParams();
    } else if (x > centre[0] - 150 && x < centre[0] + 150 && y > 400 && y < 500) { // Menu
      menuPrincipal();
    }
      break;
      
case "menuDeuxJoueurs":
      // Jeu local
    if (x > centre[0] - 350 && x < centre[0] - 50 && y > 150 && y < 250) {
		alert("2 joueurs local");

      // Jeu en ligne
/*    } else if (x > centre[0] + 50 && x < centre[0] + 250 && y > 150 && y < 250) {
       alert("2 joueurs en ligne");();*/

      // Menu: paramètres
    } else if (x < 110 && y < 110) {
      alert("params 2 joueurs");
      
      // Retour Menu
    } else if (x > (centre[0]*2-130) && y < 120) {
      menuPrincipal();
    }
      break;
      
  case "TEST":
    // TEST = ACTION LORS CLICK (click en bas)
    if (y > (centre[1] + 2 * (centre[1] / 3))) {
      menuPerdu();
    }
      break;
  }
}


// Dessiner un noyau d'atome: cercle + nom élément

function dessinerNoyau(x, y, n) {
  CerclePlein(x, y, 50 + 5 * (n - 1), rgb(r - 7 * n, g + 5 * n, b - 13 * n));
  setCanvasFont("helvetica", "18pt", "normal");
  Texte(x - 10, y + 10, atomes[n - 1], "black");
}


// Dessiner noyau et couches

function dessinerUnAtome(x, y, n, couche) {
  dessinerNoyau(x, y, n);

  // Dessiner toutes les sous-couches
  for (var i = 0; i < couche; i++) {
    Cercle(x, y, 150 + 50 * (i), "red");
  }
}


// Rajouter un électron à l'atome, j = joueur: 0/1

function addElec(j) {
  if (electronsRotating[j][jeu[3][j] - 1] < 2 + 4 * (jeu[3][j] - 1)) { // Ajouter 1 électron à la dernière couche
    electronsRotating[j][jeu[3][j] - 1] = enEntier(electronsRotating[j][jeu[3][j] - 1]) + 1;
  } else {
    jeu[3][j]++; // Add couche
    electronsRotating[j].push(1);
  }
  jeu[2][j]++; // Ajouter numéro atomique
  // Victoire
  if (jeu[2][j] > 18) {
    menuGagne();
  }

  // Changer le score
  if (jeu[2][j] > recordPartie) {
    recordPartie = jeu[2][j];
  }
}

// Retirer un électron à l'atome

function delElec(j) {
  jeu[2][j]--; // Retirer numéro atomique
  if (jeu[2][j] <= 0) { // Perdu car tous d'électrons
    menuPerdu();
  } else if (electronsRotating[j][Taille(electronsRotating[j]) - 1] > 1) { // Retirer 1 électron à la dernière couche
    electronsRotating[j][Taille(electronsRotating[j]) - 1] = enEntier(electronsRotating[j][Taille(electronsRotating[j]) - 1]) - 1;
  } else {
    jeu[3][j]--; // Retirer couche
    electronsRotating[j].pop();
  }
}


// Déplacer tous les électrons d'un degré

function deplacElecs() {
  // ELECTRONS ATOME
  var angle = 2 * Math.PI * jeu[4] / 360;

  // Joueurs / Atomes
  for(var j = 0; j < Taille(electronsRotating); j++) {
	// Regarder toutes les couches
	var couche = Taille(electronsRotating[j]);
	for (var n = 0; n < couche; n++) {
		var rayon = 75 + 25 * n;
		// Regarder tous les électrons par couche
		for (var e = 0; e < electronsRotating[j][n]; e++) {
		// Déplacement circulaire
		CerclePlein(rayon * Math.cos(angle + 2 * e * Math.PI / electronsRotating[j][n] + n * Math.PI / 2) + centre[0], rayon * Math.sin(angle + 2 * e * Math.PI / electronsRotating[j][n] + n * Math.PI / 2) + centre[1], 20, "gray");
		}
	}
}


  // ELECTRONS LIBRES
  var elecsL = Taille(electronsLibres);
  for (var eL = 0; eL < elecsL; eL++) {
    if (electronsLibres[eL]) { // Eviter bugs: essaie de déplacer alors que supprimé
      electronsLibres[eL][5] += 6; // Vitesse déplacement (par frame)
      electronsLibres[eL][0] = Math.cos(2 * Math.PI * electronsLibres[eL][4] / 360) * electronsLibres[eL][5] + electronsLibres[eL][2]; // Déplacement X
      if (electronsLibres[eL][3] == 0) { // Déplacement vers le haut ou le bas selon l'apparition
        electronsLibres[eL][1] = Math.sin(2 * Math.PI * electronsLibres[eL][4] / 360) * electronsLibres[eL][5] + electronsLibres[eL][3]; // Déplacement X
      } else {
        electronsLibres[eL][1] = -Math.sin(2 * Math.PI * electronsLibres[eL][4] / 360) * electronsLibres[eL][5] + electronsLibres[eL][3]; // Déplacement X
      }

      // S'ils dépassent la fenêtre ils disparaissent
      if (electronsLibres[eL][0] > centre[0] * 2 || electronsLibres[eL][0] < 0 || electronsLibres[eL][1] > centre[1] * 2 || electronsLibres[eL][1] < 0) {
        electronsLibres.splice(eL, 1);
      } else {
        CerclePlein(electronsLibres[eL][0], electronsLibres[eL][1], 20, "gray");
      }
    }
  }
}


function Keypressed(k) {
  if (jeu[0] == true && Taille(electronsLibres) > 0) {
    if (localisation == "perduGagne") {
      alert(k);
    }
    // Regarder si touche appuyée correspond
    var touches = Taille(electronsLibres[0][6]);
    var delEL = false; // Supprimer l'eL = erreur ou fini
    var t = 0;
    // Test touches dans l'ordre
    do {
      if (electronsLibres[0][6][t][1] == 1) { // Si touche déjà faite on passe
      } else if (k == electronsLibres[0][6][t][0]) { // Si bonne touche
        if (t == touches - 1) {
          delEL = true;
          // SUCCEED
          addElec(0);
        }
        electronsLibres[0][6][t][1] = 1; // ERROR: win -> cannot read property 6 of undefined
        break;
      } else { // Si mauvaise touche
        // FAILED
        polyElecL.push([electronsLibres[0][0], electronsLibres[0][1], 30]); // Ajouter polygone d'explosion à la dernière position de l'électron pendant 30Frames
        //AfficherTableau(polyElecL);
        //Ecrire("___________");
        delEL = true;
        energie += 150;
        break;
      }
      t++;
      //AfficherTableau(electronsLibres[0][6]);
    } while (electronsLibres[0][6][t - 1][1] == 1 && t < touches && t < 20);

    if (delEL) {
      electronsLibres.shift(); // Retire le premier électron des libres si réussi ou raté
    }
  }
}


// Afficher polynomes d'explosion des électrons libres

function drawPolyElecL() {
/*var polys = Taille(polyElecL);
	for(var i=0; i<polys; i++){
	  if(polyElecL[i][2] > 0){ // PROBLEME LORSQUE ELECTRON SORT ou ERREUR TOUCHE
		var cotes = [];
		// Position des 7 sommets, dépend du temps déjà affiché
		for(var j=0; j<7; j++){
		  var x = Math.round(Math.cos(j*Math.PI/7)*polyElecL[i][2]+polyElecL[i][0]);
		  var y = Math.round(Math.sin(j*Math.PI/7)*polyElecL[i][2]+polyElecL[i][1]);
		  cotes.push([x,y]);
		}
		//AfficherTableau(cotes);
		//Ecrire("###############");
		PolygonePlein(cotes[0][0],cotes[0][1],cotes[1][1],cotes[1][1],cotes[2][0],cotes[2][1],cotes[3][0],cotes[3][1],cotes[4][0],cotes[4][1],cotes[5][0],cotes[5][1],cotes[6][0],cotes[6][1],"red");
		polyElecL[i][2]--;
	  }else{
		polyElecL.splice(i,1);
	  }
	}*/
}


// Combinaison de touches pour ajouter électron

function genCombTouchesElec(n) {
  var combTouches = [];

  // Générer touches, n électrons = combinaison n touches
  var nbTouches = Math.round(jeu[2][0] / 4) + 1 * difficulte; // Difficulte : nombre de touches combinaison
  for (var i = 0; i < nbTouches; i++) {
    var touche = Hasard(36) + 65; // Lettre ou chiffre
    touche = (touche > 90) ? touche - 43 : touche;
    combTouches.push([touche, 0]);
  }

  electronsLibres[n].push(combTouches);
}
// Afficher combinaisons de touches à faire et lesquelles sont faites

function showCombTouchesElec() {
  if (Taille(electronsLibres) > 0) {
    setCanvasFont("helvetica", "18pt", "bold");
    RectanglePlein(centre[0] * 2 - 400, centre[1] - 75, 400, 100, "lightblue");
    Texte(centre[0] * 2 - 320, centre[1] - 50, "Combinaisons touches\n  	électrons libres", "black");

    // Afficher les touches des eL
    setCanvasFont("helvetica", "16pt", "bold");
    var touches = Taille(electronsLibres[0][6]);
    for (var t = 0; t < touches; t++) {
      RectanglePlein(centre[0] * 2 - 390 + t * 30, centre[1] - 10, 25, 25, "gray");
      Texte(centre[0] * 2 - 385 + t * 30, centre[1] + 10, Ascii_vers_Caractere(electronsLibres[0][6][t][0]), (electronsLibres[0][6][t][1] == 0) ? "black" : "green");
    }
  }
}


// Faire apparaître un électron

function spawnElec() {
  var x = Hasard(Math.round(centre[0] * 2 - centre[0] / 2 - centre[0] / 3)) + Math.round(centre[0] / 2); // Coordonnée X entre 1/4 et 5/6 de l'écran
  var direction = Hasard(96) + 45; // Angle entre 45 et 135° (direction électron)
  var y = (Hasard(2) == 1) ? centre[1] * 2 : 0; // En haut ou en bas
  CerclePlein(x, y, 20, "gray");
  electronsLibres.push([x, y, x, y, direction, 0]);
  genCombTouchesElec(Taille(electronsLibres) - 1);
}


// Afficher nombre électrons

function numElec() {
  setCanvasFont("helvetica", "30pt", "normal");
  Texte(centre[0] + 5, 50, jeu[2][0], "black");
  CerclePlein(centre[0] - 10, 40, 20, "gray");
}


// Dessiner bouton pause / play

function drawPause() {
  RectanglePlein(centre[0] * 2 - 115, 55, 20, 65, "blue");
  RectanglePlein(centre[0] * 2 - 70, 55, 20, 65, "blue");
}

function drawPlay() {
  RectanglePlein(centre[0] * 2 - 130, 50, 100, 100, "white");
  PolygonePlein(centre[0] * 2 - 115, 55, centre[0] * 2 - 55, 90, centre[0] * 2 - 115, 120, 'blue');
}


// Barre d'énergie
var x = Math.round(centre[0] / 6);
var yHaut = 50; // 0%
var yBas = Math.round(centre[1] * 2 - 100); // 100%
var hauteur = yBas - yHaut; // 100%
var midHaut = Math.round(yHaut + 3 / 8 * hauteur);
var midBas = Math.round(yHaut + 5 / 8 * hauteur);
var energie = 500; // % énergie
var virerElec = 0;

function energyBar() {
  if (energie > 0 && energie < 1000) energie -= 1 * difficulte; // Niveau de difficulte énergie
  RectanglePlein(centre[0] / 6, yBas, 50, -Math.round(energie * hauteur / 1000), (energie >= 375 && energie <= 625) ? "orange" : "red"); // Barre rouge si en dehors des limites
  Rectangle(centre[0] / 6, 50, 50, hauteur, "black");
  setCanvasFont("helvetica", "18pt", "normal");
  Ligne(x - 5, yHaut, x + 55, yHaut, "black");
  Texte(x - 60, yHaut + 7, "0 eV", "black");
  Ligne(x - 5, yBas, x + 55, yBas, "black");
  Texte(x - 100, yBas + 5, "-13,6 eV", "black");
  Ligne(x - 5, midHaut, x + 55, midHaut, "black");
  Ligne(x - 5, midBas, x + 55, midBas, "black");

  if (energie >= 375 && energie <= 625 && virerElec != 0) {
    virerElec = 0;

    // Si sort de la barre
  } else if (energie <= 0) {
    menuPerdu();
  } else if (energie >= 1000) {
    menuPerdu();

    // Au dessous/dessus des barres de limite
  } else if (energie < 375 || energie > 625) {
    virerElec++;
    if (virerElec >= 60) {
      delElec(0);
      virerElec = 0;
    }
  }
}


// Animer, actualisation toutes les frames
// ANIMATIONS

function draw() {
  if (jeu[0] && jeu[1] == 1) { // Si jeu activé et 1 joueur
	Initialiser();

	dessinerUnAtome(multiAtomes[0][0], multiAtomes[0][1], jeu[2][0], jeu[3][0]);

    drawPolyElecL();
    showCombTouchesElec();
    deplacElecs();
    numElec();

    if (jeu[0]) {
      drawPause();
    } else {
      drawPlay();
    }
    // Retour Menu
    DrawImageObject(backToMenu, centre[0] * 2 - 115, centre[1] * 2 - 115, 65, 65);

    // Spawn un électron environ toutes les 4 secondes
    if (jeu[4] == 300) {
      spawnElec();
    }

    energyBar();

    // Angle en degrés, passe à 0 si 360
    jeu[4] = (jeu[4] + 3 > 359) ? 0 : jeu[4] + 3;
  
    
    
  }else if(jeu[0] && jeu[1] == 2){ // Jeu activé, 2 joueurs
	Initialiser();
	
	dessinerUnAtome(multiAtomes[0][0], multiAtomes[0][1], jeu[2][0], jeu[3][0]);
	dessinerUnAtome(multiAtomes[1][0], multiAtomes[1][1], jeu[2][1], jeu[3][1]);
    
    deplacElecs();
  }
}

WaitPreload(draw);

// Lancer jeu 1 joueur
function partieUnJoueur() {
  Initialiser();
  localisation = "partieUnJoueur";

  multiAtomes = [[centre[0], centre[1]]];
  electronsRotating = [[1]]; // 1 seul atome

  jeu[0] = true; // Jeu lancé
  jeu[1] = 1; // Jeu 1 joueur

  // Activer l'animation
  Loop(-1);
}




// 2 joueurs
function partieDeuxJoueurs() {
	Initialiser();
	localisation = "partieDeuxJoueurs";

	multiAtomes = [[centre[0]-centre[0]/3, centre[1]],[centre[0]+centre[0]/3, centre[1]]];
  
	jeu[0] = true; // Jeu lancé
	jeu[1] = 2; // Jeu 1 joueur
  
	// Activer l'animation
	Loop(-1);
}


// Lancer jeu 2 joueurs
var touchesDeuxJoueurs = [[32,90,83,81,69],[13, 38, 40, 37, 39]]; // [J1:[clicks, haut, bas, gauche, droite][]] = [SPACE, Z,S,Q,D][ENTER, flèches] / -1 = souris ??
function menuDeuxJoueurs(){
  Initialiser();
  localisation = "menuDeuxJoueurs";

  setCanvasFont("helvetica", "40pt", "bold");
  Texte(centre[0] - 150, 100, "2 joueurs", "black");

  setCanvasFont("helvetica", "40pt", "normal");
  RectanglePlein(centre[0] - 350, 150, 300, 100, "lightgreen");
  Texte(centre[0] - 300, 215, "En Local", "black");

  RectanglePlein(centre[0] + 50, 150, 300, 100, "blue");
  Texte(centre[0] + 100, 215, "En Ligne", "black");
  Ligne(centre[0] + 50, 250, centre[0] + 350, 150, "red");
  Ligne(centre[0] + 50, 150, centre[0] + 350, 250, "red");

  // Règles
  setCanvasFont("helvetica", "17pt", "normal");
  Texte(centre[0]/3, centre[1] - 80, "Le mode 2 joueurs se joue différemment, il peut se jouer sur le même clavier ou en ligne\n" +
  " - EN LIGNE: vous rencontrez quelqu'un au hasard et vous jouez avec les touches configurées\n"+
  " - EN LOCAL: vous jouez à 2 sur le même clavier, avec les touches présentées en dessous\n\n"+
  "(Vous pouvez paramétrer vos touches dans les menu Paramètres, en haut à gauche)", "black");

  // Afficher touches configurées
  var posShowTouches = [centre[0]/3, centre[1]+160];
  setCanvasFont("helvetica", "18pt", "bold");
  RectanglePlein(posShowTouches[0], posShowTouches[1]-60, 50, 50, "lightgray");
  Texte(posShowTouches[0]+5, posShowTouches[1]-30, "A", "black");
  RectanglePlein(posShowTouches[0], posShowTouches[1], 50, 50, "lightgray");
  Texte(posShowTouches[0]+5, posShowTouches[1]+30, "S", "black");
  RectanglePlein(posShowTouches[0]-60, posShowTouches[1], 50, 50, "lightgray");
  Texte(posShowTouches[0]-55, posShowTouches[1]+30, "Q", "black");
  RectanglePlein(posShowTouches[0]+60, posShowTouches[1], 50, 50, "lightgray");
  Texte(posShowTouches[0]+65, posShowTouches[1]+30, "D", "black");
  RectanglePlein(posShowTouches[0], posShowTouches[1]+110, 50, 50, "lightgray");
  Texte(posShowTouches[0]+5, posShowTouches[1]+140, "G", "black");

  DrawImageObject(paramsButton, 20, 20, 100, 100);
  DrawImageObject(backToMenu, centre[0]*2-130, 20, 100, 100);
}