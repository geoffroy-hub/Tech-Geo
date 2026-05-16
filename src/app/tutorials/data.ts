export const TUTORIALS = [
  {
    id: 'intro-electronique',
    slug: 'introduction-electronique',
    title: "Introduction à l'électronique",
    category: 'électronique',
    image: '/images/tutorial-photos/transistor.webp',
    duration: '20 min',
    level: 'Débutant',
    description: 'Découvrez les composants de base : résistances, condensateurs, diodes et transistors.',
  },
  {
    id: 'arduino-bien-coder',
    slug: 'arduino-bien-coder',
    title: 'Bien coder avec Arduino',
    category: 'électronique',
    image: '/images/tutorial-photos/Arduino Bluetooth Car Building #L01f6e0.webp',
    duration: '15 min',
    level: 'Débutant',
    description: "Conventions de nommage, indentation, commentaires et bonnes pratiques Arduino.",
  },
  {
    id: 'kicad-pcb',
    slug: 'kicad-pcb',
    title: 'Conception de circuits PCB',
    category: 'électronique',
    image: '/images/tutorial-photos/technical-schematic-diagram-analog-electronic-260nw-2505467983.webp',
    duration: '45 min',
    level: 'Intermédiaire',
    description: 'Apprenez à utiliser KiCad pour transformer vos schémas en circuits imprimés.',
  },
  {
    id: 'html-css-modernes',
    slug: 'html-css-modernes',
    title: 'HTML & CSS modernes',
    category: 'informatique',
    image: '/images/tutorial-photos/top-view-diverse-group-people-600nw-2757624093.webp',
    duration: '30 min',
    level: 'Débutant',
    description: 'Maîtrisez Flexbox, Grid et les variables CSS pour des sites responsive.',
  },
  {
    id: 'obstacle-car',
    slug: 'robot-obstacle-arduino',
    title: 'Robot éviteur d\'obstacles',
    category: 'robotique',
    image: '/images/tutorial-photos/How to Make Obstacle Avoiding Car Using Arduino.webp',
    duration: '60 min',
    level: 'Intermédiaire',
    description: 'Construisez un robot autonome qui détecte et contourne les obstacles avec Arduino et un capteur ultrasons.',
  },
  {
    id: 'lm317',
    slug: 'regulateur-tension-lm317',
    title: 'Régulateur de tension LM317',
    category: 'électronique',
    image: '/images/tutorial-photos/R#U00e9gulateur de tension LM317 _ montages - Astuces Pratiques.webp',
    duration: '25 min',
    level: 'Intermédiaire',
    description: 'Concevez une alimentation variable réglable de 1.2V à 37V avec le célèbre régulateur LM317.',
  },
  {
    id: 'led-distance',
    slug: 'indicateur-distance-led',
    title: 'Indicateur de distance LED',
    category: 'électronique',
    image: '/images/tutorial-photos/LED DISTANCE INDICATOR.webp',
    duration: '35 min',
    level: 'Débutant',
    description: 'Créez un indicateur visuel de proximité avec des LEDs et un capteur ultrasonique HC-SR04.',
  },
  {
    id: 'pcb-home',
    slug: 'fabrication-pcb-maison',
    title: 'Fabriquer un PCB à la maison',
    category: 'électronique',
    image: '/images/tutorial-photos/Single Sided PCB Home Fabrication (Presensitized PCB).webp',
    duration: '90 min',
    level: 'Avancé',
    description: 'Méthode complète pour graver votre propre circuit imprimé à domicile avec du matériel accessible.',
  },
  {
    id: 'multiplexer',
    slug: 'multiplexeur-4-vers-1',
    title: 'Multiplexeur 4 vers 1',
    category: 'électronique',
    image: '/images/tutorial-photos/4 to 1 Multiplexer.webp',
    duration: '30 min',
    level: 'Intermédiaire',
    description: 'Comprenez le fonctionnement d\'un multiplexeur 4:1 et implémentez-le en logique combinatoire.',
  },
  {
    id: 'regulateur-78xx',
    slug: 'regulateurs-78xx',
    title: 'Régulateurs de tension 78xx',
    category: 'électronique',
    image: '/images/tutorial-photos/78xx Regulators.webp',
    duration: '20 min',
    level: 'Débutant',
    description: 'Utilisez la famille de régulateurs 78xx pour stabiliser l\'alimentation de vos montages.',
  },
  {
    id: 'bluetooth-car',
    slug: 'voiture-bluetooth-arduino',
    title: 'Voiture télécommandée Bluetooth',
    category: 'robotique',
    image: '/images/tutorial-photos/Arduino vs ESP8266 vs ESP32 Microcontroller Comparison - DIYI0T.webp',
    duration: '75 min',
    level: 'Intermédiaire',
    description: 'Construisez une voiture RC pilotée depuis votre smartphone via Bluetooth avec Arduino.',
  },
  {
    id: 'lumiere-auto',
    slug: 'lumiere-automatique',
    title: 'Lumière automatique (capteur LDR)',
    category: 'électronique',
    image: '/images/tutorial-photos/Automatic On - Off Light.webp',
    duration: '20 min',
    level: 'Débutant',
    description: 'Réalisez un circuit qui allume automatiquement une LED quand la lumière ambiante baisse.',
  },
];

type Section = {
  id: string;
  title: string;
  content: string;
  code?: string;
};

type TutorialContent = {
  title: string;
  sections: Section[];
};

export const TUTORIAL_CONTENT: Record<string, TutorialContent> = {
  'introduction-electronique': {
    title: "Introduction à l'électronique",
    sections: [
      { id: 'intro', title: 'Introduction', content: "L'électronique est la science qui étudie le déplacement des électrons dans des circuits. Pour créer des systèmes complexes, on utilise des briques élémentaires : les composants électroniques." },
      { id: 'resistance', title: 'La Résistance', content: "La résistance limite le passage du courant. Elle permet de protéger d'autres composants comme les LED et de créer des diviseurs de tension. Sa valeur se lit grâce aux bandes de couleur.", code: "// Loi d'Ohm : U = R × I\n// Exemple : R = 220Ω pour LED à 5V\n// I = (5V - 2V) / 220Ω ≈ 13.6 mA" },
      { id: 'condensateur', title: 'Le Condensateur', content: "Le condensateur agit comme un petit réservoir d'énergie. Il peut se charger et se décharger très rapidement. On l'utilise souvent pour stabiliser une tension ou filtrer des signaux." },
      { id: 'diode', title: 'La Diode', content: "La diode ne laisse passer le courant que dans un seul sens — de l'anode vers la cathode. C'est l'équivalent d'un clapet anti-retour. La LED est une diode qui émet de la lumière." },
      { id: 'transistor', title: 'Le Transistor', content: "Le transistor est le composant le plus important de l'électronique moderne. Il agit comme un interrupteur ou un amplificateur. Des milliards sont gravés dans chaque processeur." },
    ],
  },
  'arduino-bien-coder': {
    title: 'Bien coder avec Arduino',
    sections: [
      { id: 'intro', title: 'Introduction', content: "Un code bien structuré est plus facile à relire, déboguer et partager. Ces conventions s'appliquent à tout projet Arduino, petit ou grand." },
      { id: 'nommage', title: 'Conventions de nommage', content: "Utilisez des noms descriptifs en camelCase pour les variables, et UPPER_CASE pour les constantes. Évitez les noms génériques comme 'a', 'b', 'temp'.", code: "// ❌ Mauvais\nint x = 9;\n\n// ✅ Bon\nconst int LED_PIN = 9;\nint brightnessLevel = 0;" },
      { id: 'indentation', title: 'Indenter son code', content: "Utilisez 2 ou 4 espaces par niveau d'indentation. Un code bien indenté révèle sa structure d'un simple coup d'œil.", code: "void loop() {\n  if (digitalRead(BUTTON_PIN) == HIGH) {\n    for (int i = 0; i < 3; i++) {\n      digitalWrite(LED_PIN, HIGH);\n      delay(200);\n      digitalWrite(LED_PIN, LOW);\n      delay(200);\n    }\n  }\n}" },
      { id: 'commentaires', title: 'Commenter efficacement', content: "Commentez le POURQUOI, pas le QUOI. Le code dit déjà ce qu'il fait — expliquez l'intention.", code: "// Clignote 3 fois pour signaler une erreur de lecture capteur\nfor (int i = 0; i < 3; i++) {\n  digitalWrite(LED_ERROR, HIGH);\n  delay(100);\n  digitalWrite(LED_ERROR, LOW);\n  delay(100);\n}" },
    ],
  },
  'kicad-pcb': {
    title: 'Conception de circuits PCB',
    sections: [
      { id: 'schema', title: 'Saisie du schéma', content: "Tout commence par le schéma électrique. C'est ici que vous définissez les connexions logiques entre vos composants, indépendamment de leur position physique sur la carte." },
      { id: 'empreintes', title: 'Assignation des empreintes', content: "Chaque composant symbolique doit être relié à une empreinte (footprint) physique qui correspond à sa taille réelle sur la carte : SMD 0402, DIP-8, TO-92, etc." },
      { id: 'routage', title: 'Routage des pistes', content: "Placez les composants sur la carte et tracez les pistes de cuivre. Respectez les règles de clearance, de largeur minimale (au moins 0.25mm pour signaux, 1mm+ pour alimentation)." },
      { id: 'fabrication', title: 'Export Gerber', content: "Une fois le design terminé, générez les fichiers Gerber (GTL, GBL, GTS, GBS, GTO, GBO, DRL). Ces fichiers sont envoyés aux usines comme JLCPCB ou PCBWay.", code: "# Fichiers Gerber à générer :\n# GTL  → Cuivre face avant\n# GBL  → Cuivre face arrière\n# GTS  → Masque de soudure avant\n# GTO  → Sérigraphie avant\n# DRL  → Fichier de perçage" },
    ],
  },
  'html-css-modernes': {
    title: 'HTML & CSS modernes',
    sections: [
      { id: 'html5', title: 'Structure HTML5 sémantique', content: "Utilisez les balises sémantiques HTML5 pour améliorer le SEO et l'accessibilité de vos pages.", code: "<header>\n  <nav>...</nav>\n</header>\n<main>\n  <section>\n    <article>...</article>\n  </section>\n</main>\n<footer>...</footer>" },
      { id: 'flexbox', title: 'Flexbox', content: "Flexbox est idéal pour aligner des éléments dans une seule dimension (ligne ou colonne). Parfait pour les barres de navigation, les cartes côte à côte.", code: ".navbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}" },
      { id: 'grid', title: 'CSS Grid', content: "Grid permet de concevoir des mises en page en deux dimensions simultanément. C'est la solution pour les layouts complexes en colonnes et lignes.", code: ".cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}" },
      { id: 'variables', title: 'Variables CSS', content: "Les custom properties centralisent vos valeurs de design. Modifier une variable met à jour toute l'interface.", code: ":root {\n  --clr-primary: #00e6b0;\n  --clr-bg: #051c24;\n  --radius: 8px;\n}\n\n.btn {\n  background: var(--clr-primary);\n  border-radius: var(--radius);\n}" },
    ],
  },
  'robot-obstacle-arduino': {
    title: "Robot éviteur d'obstacles",
    sections: [
      { id: 'materiel', title: 'Matériel nécessaire', content: "Pour ce projet : 1 Arduino Uno, 1 châssis 2 roues, 2 moteurs DC, 1 driver L298N, 1 capteur HC-SR04, 1 servomoteur SG90, câbles et batterie 9V." },
      { id: 'capteur', title: 'Câbler le capteur HC-SR04', content: "Le capteur ultrasonique HC-SR04 mesure la distance par échos sonores. Il envoie une impulsion et mesure le temps de retour.", code: "// Câblage HC-SR04\n// VCC → 5V\n// GND → GND\n// Trig → Pin 9\n// Echo → Pin 10\n\nlong mesureDistance() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long duree = pulseIn(ECHO, HIGH);\n  return duree * 0.034 / 2; // en cm\n}" },
      { id: 'moteurs', title: 'Contrôler les moteurs', content: "Le module L298N permet de contrôler la direction et la vitesse de deux moteurs DC indépendamment via des signaux PWM.", code: "void avancer() {\n  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 180);\n  analogWrite(ENB, 180);\n}\n\nvoid reculer() {\n  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);\n  digitalWrite(IN3, LOW); digitalWrite(IN4, HIGH);\n}" },
      { id: 'logique', title: 'Logique d\'évitement', content: "Si la distance est inférieure à 20 cm, le robot recule, tourne à droite ou à gauche selon la direction libre détectée par le servo.", code: "void loop() {\n  int dist = mesureDistance();\n  if (dist < 20) {\n    arreter();\n    delay(300);\n    reculer();\n    delay(400);\n    tournerDroite();\n    delay(350);\n  } else {\n    avancer();\n  }\n}" },
    ],
  },
  'regulateur-tension-lm317': {
    title: 'Régulateur de tension LM317',
    sections: [
      { id: 'intro', title: 'Présentation du LM317', content: "Le LM317 est un régulateur de tension ajustable positif pouvant fournir de 1.25V à 37V avec un courant max de 1.5A. Il est robuste, économique et très utilisé en laboratoire." },
      { id: 'formule', title: 'Calcul de la tension de sortie', content: "La tension de sortie dépend du rapport des deux résistances R1 et R2.", code: "// Formule : Vout = 1.25 × (1 + R2/R1)\n// Exemple pour 5V :\n// R1 = 240Ω, R2 = 720Ω\n// Vout = 1.25 × (1 + 720/240) = 1.25 × 4 = 5V" },
      { id: 'montage', title: 'Schéma de montage', content: "Le montage de base nécessite deux résistances, deux condensateurs de découplage (0.1µF en entrée, 1µF en sortie) et optionnellement une diode de protection." },
      { id: 'potentiometre', title: 'Version réglable', content: "Remplacez R2 par un potentiomètre 10kΩ pour obtenir une tension réglable en continu — parfait pour une alimentation de laboratoire.", code: "// Plage avec pot 10kΩ et R1=240Ω :\n// Min : Vout = 1.25V (pot à 0)\n// Max : Vout = 1.25 × (1 + 10000/240) ≈ 53V\n// (limité à 37V max par le LM317)" },
    ],
  },
  'indicateur-distance-led': {
    title: 'Indicateur de distance LED',
    sections: [
      { id: 'intro', title: 'Principe du projet', content: "Ce projet affiche la proximité d'un objet grâce à une rangée de LEDs : plus l'objet est proche, plus de LEDs s'allument. Idéal pour un radar de recul ou un détecteur de présence." },
      { id: 'composants', title: 'Composants utilisés', content: "Arduino Uno, capteur HC-SR04, 5 LEDs (rouge/orange/verte), 5 résistances 220Ω, breadboard et câbles." },
      { id: 'code', title: 'Code de base', content: "On mappe la distance mesurée sur 5 niveaux d'affichage avec la fonction map() d'Arduino.", code: "const int LEDS[] = {2, 3, 4, 5, 6};\n\nvoid loop() {\n  long dist = mesureDistance();\n  int niveau = map(dist, 5, 50, 5, 0);\n  niveau = constrain(niveau, 0, 5);\n  for (int i = 0; i < 5; i++) {\n    digitalWrite(LEDS[i], i < niveau ? HIGH : LOW);\n  }\n  delay(100);\n}" },
    ],
  },
  'fabrication-pcb-maison': {
    title: 'Fabriquer un PCB à la maison',
    sections: [
      { id: 'methode', title: 'Méthode présensibilisée', content: "On utilise une plaque présensibilisée (recouverte d'une résine photosensible). On expose aux UV à travers un calque imprimé, puis on développe et on grave." },
      { id: 'calque', title: 'Préparer le calque', content: "Imprimez votre circuit en négatif sur papier transparent (calque) avec une imprimante laser. Le noir doit être très opaque — plusieurs passes si nécessaire." },
      { id: 'exposition', title: 'Exposition UV', content: "Exposez la plaque aux UV pendant 2 à 4 minutes selon votre source lumineuse. Une boîte à UV dédiée donne les meilleurs résultats." },
      { id: 'gravure', title: 'Développement et gravure', content: "Développez dans une solution de soude (NaOH) diluée, puis gravez dans du perchlorure de fer (FeCl3) à 40°C. Rincez abondamment à l'eau.", code: "// Solution de gravure :\n// Perchlorure de fer FeCl3 :\n//   250g pour 500ml d'eau chaude\n//   Temps : 15-30 min à 40°C\n//   Agiter régulièrement\n\n// ⚠️ Porter des gants et lunettes !" },
    ],
  },
  'multiplexeur-4-vers-1': {
    title: 'Multiplexeur 4 vers 1',
    sections: [
      { id: 'definition', title: 'Qu\'est-ce qu\'un multiplexeur ?', content: "Un multiplexeur (MUX) est un circuit combinatoire qui sélectionne une parmi N entrées et la connecte à une sortie unique, selon la valeur de bits de sélection." },
      { id: 'table-verite', title: 'Table de vérité', content: "Pour un MUX 4:1, on a 2 bits de sélection (S1, S0) et 4 entrées (I0 à I3).", code: "// Table de vérité MUX 4:1\n// S1 S0 | Sortie Y\n//  0  0 |   I0\n//  0  1 |   I1\n//  1  0 |   I2\n//  1  1 |   I3\n\n// Équation : Y = S1'S0'·I0 + S1'S0·I1\n//              + S1S0'·I2 + S1S0·I3" },
      { id: 'implementation', title: 'Implémentation Arduino', content: "On peut simuler un MUX logiciel avec Arduino pour router des signaux capteurs vers une seule sortie série.", code: "int mux4to1(int I0, int I1, int I2, int I3, int S1, int S0) {\n  if (!S1 && !S0) return I0;\n  if (!S1 &&  S0) return I1;\n  if ( S1 && !S0) return I2;\n  return I3;\n}" },
    ],
  },
  'regulateurs-78xx': {
    title: 'Régulateurs de tension 78xx',
    sections: [
      { id: 'famille', title: 'La famille 78xx', content: "Les régulateurs 78xx produisent une tension fixe positive. Le suffixe indique la tension : 7805 → 5V, 7809 → 9V, 7812 → 12V. Courant max : 1A." },
      { id: 'montage', title: 'Montage de base', content: "Le montage est très simple : une capacité d'entrée (0.33µF) et une de sortie (0.1µF) suffisent.", code: "// Brochage TO-220 :\n// Pin 1 → Entrée (Vin > Vout + 2V)\n// Pin 2 → Masse (GND)\n// Pin 3 → Sortie (Vout fixe)\n\n// Exemple 7805 :\n// Vin entre 7V et 35V → Vout = 5V stable" },
      { id: 'dissipateur', title: 'Gestion thermique', content: "Le régulateur dissipe l'excès de tension en chaleur. Pour plus de 500mA, un dissipateur thermique est indispensable. Puissance dissipée = (Vin - Vout) × I." },
    ],
  },
  'voiture-bluetooth-arduino': {
    title: 'Voiture télécommandée Bluetooth',
    sections: [
      { id: 'materiel', title: 'Matériel', content: "Arduino Uno, châssis 4 roues, 2 modules L298N, module HC-05 Bluetooth, batterie LiPo 7.4V, et l'app Android 'Arduino Bluetooth Controller'." },
      { id: 'bluetooth', title: 'Configurer le HC-05', content: "Le HC-05 se configure en mode AT pour définir le baudrate, le nom et le PIN d'appairage.", code: "// Mode AT : relier KEY à 3.3V au démarrage\n// Baudrate : 38400\nAT+NAME=TechGeoCar\nAT+PSWD=1234\nAT+UART=9600,0,0" },
      { id: 'controle', title: 'Protocole de commande', content: "L'app envoie un caractère unique par Bluetooth : 'F' = avant, 'B' = arrière, 'L' = gauche, 'R' = droite, 'S' = stop.", code: "void loop() {\n  if (Serial.available()) {\n    char cmd = Serial.read();\n    switch(cmd) {\n      case 'F': avancer(); break;\n      case 'B': reculer(); break;\n      case 'L': tournerGauche(); break;\n      case 'R': tournerDroite(); break;\n      case 'S': arreter(); break;\n    }\n  }\n}" },
    ],
  },
  'lumiere-automatique': {
    title: 'Lumière automatique (LDR)',
    sections: [
      { id: 'ldr', title: 'La photorésistance LDR', content: "Une LDR (Light Dependent Resistor) change de résistance selon la luminosité : forte lumière → faible résistance, obscurité → forte résistance." },
      { id: 'diviseur', title: 'Diviseur de tension', content: "On crée un diviseur de tension entre la LDR et une résistance fixe de 10kΩ. La tension au milieu varie avec la lumière — on la lit avec analogRead().", code: "// Câblage :\n// 5V → LDR → A0 → R10k → GND\n\nint valeurLDR = analogRead(A0);\n// Obscurité : valeur élevée (~900)\n// Lumière vive : valeur faible (~100)" },
      { id: 'seuil', title: 'Déclencher la LED', content: "On définit un seuil : si la valeur dépasse ce seuil (obscurité), la LED s'allume automatiquement.", code: "const int SEUIL = 500;\nconst int LED_PIN = 13;\n\nvoid loop() {\n  int ldr = analogRead(A0);\n  if (ldr > SEUIL) {\n    digitalWrite(LED_PIN, HIGH); // Nuit\n  } else {\n    digitalWrite(LED_PIN, LOW);  // Jour\n  }\n  delay(100);\n}" },
    ],
  },
};
