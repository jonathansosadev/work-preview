var fs = require('fs');
var app = require('../../../server/server');

var dirtyNamesStr = 'Pascal;LOUVION\n' +
  'Jeremy;Auribot\n' +
  'Emmanuelle;BESCOND\n' +
  'Ludovic;Bourdais\n' +
  'Eric;Le Pauloue\n' +
  'ELODIE;ROESCH\n' +
  'Erick;Adrian\n' +
  'SABRINA;FRANCESCHI\n' +
  ';\n' +
  'Karine;PALMACCI\n' +
  'JEAN-CHRISTOPHE;WARIN\n' +
  'Sylvie;Cardinael\n' +
  'Céline;SCOBRY\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Michel;Aupetit\n' +
  'Laurent;Hellec\n' +
  'Benjamin;Lizambart\n' +
  'Gaetan;Morat\n' +
  'jf;louvet\n' +
  'THIERRY;DEVOS\n' +
  'Amélie;Poulain\n' +
  'Tatiana;Gillain\n' +
  'Alban;Outreman\n' +
  'David;Da Costa\n' +
  'Romuald;Ney\n' +
  'Christophe;Chretien\n' +
  ';\n' +
  'Isabelle;Souquet\n' +
  'Alain;Mounes\n' +
  'Bertrand;GUILET\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'MARIE;BEAUCHAUD\n' +
  'Roland;Athes\n' +
  'Jerome;Carbonnier\n' +
  'Marc;Simonnot\n' +
  'Olivier;Renaud\n' +
  'Jose;Pires\n' +
  'Michael;Bruant\n' +
  'Philippe;Torossian\n' +
  'Christophe;Verzeni\n' +
  'Herve;Jouvet\n' +
  'Patrick;Mouïe\n' +
  'Marie;Derekeneire\n' +
  'Franck;Genet\n' +
  'Lionel;Boura\n' +
  'Jean-Christophe;Verdier\n' +
  'Inès;Benhenda\n' +
  ';\n' +
  'Moïse;PINHO\n' +
  'Bertrand;Desmoudt\n' +
  'Wach;Gilles\n' +
  'Gerrebout;Rodolphe\n' +
  'Christelle;Beauchamp\n' +
  ';\n' +
  ';\n' +
  'Cecile;Wacheux\n' +
  'Vincent;Roskoschny\n' +
  'Régis;Petit\n' +
  'David;Piccavet\n' +
  ';\n' +
  'Stéphane;COMMON\n' +
  ';\n' +
  'Jean Philippe;Diaz\n' +
  ';\n' +
  'Julien;ZARDY\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Muriel;Maylin\n' +
  ';\n' +
  'OLIVIER;WANDELS\n' +
  'Bruno;Ronan\n' +
  'Romain;Godet\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'JEAN-YVES;CROUZET\n' +
  ';\n' +
  'Lemoine;Patrick \n' +
  'Eric;Mehareche\n' +
  'BERTRAND;LEBLOND\n' +
  'CHRISTOPHE;BOURDIN\n' +
  'Samuel;Danglot\n' +
  'Patrice;DURUT\n' +
  'DAVID;JARZYNKA\n' +
  'Bertrand;Wable\n' +
  'Maxime;Flan\n' +
  'JULIEN;PAILOT\n' +
  'LAURENT;FERMEN\n' +
  'PASCAL;BREBION\n' +
  'Olivier ;Charlot \n' +
  'DAVID;LEVEL\n' +
  'sebastien;cleret\n' +
  'valerie;hamille\n' +
  'Raphaël;BELLOT\n' +
  'Stéphanie;Moreau\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Christian;Digoin\n' +
  ';\n' +
  'Mickael;JUMONT\n' +
  ';\n' +
  ';\n' +
  'Didier;Vano\n' +
  ';\n' +
  'Stéphane;Brée\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Roger;KEMPF\n' +
  'JEAN-PHILIPPE;ARNAUD\n' +
  'MICKAEL;RETIERE\n' +
  ';\n' +
  'Stanislas;De Fombelle\n' +
  ';\n' +
  ';\n' +
  'Denis;LEROUX\n' +
  ';\n' +
  'YANN;LERAY\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Stanislas;Justeau\n' +
  ';\n' +
  ';\n' +
  'AURELIEN;LEROUX\n' +
  ';\n' +
  'CHRISTOPHE;GOHIER\n' +
  'Franck;MORISSET\n' +
  'Olivier;JEAN\n' +
  'Valerie;Jacquet\n' +
  ';\n' +
  ';\n' +
  'Bertrand;Bouquet\n' +
  ';\n' +
  'Christophe;COTE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Régis;DUGAT\n' +
  ';\n' +
  ';\n' +
  'Guy;LOUIS\n' +
  'Cécilia;LOUIS\n' +
  'JEAN PHILIPPE;TOURNAY\n' +
  'LAURE;DE SOUZA\n' +
  'Philippe;LE CROM\n' +
  'Nicolas;Zelus\n' +
  'Eric;Sercer\n' +
  'veronique;watry\n' +
  'Jean Michel;Demarcq\n' +
  'Xavier;Saison\n' +
  'Jean Paul;Lempereur\n' +
  'Boris;Boutin\n' +
  'Jessica;Duval\n' +
  'Mickaël;Helias\n' +
  'THIERRY;LANGLOIS\n' +
  'Dominique;MOCQ\n' +
  ';\n' +
  ';\n' +
  'Demange;Bernard\n' +
  'John;BELLEMON\n' +
  'PASCAL;MENJUCQ\n' +
  'Frédéric ;MENJUCQ\n' +
  'Carlos;SIMOES\n' +
  'Catherine;INCERA\n' +
  'Anne-Marie;RAMOS\n' +
  'Carole;SAINTECATHERINE\n' +
  ';\n' +
  'Benedicte;\n' +
  'WHITNEY;WHELAN\n' +
  'Gaëlle;Lecuyer\n' +
  'Gaelle;MURGER\n' +
  'Charles;WESTERLOPPE\n' +
  'Joël;Touzet\n' +
  'Laurence;Waldmann\n' +
  ';\n' +
  ';\n' +
  'Yann;SOUCHET\n' +
  'Alexandra;MARANI\n' +
  'Delphine;Leme\n' +
  'OLIVIA;NAFFRECHOUX\n' +
  'Pascal ;CAVANNA\n' +
  'Alexandre ;EVRARD\n' +
  'Alain ;DAVID\n' +
  'Enrico ;FASOLI\n' +
  'Bruno ;CHEVALLIER\n' +
  'Djamel;DADDY\n' +
  'Alizee;Courtadon\n' +
  'Fabien ;GERMANEAU\n' +
  'Thomas ;FEUILLETTE\n' +
  'Franck ;CHAPON\n' +
  'Rudy ;DAVERDON\n' +
  'Lionel ;VIEIRA\n' +
  'Thierry ;CONTENT\n' +
  'Philippe ;REDONDIN\n' +
  'Bertrand ;CHAUMONT\n' +
  'Yvan ;DJODY\n' +
  'Jérôme ;VERSMISSEN\n' +
  'Nicolas ;BLANCHARD\n' +
  'Nicolas ;BELUGOU\n' +
  'Laetitia ;KAYSER\n' +
  'Dimitri ;WAJNSZTOK\n' +
  'Anna ;SUCHET\n' +
  'Alexandre ;LEZY\n' +
  'Nicolas ;DAUDET\n' +
  'Benjamin ;LEBLON\n' +
  'Fanny ;REBOUX\n' +
  'Pierre ;MICHELS\n' +
  'Georges ;MARTINS\n' +
  'Gregory ;HOUNKPATIN\n' +
  'Philippe ;ROBIN\n' +
  'Aude ;FERRAND\n' +
  'Arnold ;CROS\n' +
  'Vincent ;TSANAKTZIS\n' +
  'Laurent ;VERSOT\n' +
  'Jean Edouard ;HULBRON\n' +
  'Pascal ;LECANU\n' +
  'Frédéric ;LENCK\n' +
  'Tulio ;PIRES DA SILVA\n' +
  'Frédéric ;GUERIN\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'thomas;wozniak\n' +
  ';\n' +
  'Perrine;Sauvage\n' +
  'Fabien;Lonchampt\n' +
  'PHILIPPE;RICHARD\n' +
  'Jorge;AFONSO\n' +
  'Laurent;Clerc\n' +
  'Sebastien;Riva\n' +
  'Olivier;LANSIAUX\n' +
  'Sandro;Di Giusto\n' +
  'Sandrine;Papin\n' +
  ';\n' +
  ';\n' +
  'Bruno;NGUYEN\n' +
  'Laurent;Vittenet\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Justo;Demartini\n' +
  'Eric;XIBERRAS\n' +
  'Jean-Louis;Vergnet\n' +
  'Philippe;Bouttier\n' +
  ';\n' +
  'Ludovic;Brigant\n' +
  ';\n' +
  'FABIEN;CHANOINE\n' +
  'MICKAEL;CARTRY\n' +
  'PATRICK;COCHETEAU\n' +
  'SYLVAINE;MULLOT\n' +
  'GUILLAUME;LEBARBIER\n' +
  'Franck;Queval\n' +
  'Matthieu;Espinho\n' +
  'Samuel;CHAUDANSON\n' +
  'Jonathan;Pastre\n' +
  'Mickael;Lematte\n' +
  ';Portal\n' +
  'Alexandre;Carlier\n' +
  ';Lefebvre\n' +
  ';Aqquaoui\n' +
  'laetizia;estivaux\n' +
  'EMMANUEL;GAISNE\n' +
  'Elodie;Manchon\n' +
  'Elisette;Afonso\n' +
  'Alexandre;SAUSSEREAU\n' +
  'Florian;MEYNIER\n' +
  'JIMMY;FERNANDES\n' +
  'Thierry;Sorin\n' +
  'Fabien;Gogué\n' +
  'Eric;Gavillet\n' +
  'Perro;Alice\n' +
  'Emmanuel ;Gomes\n' +
  'Frédéric;Truel\n' +
  'Damien;Borderie\n' +
  'Julie ;Brunerie\n' +
  'Philippe;Madelmont\n' +
  'Marine;Touroute\n' +
  'Abdel;Akel\n' +
  'Thierry;Gilet\n' +
  'François;Léger\n' +
  'Pascal;Cipierre\n' +
  ';\n' +
  'Marion;PAROT\n' +
  ';\n' +
  'VERONIQUE;GUERREY\n' +
  ';\n' +
  'CAROLINE;CHEVALIER ECOBICHON\n' +
  'PATRICE;LEGAVRE\n' +
  'STEVE;MARTIN\n' +
  'JEROME;LAINE\n' +
  'François;PICARD\n' +
  'Franck;FOLLET\n' +
  'Didier;LOISON\n' +
  'Bertille;DEPARTOUT\n' +
  'Gaetan;MERPAULT\n' +
  'Nicolas;OILLIC\n' +
  'Adrien;LUCAS\n' +
  'SEBASTIEN;BEROUJON\n' +
  ';\n' +
  'Aurelien;Rey\n' +
  'Bruno;DEMESY\n' +
  'Mohsen;MORKOS\n' +
  'Mathieu;BRETON\n' +
  'Philippe;MONTFORT\n' +
  'Richard;GUILLEMOT\n' +
  'Pascal;BERNARD\n' +
  'Virginie;Parot\n' +
  'Bruno;Chadebech\n' +
  'SYLVAIN;TERRYN\n' +
  'David;VERDON\n' +
  'Thierry;OMNES\n' +
  'Olivier;STEPHAN\n' +
  'PATRICE;GILIBERT\n' +
  'MATHIEU;OLIVENCIA\n' +
  'Dominique;AUFFRET\n' +
  'Franck;NAGOT\n' +
  'Michel;MOALIC\n' +
  'Thierry;DEBOUT\n' +
  'Pierrick;QUEILLE\n' +
  'Joel;MENEC\n' +
  'Manuel;GUENEUGUES\n' +
  'Pierre-Olivier;CUEFF\n' +
  'Jacques;SALEZ\n' +
  'Christophe;MICHAUT\n' +
  'Marco;DE AMORIN\n' +
  'Sébastien;LAC\n' +
  'William;DUBOIS\n' +
  'Didier;GRAGLIA\n' +
  'David;COUDROY\n' +
  'Samuel;AIECH\n' +
  'Mathias;JULIA\n' +
  'Vincent;FIEVET\n' +
  'Hubert;CHESNEL\n' +
  'Cyril;MINART\n' +
  'Claude;CHASSAT\n' +
  'Laurent;MONIMAUD\n' +
  'Valérie;LAOUE\n' +
  'Fabienne;GIRON\n' +
  'Sandrine;DUOLLE\n' +
  'Elodie;THOMAS\n' +
  'Laetitia;ORALLO\n' +
  'Christelle;CRETAL\n' +
  'Frédérique;LEBOISSELIER\n' +
  'André;FLOCH\n' +
  'David;ROZIER\n' +
  'Marion;TRINQUIER\n' +
  'Flavien;Maes\n' +
  'Collange;Gaelle\n' +
  'Fache;Angelo\n' +
  ';\n' +
  'ORLANDO;FERNANDES\n' +
  'Jean-Christophe;MEUROU\n' +
  'Jérôme;MOULIN\n' +
  'Jean-François;SALOU\n' +
  'Morade;AATACH\n' +
  'Gildas;LHERVE\n' +
  'Cyrille;MILON\n' +
  'Jérémie;BOURG\n' +
  'PATRICE;TUFFERY\n' +
  'Bertrand;JOYAULT\n' +
  'Jérôme;KERBOETHAU\n' +
  'Nolwenn;LE CLOEREC\n' +
  'Manu;LEVEAU\n' +
  'Johan;LERAY\n' +
  'G.;MOAL\n' +
  'Mikael;LE BROZEC\n' +
  'M.;PICHER\n' +
  'Chrystelle;ARNAUD\n' +
  'Benoit;Gauthier\n' +
  'Nathalie;LE COUVIOUR\n' +
  'Yannick;Decruy\n' +
  'Cédric;LE TORTOREC\n' +
  'Christian;LE VERN\n' +
  'Claude;WINCKLER\n' +
  'MARION;GUILLERMINET\n' +
  ';\n' +
  ';\n' +
  'Annie;ROZET\n' +
  ';\n' +
  'M-CHRISTINE;STOMP\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Bruno;FISCHER\n' +
  'Girardey;Frédéric\n' +
  'Frédéric;KAPUSTA\n' +
  'Bernard;MYSKIW\n' +
  ';\n' +
  'Frédéric;DUBOSSE\n' +
  'SEBASTIEN;MONGREDIEN\n' +
  'Christophe;RIBEIRO\n' +
  'Marine;Olliver-Lestre\n' +
  'JJ;ROY\n' +
  'Romain;Le Cerf\n' +
  'Stéphane;KAPUSTA\n' +
  'Ophélie;Bonnesset\n' +
  'Quentin;Cholin\n' +
  'Stéphane;Jegu\n' +
  'Stéphane;Aouidad\n' +
  'Patrick;Godey\n' +
  'Fabrice;Mirjol\n' +
  'Anne-Laurence;VILLEMONTEIL\n' +
  'Olivier;Jetin\n' +
  'Benjamin;Carliez\n' +
  'Eric;Bernard\n' +
  'François;Schumacher\n' +
  'Olivier;Corvaisier\n' +
  'Roger;Lemoine\n' +
  'Jean Pierre;Grundreich\n' +
  'Laurent;HAMARD\n' +
  'Patrick;Sarmeo\n' +
  'Florian;SARMEO\n' +
  'CHRISTOPHE;GUICHARD\n' +
  'CEDRIC;MERCIER\n' +
  'ESTELLE / MARIE CLAIRE;SAUZAY / WOJTCZAK\n' +
  'JESSICA;ANTUNES\n' +
  'Carine;Valmalle\n' +
  'François;Delais\n' +
  'Alain;BOULET\n' +
  'David;BOYER\n' +
  'Franck;DUFOUR\n' +
  'David;Cayer\n' +
  'Eric;Herbrecht\n' +
  'Pierre;Vitre\n' +
  'Franck;Belard\n' +
  'Didier;Gauchard\n' +
  'Jonathan;Lavorel\n' +
  'Stéphane;Baumann\n' +
  'Eric; Debuysscher\n' +
  'Obel;Christophe\n' +
  'Dany;Varlet\n' +
  'David;Houplain\n' +
  'François;Tavernier\n' +
  'Stéphane;Hoskens\n' +
  'Elena;GILG\n' +
  'FRANCK;BRUNET\n' +
  'Stéphane;Kirscher \n' +
  'Capitaine;Michel\n' +
  'Joel;Soucaille\n' +
  'Patrick;Brassart\n' +
  'Frédéric;Gastel \n' +
  'FREDERIC;GIRARDEY\n' +
  'Cédric;Marion\n' +
  'Stéphanie;Cathala\n' +
  'Tadé;DUPARD\n' +
  'Duputel;Mickael\n' +
  'Pascal;Stepec\n' +
  'Magali;Grenet\n' +
  'pascal;Menidrey\n' +
  'cedric;delhaye\n' +
  'Cédric;Jarriaux\n' +
  'Gregoire;Changa\n' +
  'Patrick;Danancier\n' +
  'Anthony;Fachinetti\n' +
  'pascal;renard\n' +
  'Jean-Jacques;Dramard\n' +
  'William;Deruere\n' +
  'XAVIER;ROLLAND \n' +
  'Dominique;Pierre\n' +
  'Arthur;DaSilva\n' +
  'Patrick;Bregeon\n' +
  'Bentouil;Nadia\n' +
  'Estelle;Hartmann\n' +
  'STEPHANE ;WALTZ\n' +
  'Hervé;Hummel\n' +
  'RECEP;GUNGOR\n' +
  'PHILIPPE;DEPALLE\n' +
  'Arnaud;Leveque\n' +
  ';\n' +
  'Thierry;Coutrey\n' +
  'franck;De almeida\n' +
  'Stéphane;JEDREC\n' +
  'SEBASTIEN;SCHIETTECATTE\n' +
  'Ludovic;Carpe\n' +
  'Delphine;Pernot\n' +
  ';\n' +
  ';\n' +
  'Matthieu;BUSCH\n' +
  ';\n' +
  'Raphaelle;Martin-Watson\n' +
  'Nicolas;Saumande\n' +
  'Franck;Godineau\n' +
  'Mathieu;L her\n' +
  'Sandro;Domitile\n' +
  'Vincent;Jacqueline\n' +
  'Alexandre;Lompech\n' +
  'Nicolas;Saverio\n' +
  'Rémi;Nadaud\n' +
  'Jean Luc;Lipjansky\n' +
  'Julien;Getto\n' +
  'Valérie;Trotti\n' +
  'Olivier;Jach\n' +
  'Jordan;Fandino\n' +
  'Paul;Rancan\n' +
  'Thomas;Getto\n' +
  'Laurent;Rebonato\n' +
  'Fabien;Drevon-Balas\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'stéphane;flament\n' +
  ';\n' +
  'Stéphane;Peyreron\n' +
  'Patrick;CALLEBAUT\n' +
  'Frédéric;Di Lorenzo\n' +
  'CATHERINE;DUGARDIN\n' +
  'Hélène;Aubriot\n' +
  'Jean-Paul;Verro\n' +
  ';\n' +
  'Thibault;Marguin\n' +
  ';\n' +
  'Patricia;VANHAECKE\n' +
  'Eric;Perinelle\n' +
  ';LMS\n' +
  ';\n' +
  ';\n' +
  'AUDREY;LEFEVRE\n' +
  'Thomas;Pignot \n' +
  'ERIC;NEAU\n' +
  'ALAIN;PAPAZIAN\n' +
  ';Goumas\n' +
  'Fabien ;Cardona \n' +
  'Jérome;PETIT\n' +
  'Maëlle;Durand\n' +
  'Michel;Taponard\n' +
  'Franck;Michelot\n' +
  'Yannick;Henry\n' +
  'David;Krummenacker\n' +
  ';\n' +
  'Clement;DORMOY\n' +
  'Cassandra;Godot\n' +
  'Elodie;Roth\n' +
  ';\n' +
  ';\n' +
  'Fabien;Moretto\n' +
  'Yannick;Stcherbinine\n' +
  'Benjamin;Antoine\n' +
  'Stéphane;Moretto\n' +
  'Arnaud;Coutin\n' +
  'Vivian;Baudette\n' +
  'Alexandre;Biesiada\n' +
  'Laurent;Dubos\n' +
  'Didier;Gay\n' +
  'Moreau;Damien\n' +
  'Sébastien;Dedours\n' +
  'Bertrand;Steegmuller\n' +
  'Pierre;Leconte\n' +
  'Denis;Millecamps\n' +
  'Olivier;Fievet\n' +
  'Laurent;Dumont\n' +
  'JOSE;DE SOUSA\n' +
  'Jean Christophe;Franquart\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Christophe;Desjardin\n' +
  'Louniss;Bougherara\n' +
  'Florent;Condette\n' +
  'paul; FRANCHI \n' +
  'Jean-Marie;Lalalande\n' +
  'Sophie;Rioult\n' +
  'Valérie;Paillié\n' +
  ';\n' +
  'Laurent;Bayonne\n' +
  'Arnaud;Roger\n' +
  ';\n' +
  'MATTHIEU;WALLENDORFF\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'LAURE;CROZAT\n' +
  ';\n' +
  ';\n' +
  'Hervé;Vanhaecke\n' +
  'LAURENT;FONTENEAU\n' +
  'Alicia;LEGUILLON\n' +
  'FABRICE;LAGNIER\n' +
  ';\n' +
  'DOMINIQUE;AMADIS\n' +
  ';\n' +
  'Freddy;Pereira\n' +
  ';\n' +
  'Eric;BLANCHARD\n' +
  'Virginie;Machin\n' +
  'PASCAL;COURBOT\n' +
  'Gilles;Lattat\n' +
  'philippe;malherbe\n' +
  ';\n' +
  'Philippe;Goengrich\n' +
  ';\n' +
  'Nicolas;TOULORGE\n' +
  ';\n' +
  'Jordane;Deslandes\n' +
  'Christophe;Pinard\n' +
  'Valerie;Guttadore\n' +
  'Tony;Biaggi\n' +
  'Jean-Claude;Campana\n' +
  'Richard;CLABAU\n' +
  'Daniel;BOOS\n' +
  'Jean Christophe;BOUSSAVIE\n' +
  'Jean Luc;AUDONNET\n' +
  'Ludovic;ROY\n' +
  'Karine;MORET\n' +
  'Sylvie;Suty\n' +
  'Anne;Frapsauce\n' +
  'Mickael;Mazeline\n' +
  ';\n' +
  'Chantal;Fuento\n' +
  'Olivier;CARIOU\n' +
  'Lionel;Pastorelli\n' +
  'Hugo;Bourgeix\n' +
  'Frédéric;Beulin\n' +
  'FIGULS;Florian\n' +
  'David;POIRIER\n' +
  'Céline;Tardif\n' +
  'Gilles;Rousseau\n' +
  'Miguel;Castanheira\n' +
  'Michel;Boulanger\n' +
  'Stéphane;Berthelot\n' +
  'Franck;Chapin\n' +
  'Sébastien;Fournier\n' +
  'Jean;Thiery\n' +
  'Patrick;Merra\n' +
  'Christophe;Martinez\n' +
  'Jorge;Rodrigues\n' +
  'Felipe;Felizardo\n' +
  'Jonathan;Rossignol\n' +
  'Gregory ;Leclerc\n' +
  'Romuald;Gourdon\n' +
  'Christophe;Dutrieux\n' +
  'Franck;Neuville\n' +
  'Denis;Duhamel\n' +
  'Audrey;Minatchy\n' +
  'Fernandes;Gilles \n' +
  'Matthieu;Tergny\n' +
  'Arnaud;Procureur\n' +
  'PASCAL;CLAVERIE\n' +
  'Romuald;Deseny\n' +
  'Xavier;Ripoll\n' +
  'PASCAL;FOUCAULT\n' +
  'Stéphane;Georget\n' +
  'Christine;Grossiord\n' +
  'Olivier;Arandel\n' +
  'Mathieu;Parent\n' +
  'Eric;Loppin\n' +
  'José;CARNEIRO\n' +
  'olivier;droulez\n' +
  ';\n' +
  'VALERIE;DE LONGEVIALLE\n' +
  'Patrick;Ouillon\n' +
  'Denis;Guillemois\n' +
  'Pascal;Ecoiffier\n' +
  'Benoit;Eckenschwiller\n' +
  'STEPHANE;LAMPSON\n' +
  ';\n' +
  'Aurelien;Tirtaine\n' +
  'François;BERGES\n' +
  'Lionel;MALTERRE\n' +
  'Gaylord;Soyeux\n' +
  'Herve;Moucot\n' +
  'Grégory;Dutilly\n' +
  'Stéphane;Blondel\n' +
  'Vincent ;Godfrin\n' +
  ';Leleu\n' +
  'Joly;Joly\n' +
  'Franck;Biencourt\n' +
  'Jean Paul;Dubolpaire\n' +
  'Vincent;Robail\n' +
  ';\n' +
  'Geoffrey;QUENNEHEN\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'jordan;Mazingue\n' +
  'alexandre;Audren\n' +
  'Gosse;Emilie\n' +
  ';\n' +
  'THOMAS;DUVERNAY\n' +
  'Christophe;Grange\n' +
  ';\n' +
  'Jean-Louis;GRONFIER\n' +
  'Philippe;Dugardin\n' +
  'Lionel;Ehrhard\n' +
  'Benjamin;Morel\n' +
  'Askim;Kaymak\n' +
  'Emmanuel;Silveiro\n' +
  'Thomas;Fauconnier\n' +
  'José;Moreno\n' +
  'christian;bory\n' +
  'GILLES;VIVARELLI\n' +
  'SANDRINE;CHAZAL\n' +
  'CHRISTIAN;NARCE\n' +
  'Christopher;Cuissard\n' +
  'Johan;Falgayrat\n' +
  'Didier;ROSSIGNOL\n' +
  'Franck;Mazaudier\n' +
  'Jeremy;Chapelle\n' +
  'STEPHAN;VIALLET\n' +
  'Jean-Louis;Romano\n' +
  'Alexandre;Perez\n' +
  'DOMINIQUE;LYOT\n' +
  'Thierry;Lagasse\n' +
  'EDOUARD;MION\n' +
  'Florian;Bize\n' +
  ';\n' +
  ';\n' +
  'guillaume;tixier\n' +
  'Aderito;Da Silva\n' +
  'Jean Philippe;Delgenes\n' +
  'Laurent;Thomas\n' +
  'Jean Christophe;Jalabert\n' +
  'Ludovic;Fucks\n' +
  'Alain;Dalbouze\n' +
  'Gilles;Sarda\n' +
  'CHRISTOPHE;RICHARD\n' +
  'Alexandre;Laird\n' +
  'Jacques;Manas\n' +
  'Sebastien;Cazeneuve\n' +
  'Marc;Gregoire\n' +
  'Eric;Germis\n' +
  'Frederic;Zamith\n' +
  'Hervé;Clerc\n' +
  'Jean Marc;Tassard\n' +
  'Vincent;Garrigues\n' +
  'Yannick;Frelaut\n' +
  'CHRISTOPHE;CARIO\n' +
  'Sebastien;Dalmasso\n' +
  'David;Roué\n' +
  'Client;Service\n' +
  'Sylvie;Touraine\n' +
  'Christophe;Espes\n' +
  'JACQUES;MANAS\n' +
  'Patrick;BAUGE\n' +
  'victor;alves\n' +
  'Laurent;Delorme\n' +
  ';\n' +
  'Fabrice;Roulin\n' +
  'Mickaël;MICHAUT\n' +
  ';\n' +
  'CHRISTOPHE;PAUTRE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Maxence;Lempereur\n' +
  'Guillaume;Thouery\n' +
  'Régis;GENTIL\n' +
  'Yves;GILARDON\n' +
  'FRANK;BALAYN\n' +
  'Stephane;RECOUDES\n' +
  ';\n' +
  'Nicolas;PERIVIER\n' +
  'DA SILVA;Anthony \n' +
  ';\n' +
  'Carl;BOUCHAUD\n' +
  ';\n' +
  'Margaux;Pironneau\n' +
  'Mickaël;Martin\n' +
  'CATHERINE;PARASCANDOLA\n' +
  'Etienne;FOUQUER\n' +
  'Julien;FERET\n' +
  'Emmanuel;SANCHEZ\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'FRANCOIS;SEVESTRE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Guillaume;ARNAULT\n' +
  ';\n' +
  ';\n' +
  'Frederic;Fluzin\n' +
  'BERNARD;WENDLING\n' +
  'Pierre;Legoyet\n' +
  'Manu;Brito\n' +
  'Jerome;Lamy\n' +
  'Gilles;Laval\n' +
  'Pascal;Martin\n' +
  'JEROME;SPOHR\n' +
  'christian;herpin\n' +
  'BERNARD;WEIBLE\n' +
  'Thierry;Ruiz\n' +
  'Eric;Canto\n' +
  'Christian;Barthes\n' +
  ';\n' +
  ';\n' +
  'Carla;DANIELOU\n' +
  ';\n' +
  'DANIEL;COURTES\n' +
  ';\n' +
  ';\n' +
  'LIONEL;DE LAENDER\n' +
  ';\n' +
  'Séverine;Villain\n' +
  'Jacques Hervé;PLANTE\n' +
  'Yves;Barrat\n' +
  'Nicolas;Chaudagne\n' +
  'Olivier;Lebaudy\n' +
  'VIRGINIE;ROBERT\n' +
  'Xavier;Jacquet\n' +
  'Elodie;Rainon\n' +
  'Mathieu;Karsenty\n' +
  'Jean-Luc;GONTARD\n' +
  'Massimo;Trotti\n' +
  'Christian;CELLIER\n' +
  'Johann;Baratte\n' +
  'Véronique;Savin\n' +
  'Thierry;Villa\n' +
  ';\n' +
  'Aurelien;ESTEBE-MARTY\n' +
  'Jean Luc;Sayah\n' +
  'Nicolas;Pierre\n' +
  'Didier;Jaulin\n' +
  'Alexandre;Riddell\n' +
  'Bruno;Croce\n' +
  'Didier;Bernard\n' +
  'Paul;Gayraud\n' +
  'Pauline;Etienne\n' +
  'Sylvain;Gauthier\n' +
  'Guillaume;BARDIN\n' +
  'Gilles;LORMELET\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'MANUEL;DACOSTA\n' +
  'DAMIEN;POUGET BORIE \n' +
  'Gilles;DUCAU\n' +
  'Dominique;Maugret\n' +
  'Cédric ;Gatellier\n' +
  'Fernand;Martin\n' +
  'ANGELIQUE;TAOCHY\n' +
  'CATEZ;CATEZ\n' +
  'Alain;Delesalle\n' +
  'Isabelle;Baillieu\n' +
  'Laurent;Dubois\n' +
  ';\n' +
  'Audrey;Sayah\n' +
  'Guillaume;Peltier\n' +
  'Patrick;Dospital\n' +
  'Christian;Denis\n' +
  'Bruno;Bergerou\n' +
  'Noëlle;Wietrich\n' +
  'Laurent;PAUTIGNY\n' +
  'JULIEN;MANET\n' +
  'Sébastien;Miclet\n' +
  ';\n' +
  'bruno;jacob\n' +
  ';\n' +
  ';\n' +
  'BAPTISTE;MARTIN\n' +
  ';\n' +
  'Michel;Trannois\n' +
  'Valerie;Weber\n' +
  'Pascal;SEZNEC\n' +
  ';\n' +
  'Eric;POUDER\n' +
  'Teddy;Enfert\n' +
  ';\n' +
  'stéphane;brogi\n' +
  'Cédric;VAILLANT\n' +
  'Olivier;TAFFINEAU\n' +
  'Sonia;LIEBAUT\n' +
  ';\n' +
  ';\n' +
  'TONY;VAILLARD\n' +
  'Jean Louis;JONGET\n' +
  'Sophie;PRADELLE\n' +
  'Jeremy;MEO\n' +
  'Vincent;Girerd\n' +
  'Vincent;Chaumard\n' +
  ';\n' +
  'GUILLAUME;VETTER\n' +
  'Charline;BERNARD\n' +
  ';\n' +
  'ERIC;MEYER\n' +
  'Mohamed;Fagrouch\n' +
  'Frantz;Turpin\n' +
  'Antonio;Deazevedo\n' +
  'Angelo;Monarchi\n' +
  'Xavier;Leger \n' +
  'ROBERT;GIORGIONE\n' +
  'Gilles;Sanchez\n' +
  'Nathalie;Laybros\n' +
  'JEREMY;LALANDE\n' +
  'Fabien;Péronne\n' +
  'Loïc;Guéranger\n' +
  'Sévérine;BOUVIER\n' +
  'Fabien;Hinard\n' +
  'CAROLINE;SIQUET\n' +
  'Hubert;Millet\n' +
  'Stéphane;Izoret\n' +
  'Marques;Katia\n' +
  'REGIS;RODRIGUEZ\n' +
  'Ariane;DEPARDON\n' +
  'David;LE GOFF\n' +
  'Violaine;QUEVAREC\n' +
  'Philippe;CALVARIN\n' +
  ';MARTINS\n' +
  ';BOUCHER\n' +
  ';DAUGET\n' +
  ';LEFEBVRE\n' +
  'Thierry;ROLLAND\n' +
  'Dominique;BOEFFARD\n' +
  'Caroline;BOURGUIGNON\n' +
  ';CLOAREC\n' +
  'Fernand;Dosreis\n' +
  ';Bocquel\n' +
  'Valery;Boldireff\n' +
  'David;LE GUEN\n' +
  'Damien;DAVID\n' +
  'Lydia;RAMONET\n' +
  'Eloise;ARHAN\n' +
  'Nathalie;HIRRIEN\n' +
  'Stéphane;KERJEAN\n' +
  'Damien;BRELIVET\n' +
  'Fabienne;RIOU\n' +
  'FLORENCE;CHEMERY\n' +
  'Richard;Poisson\n' +
  'Johanna;Denise\n' +
  'Willy;Biet\n' +
  'Florence;Breart\n' +
  'Emilie;Mantion Philippe\n' +
  'Corentin;Dumont Girard\n' +
  'AURELIE;PARASCANDOLA\n' +
  ';\n' +
  'Thibault;Dewilde\n' +
  'Matthieu;Faury\n' +
  'Bertrand ;Gonod\n' +
  'Jérôme;LEBRETON\n' +
  ';\n' +
  'Christelle;Carpentier\n' +
  'Carmelo;Randazzo\n' +
  'Manon;Marchand\n' +
  'Patrick;Colin\n' +
  'Philippe;Swaenepoel\n' +
  'Arnaud;Cornaglia\n' +
  'Thierry;Ponsart\n' +
  'Véronique;Godart\n' +
  ';Fouquet\n' +
  ';Marurier\n' +
  'Marcel;Grenier\n' +
  ';Mahe\n' +
  'Arthur;Valadié\n' +
  'frederic;Duplouy\n' +
  'Jérôme;Salgueiro\n' +
  'Alexandre;DaSilva\n' +
  'Nathalie;Lagasse\n' +
  'Gilles;Lormelet\n' +
  ';\n' +
  'Antoine;PINHEIRO\n' +
  'Johann;Germain\n' +
  'Christophe;Bourdenet\n' +
  'Matthieu;Ladan\n' +
  ';\n' +
  ';\n' +
  'Poupeau;Francis\n' +
  ';\n' +
  'Roberto;Dos Santos\n' +
  'Rémy;Briand\n' +
  'Romain;Gilet\n' +
  'Xavier;Pasteau\n' +
  'MICHEL;CRUZ REIS\n' +
  'Jean-Paul;LACREUSE\n' +
  'Fabrice;Zanivan\n' +
  'Ludovic;DESNOES\n' +
  'Jean-Philippe;ROSSO\n' +
  'Xavier;Guiguet\n' +
  'Bastien;Boson\n' +
  'Olivier;Favre\n' +
  'Nicolas;Falkowski\n' +
  'Angélique;Chambolle \n' +
  'Patrice;LE GALLE\n' +
  'Jean-Claude;Bernard\n' +
  'Jean-Pierre;Caudebec\n' +
  ';\n' +
  'Philippe;Wietrich\n' +
  'Sophia;Adda\n' +
  'LAURE;BOUCHE\n' +
  'KAREN;LAFOURCADE\n' +
  'Didier;Sirejol\n' +
  'Salomé;Sirejol\n' +
  'Yannick;MAZURIER\n' +
  'Yohann;Gonzalez\n' +
  'Eden;Walas\n' +
  'PASCAL;BOILLOT\n' +
  'Eric;Petit\n' +
  'Jean Luc;Izac\n' +
  'Thierry;Romeo\n' +
  'Guillaume;Maury\n' +
  'Anes;HISNI\n' +
  'Julia;Villar\n' +
  'Kevin;Betty\n' +
  'Alain;Anou\n' +
  'Charlotte;LANGLOIS-BERTHELOT\n' +
  'Olivier;THEVENIN\n' +
  'Eric;Maffioli\n' +
  'THIERRY;CHARLOT\n' +
  ';\n' +
  'YANNICK;GEORGET\n' +
  ';\n' +
  'Ludovic;Paris\n' +
  'SOPHIE;LOPEZ\n' +
  'Jérôme;Bourget\n' +
  'Adeline;Tran\n' +
  'Nadia;Ez-Zemman\n' +
  'Mickael;Souverain\n' +
  'Jean-Michel;DAUPHIN\n' +
  'Nadège;Nogrette\n' +
  ';\n' +
  'Antonio;Neto\n' +
  'Michel;Lainé\n' +
  'Josselin;DOMAINGUE\n' +
  'PHILIPPE;SIMONNEAU\n' +
  'YVAN;REZARD\n' +
  'Baptiste;Bellé\n' +
  'Laura;PERES\n' +
  'Yves;Jacquet\n' +
  'Philippe;Padellec\n' +
  'Romain;Walter\n' +
  'Vincent;Deffeuille\n' +
  'Jean-François;Ratte\n' +
  'Olivier;Amet\n' +
  'Richard;Lanthemann\n' +
  'Serge;Guillemin\n' +
  'Mikael;DAIRAIN\n' +
  'Thierry;Richard\n' +
  'Jérémy;CREACH\n' +
  'Bruno;Coulon\n' +
  'Hugues;Mamessier\n' +
  'Xavier;Nottin\n' +
  'Laura;Casillas\n' +
  'Sylvain;Jacquot\n' +
  'Luc;Pichon\n' +
  ';\n' +
  'Pierre-Marie;Meulien\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Christophe;Celsi\n' +
  'Cécile;Olivier\n' +
  'ARMELLE;BREBANT\n' +
  'Stéphane;Brun\n' +
  'Serge;NOMBLOT\n' +
  'Charlotte;Falay\n' +
  'David;Lefevere\n' +
  'Anaïs;Joubaud\n' +
  'Christophe;Maurel\n' +
  'Frederic;Maurel\n' +
  'Philippe;Maurel\n' +
  'Armelle;Salas\n' +
  'Lacaze;Bernard\n' +
  'Maurice;Bille\n' +
  'Cyril;Montagne\n' +
  'Jérémie;Sarrus\n' +
  'PIERRE;GRAS\n' +
  'PASCAL;NOEL\n' +
  'Jonathan;Bastos\n' +
  'Sébastien;DALLEAU\n' +
  'Frédéric;GALERA\n' +
  'Dominique;LELONG\n' +
  'Jean-Marie;DAGORNE\n' +
  'Olivier;Sola\n' +
  'PUIG;Laurent\n' +
  ';\n' +
  'Michel;GUY\n' +
  'Ventura;DE SOUSA\n' +
  'François;Saïsset\n' +
  'Antoine;DA COSTA\n' +
  'Gilles;BIBIAN\n' +
  'Rémy;FRAYSSINHES\n' +
  'Alain;Rigal\n' +
  'William;Wander\n' +
  'Catherine;Pinet\n' +
  'Marc;Coulon\n' +
  'Julien;Layral\n' +
  'Laurent;Camenzuli\n' +
  'Jérôme;OFFRET\n' +
  'Franck;Faucherre\n' +
  'Margaux;Maltaverne\n' +
  'sandra;fernandes\n' +
  'Emeline;GAUTHIER\n' +
  'DAVID;PHILIPPE\n' +
  'Nelly;Thongsavath\n' +
  'Marc;Lemoine\n' +
  'Florence;BILLY\n' +
  'Laetitia;trehoux\n' +
  'Rabah;Harrat\n' +
  'Stéphane;Touret\n' +
  'Sébastien;Bardoel\n' +
  'Anne Laure;PIQUEREZ\n' +
  'Marie Christine;DUPRAT\n' +
  'Christelle;FOUGERAT\n' +
  'Stéphanie;BADEY\n' +
  'Maxime;Gustin\n' +
  'Gaëtan;Tiago\n' +
  'Denis;Degand\n' +
  'Philippe;Verro\n' +
  'Samia;Ouchen\n' +
  'Guillaume;Buissette\n' +
  'Alexis;Da Silva\n' +
  'Arnaud;Bruyere\n' +
  'Benoît Xavier;Dhonte\n' +
  'Carole;Darné\n' +
  'Philippe;GUIRAUD\n' +
  'Olivier;Vaast\n' +
  'Sébastien;Rozette\n' +
  'Bertrand;CHEDIN\n' +
  'Nicolas;GALLOU\n' +
  'Christophe;HECHEVIN\n' +
  'Valérie;MENEUR\n' +
  'Justine;CAVAREC\n' +
  'Lauriane;PERROT\n' +
  'Stéphane;GAYE\n' +
  'Bernard;CONQ\n' +
  'Benoît;JACQUET\n' +
  'Clarisse;BOUQUET\n' +
  'Dominique;TYDOU\n' +
  'Anthony;LHARIDON\n' +
  'Erwan;DEMOMENT\n' +
  'François;LE BERRE\n' +
  'Michel;LEVANT\n' +
  'Laurent;BRICARD\n' +
  'Caroline;JARDEL\n' +
  'Antoine;LECOEUR\n' +
  'Laurent;HARDOUIN\n' +
  'Nicolas;RIOU\n' +
  'Margaux;DELACROIX\n' +
  'NICOLAS;FOURRAGE\n' +
  'Anne-Sophie;Detout\n' +
  'Sonia;PEREIRA\n' +
  'Aurelie;TANG\n' +
  'STEFANO;SADURNY\n' +
  ';\n' +
  'Pascal;CABON\n' +
  'Franck;GIGAUD\n' +
  'Maud;TOUGERON\n' +
  'Céline;Téatini\n' +
  'Aline;Téatini\n' +
  'Lola;Hérolt\n' +
  'Jean-Pierre;TENEDOR\n' +
  'Murielle;Tailleur\n' +
  'A;Wunsch\n' +
  'Stéphane;Meurice\n' +
  'Amanda;Blanco \n' +
  ';\n' +
  'Arthur;Correia\n' +
  'François;Binjamin\n' +
  'Antonio;David\n' +
  'Ulrich;David\n' +
  'Christian;Le Guern\n' +
  'Aude;Barria\n' +
  'Christophe;Raynaud\n' +
  'Alexandre;Dallet\n' +
  'Franck;Rondineau\n' +
  'Pascal;Boureau\n' +
  'Cyrille;Rio\n' +
  'Romain;Guyard\n' +
  'Franck;Schmotterer\n' +
  'Franck;Fouassier\n' +
  'Mathieu;Bonvin\n' +
  'Jean-Philippe;Toupin\n' +
  'Olivier;Colombe\n' +
  'Christophe;Henrard\n' +
  'Béatrice;VASQUEZ\n' +
  'Bénédicte;LAYRAC\n' +
  'Jackie;ROSSI\n' +
  'Philippe;Accabat\n' +
  'Elisabeth;Court\n' +
  'Alain;BODIN\n' +
  ';\n' +
  'Sandrine;BACONNAIS\n' +
  'Paul;CERCLIER\n' +
  'Pascal;HOUEL\n' +
  ';KULIEZ\n' +
  'Julien;VATTIER\n' +
  ';\n' +
  'JEROME;LENA\n' +
  ';\n' +
  'Laurent;JOUEN CLERGE\n' +
  ';\n' +
  'thierry;salomon\n' +
  'Mireille;GILLETTE\n' +
  'Philippe;MARAIS\n' +
  ';\n' +
  'MICKAEL;LE COQ\n' +
  'LOIC;DUPERRAY\n' +
  ';\n' +
  'marc;tardif\n' +
  'MARIE LAURE;BELLAMY\n' +
  'Fabiola;Procida\n' +
  'FRANCK;FONTAINE\n' +
  'PAULO;SALGADO\n' +
  'Stéphane;Pinson\n' +
  'Jeremy;Gracyasz\n' +
  'Cédric;CALMEJANE\n' +
  'Julien;Miralles\n' +
  'Jean-Marie;DESPEYROUX\n' +
  'Isabelle;CHILLOUX\n' +
  'Franck;MARCIA\n' +
  'Philippe;Pinna\n' +
  'LUDIVINE;ROUX\n' +
  'YOHAN;LAPEYRE\n' +
  'Anne-Laure;RODIER\n' +
  'Sylvain;Rougerie\n' +
  'Teddy;Lesenechal\n' +
  'Luc;Pemzec\n' +
  'OLIVIA;MIOT\n' +
  'Thérèse-Anne;Pemzec\n' +
  'Véronique;Jaumain\n' +
  ';\n' +
  ';\n' +
  'Hubert;Guyot\n' +
  ';\n' +
  ';\n' +
  'Yoan;Fourny\n' +
  ';\n' +
  ';\n' +
  'Ronan;Kerouel\n' +
  ';\n' +
  ';\n' +
  'Jeremy;PAYEN\n' +
  ';\n' +
  'Maël;Rannou\n' +
  'Maxime;PETIT\n' +
  'RAPHAEL;MICHELET\n' +
  'Lionel;PUECH\n' +
  'MAXIME;GHIELMINI\n' +
  'Mathieu;PFEFFER\n' +
  'Julien;CHAPELAIN\n' +
  'Stéphane;CAROFF\n' +
  'Emmanuel;ZAIA\n' +
  'Eric;BUSSIERE\n' +
  'Adrien;Barthélémy\n' +
  'Nicolas;SANTAMARIA\n' +
  ';Ernou\n' +
  'ANNIE;GUITTET\n' +
  'Yves;BIGOT\n' +
  ';\n' +
  'Fabrice;MASCIAVE\n' +
  'Jessy;Foutieau\n' +
  'Claude;Arigoni\n' +
  'Damien;Legalles\n' +
  'Alain;Lancien\n' +
  'Benoit;Wettling\n' +
  'Johann;LE GOSLES\n' +
  ';\n' +
  'Sebastien;Cassagnau\n' +
  'Regine;Barc\n' +
  'Mathieu;Rotiel\n' +
  'Jérome;Daumont\n' +
  'ISABELLE;KERBAUL\n' +
  'ARNAUD;DEMARIA\n' +
  'Candice;Digoin\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Bruno;Moriau\n' +
  'alexis;Pillet\n' +
  'STEPHANIE;TOURNOIS\n' +
  'MYRIAM;PASTOR\n' +
  'DEBORAH;DIFABRIZIO\n' +
  'Jean-Pierre;Widehem\n' +
  'Christiane;Lopes\n' +
  'Jean-Marc;Gautier\n' +
  'JULIE ;LE DOUGUET\n' +
  'Ludovic;GARRIC\n' +
  'Fabrice;Pons\n' +
  'Benoit;Gicquel\n' +
  'Christophe;Morales\n' +
  'Delesalle;Benoit\n' +
  ';\n' +
  'Sandrine;Bujotzek\n' +
  'Vincent;Delcros\n' +
  'Pascal;Delcros\n' +
  'Tom;Mahiet-Ribeyrol\n' +
  'Ludovic;CAUSARD\n' +
  'CHARLY;GUILLAUME\n' +
  'SANDRINE;ORRIERE\n' +
  'Laëtitia;Godemer\n' +
  'Cécile;DESLANDES\n' +
  'EDOUARD;CHAPON\n' +
  'hubert;quentin\n' +
  'Francis;Diniz\n' +
  'Marc;GODELU\n' +
  'NICOLAS;HOULLARD\n' +
  'FABIENNE;GODEAU\n' +
  'SYLVAIN;LANDEMAINE\n' +
  'alexandre;claude\n' +
  'JEROME;DATIN\n' +
  'Franck;Rahmani\n' +
  'Sylvain;BEREL\n' +
  'Alain;Benoist\n' +
  'Michel-Pierre;BESSAUDOU\n' +
  'Valentin;Frénéhard\n' +
  'Arnaud;GIRARDIN\n' +
  'Fabrice;GASPARATO\n' +
  'Olivier;AMBOLET\n' +
  'Thomas;Bougrelle\n' +
  'EDUARDO;CATURRA\n' +
  'Fabrice;ROUX\n' +
  'Geoffrey;NOWAK\n' +
  'Ludovic;De Fombelle\n' +
  ';\n' +
  'jean michel;DA COSTA\n' +
  'Dominique;Clere\n' +
  'JENNIFER;CHEVAILLIER\n' +
  'Christophe;Chiquet\n' +
  'João;Murça\n' +
  'DAVID;LEMAY\n' +
  'AURELIEN;THOMAS\n' +
  'Jean-Michel;VACHÉ\n' +
  'eric;vandenbussche\n' +
  'Valérie;Couderc\n' +
  'Da Fonseca;Melody\n' +
  'Cathy;Havard\n' +
  'Gérald;Masson\n' +
  'Sylvain;Evrard\n' +
  'Mohamed Fehmi;BEN KADDOUR\n' +
  'Cyprien;Gérard\n' +
  'Stéphane;Sandor\n' +
  'Nidia;Vieira\n' +
  'Georges;Goncalves\n' +
  'SAMUEL;ROUSSEAU\n' +
  'Samuel;BLANCHET\n' +
  'jerome;hocde\n' +
  'christophe;SEIGNEUR\n' +
  'Alain;Maillet\n' +
  'BERTRAND;MORINEAU\n' +
  'Philippe;Allegre\n' +
  ';\n' +
  ';\n' +
  'Bruno;Lafarge\n' +
  'Alice;Gaboriau\n' +
  'jordan;barbotteau\n' +
  ';\n' +
  'alain;piquier\n' +
  'frederic;courvoisier\n' +
  'aurélien;Belliard\n' +
  'Jérémy;Bille-bourbon\n' +
  'Thierry;Perrin\n' +
  ';\n' +
  'amandine;maupoint\n' +
  'EMMANUEL;MEXIQUE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'jeremy;verneau\n' +
  'FREDERIC;COCHET\n' +
  ';\n' +
  'Claude;DAVID\n' +
  ';\n' +
  'Philippe;BIDAULT\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Stéphane;Monnet\n' +
  ';\n' +
  ';Alario\n' +
  'Gérald;DELMAS\n' +
  'Christophe;Pynthe\n' +
  'CHRISTOPHE;JAILLANT\n' +
  'PATRICK;GILBERT\n' +
  'REGINE;REGNIER\n' +
  'Guy;De Lépervanche\n' +
  'Gaëlle;Claris\n' +
  'Axel;PECH\n' +
  ';\n' +
  'Joël;Lefrançois\n' +
  'Jean-Michel;Etchetto\n' +
  'CELINE;MANSOURI\n' +
  'Laurent;Walker\n' +
  'Anne-Charlotte;Merlin\n' +
  'Adnan;Jeddi\n' +
  'wilfried;chochois\n' +
  'Thomas;Dormoy\n' +
  'Vincent;Orban\n' +
  'Sébastien;Simioni\n' +
  'Eric;Bigel\n' +
  'Anne-Marie ;Feraudo\n' +
  'Nicolas;Juin\n' +
  'Jerome;Fretard\n' +
  '.;Mazzoleni\n' +
  'Gilles;Moreau\n' +
  'MARIANNE;ROUSSET\n' +
  'Benoit;Laurent\n' +
  'Eric ;Christophe \n' +
  'Sabrina;DALLEM\n' +
  'SOPHIE;MURE\n' +
  'Alexis;DUFETEL\n' +
  'Alexandra;Mancini\n' +
  'cyril;georges\n' +
  'SANDRINE;SANTINI\n' +
  'Franck;BURNEL\n' +
  'Pierrick;Martin\n' +
  'Jean-Marc;Mallet\n' +
  'Christophe;Nobis\n' +
  'Franck;Bournot\n' +
  'Fabien;Agresti\n' +
  ';\n' +
  'Corentin;KAZMIERCZAK\n' +
  'H;Beka\n' +
  'B;Chirari\n' +
  'Julie;Sanchez\n' +
  'Jeremy;Sanchez\n' +
  'Fabrice;Reymond\n' +
  'Isabelle;Goncalves Doualle\n' +
  'Noel;Migliore\n' +
  'eric;sportouch\n' +
  'gregory;franze\n' +
  'GERMAIN;EDOUARD\n' +
  'Daniel;Rodrigues\n' +
  'Christian;Dussart\n' +
  'Brice;Borodine\n' +
  'Linda;Soudani\n' +
  'Lucien;Thalineau\n' +
  'Gérard;HAMON\n' +
  ';\n' +
  'Thierry;GUYOMARD\n' +
  'Gaetan;Sprenger\n' +
  'Nicolas;Tollu\n' +
  'Fabien;Olivieira\n' +
  'Stéphanie;Soyer\n' +
  'Cyrille;BOULLAY\n' +
  'Peter;LOPES\n' +
  'Frédéric;LANDELLE\n' +
  'Pierre-Emmanuel ;POCHON\n' +
  'Olivier;BORTOLINI\n' +
  ';\n' +
  ';\n' +
  'Pascal;Bonache\n' +
  'Steven;LE SAUX\n' +
  'Loïc;BOCO\n' +
  'Camille;BOUTET\n' +
  'Yann;LE MOIGNO\n' +
  'Emmanuel;Sery\n' +
  'Alphonse;JOURDAIN\n' +
  'Vincent;Rechatin\n' +
  'Vincent;Biguey\n' +
  'Damien;Vinette\n' +
  'Jeremy;Flitti\n' +
  'Jerome;Beyries\n' +
  'Yoan;MERCIER\n' +
  'Romain;BEYDON\n' +
  'STEPHANE;SCHILLING\n' +
  'RUI;DA SILVA\n' +
  'LUIS;FERNANDES\n' +
  'THOMAS;ZELUS\n' +
  'Franck;Delelis\n' +
  'Christophe;Rullière\n' +
  'Frédéric;THIRY\n' +
  'Anthony;Touffet\n' +
  'Anais;Fraboulet\n' +
  'VINCENT;DAMM\n' +
  'francoise;sezille\n' +
  'VINCIANE;DROUZAI\n' +
  'Alessandra;Caprioli\n' +
  'Nicolas;Thedie\n' +
  'Carlos;Delgado\n' +
  'Thomas;ANTIL\n' +
  'Sebastien;VILLEMAGNE\n' +
  'ISABELLE;NICOLAY\n' +
  ';\n' +
  'pascal;grenet\n' +
  'P;Farcy\n' +
  'SEBASTIEN;DAL BUENO\n' +
  'STEPHANIE;MONNIER\n' +
  'Fabienne;Aubey\n' +
  'Eric;Panzani\n' +
  'Rajet;Chahed\n' +
  'Emmanuel;BUSA\n' +
  'OLIVIER;MAGNANI\n' +
  'JEAN-CLAUDE;BARUTEU\n' +
  'Arnaud;SCHMITGEN\n' +
  'Christophe;Malbet\n' +
  'Vincent ;Vilaceque\n' +
  'Santiago;Duarte\n' +
  'Mathieu;Tanguy\n' +
  'Patrice;Legendre\n' +
  'Lorenzo;Giannini\n' +
  'MELISA;PONZINI\n' +
  'Laurent;Payrat\n' +
  'MAGALIE;POULICART\n' +
  'GILLES;ROTA\n' +
  'Gilbert;CHARMAT\n' +
  ';\n' +
  'Adrien;Feucht\n' +
  'Philippe;Jean\n' +
  'Marc;Blanchard\n' +
  'Serge ;RONCHI \n' +
  'Olivier;MARTINOT\n' +
  'Thomas;Houizot\n' +
  'Benoît;Leclerc\n' +
  'ANTHONY;CROCQ\n' +
  'Fabian;Salaun\n' +
  'JEAN LOUP;COURJARET\n' +
  'anthony;lorans\n' +
  'herve;dreau\n' +
  'Jean-Louis;Davagnier\n' +
  'Laurent;Leca\n' +
  'Benjamin;Feles\n' +
  'Ludovic;Roux\n' +
  'Stéphane;Drouillard\n' +
  'Laurent;Collado\n' +
  'Josselin;Paire\n' +
  'Nicolas;REMY\n' +
  'Nicolas;Bermant\n' +
  'Ghislain;Reynaud\n' +
  'Vincent;Fatela\n' +
  'Romain;Rychter\n' +
  'Thomas;Asquoet\n' +
  'Gabriel;Gaspar\n' +
  'Boris;Abinal\n' +
  'Laurent;Tramcourt\n' +
  'Florian;Carnel\n' +
  'Gregory;Babic\n' +
  'Charles;Guirovich\n' +
  'Arnaud;Van Tiel\n' +
  'Jose;Magalhaes\n' +
  'Nadine;Wittenhove\n' +
  'John;ROMAO\n' +
  'Guillaume;MONOT\n' +
  'Delphine;Gay\n' +
  'Philippe;Bohnec\n' +
  'ANTONIO;DA COSTA\n' +
  ';\n' +
  'MELANIE;ROHOU\n' +
  'Virginie;PROCHASSON\n' +
  'Nathalie;SOBRAL\n' +
  'Jean Claude;PROCHASSON\n' +
  'Karine;MELEIRO\n' +
  'Alain;CHARLES\n' +
  'France;Cestari\n' +
  'Philippe;PINEAU\n' +
  'GREGORY;LAPOIRE\n' +
  'MARIE HELENE;CADE\n' +
  ';\n' +
  'Catherine;CHATALEN\n' +
  'Philippe;LE DEROUT\n' +
  'Hugo;Baconnier\n' +
  'Stéphane;Barbier\n' +
  'Thierry;Dumont\n' +
  'Stéphane;Verdier\n' +
  'Jean-Christophe;Welsch\n' +
  'FRANCK;RIO\n' +
  'FREDERIC;LE BOLAY\n' +
  'VERONIQUE;LOISEAU\n' +
  'julien;laval\n' +
  'Stéphane;BROUARD\n' +
  'AURELIEN;MAYER\n' +
  'manuel;guimaraes\n' +
  'MICKAEL;HUGUIN\n' +
  'Ahmet;SEMERCI\n' +
  'Eric;Nézot\n' +
  'CEDRIC;MICHEL\n' +
  'FRANK;LLOYD\n' +
  ';\n' +
  'Beaussier;Eric\n' +
  'FREDERIC;DUHAMEL\n' +
  'XAVIER;SOLDATI\n' +
  'AMOUR;SOURISSEAU\n' +
  'FLORIAN;MORACCHINI\n' +
  'Olivier;CRANCE\n' +
  'Thomas;Lamirault\n' +
  'GILLES;LE GAL\n' +
  'reïla;plart\n' +
  'Laurent;Teilleux\n' +
  'Arnaud;Finette\n' +
  'Emmanuelle;Guérineau\n' +
  'Lindsey;WARNECK\n' +
  'Jean Michel;Cerdan\n' +
  'Arnaud;LELOUP\n' +
  'Fabien;GAVORY\n' +
  'JULIEN;CHOLLET\n' +
  'Karine;TRENTI\n' +
  'SEBASTIEN;PILAT\n' +
  'Thierry;ROUZEAU\n' +
  ';\n' +
  ';\n' +
  'STEPHANE;GUILLAUMAIN\n' +
  'Jean-Sébastien;Granger\n' +
  'Thierry;Ducreux\n' +
  'Christophe;Chenouard\n' +
  'Romain;Galland\n' +
  'Michel;Deschamps\n' +
  'Delphine;Mohimont\n' +
  'François;Sanchez\n' +
  'Julien;Maudhuy\n' +
  'ERIC;ESCUBEDO\n' +
  'Plessis;Jérome\n' +
  'Jallu-Berthier;Pierre\n' +
  ';\n' +
  'Damien;Charretier\n' +
  'VINCENT;CAUDAL\n' +
  'JOSE;DOLIGET\n' +
  'MARYLINE;CLERAMBAULT\n' +
  'OLIVIER;MARNAS\n' +
  'Isabelle;ROMERO\n' +
  'frederic;costa\n' +
  'CATHERINE;MARCONNAUX\n' +
  'Melanie;Lecroart\n' +
  'Delabasserue;Alexandre\n' +
  'Swan;Betrancourt\n' +
  'christophe;demey\n' +
  'MIKAEL;MULLIER\n' +
  'thomas;detournay\n' +
  'ARNAUD;DUMUR\n' +
  'GREGORY;DEGROOTE\n' +
  'Ludovic;Devynck\n' +
  'LIONEL;GREVIN\n' +
  'Vincent;EMMERY\n' +
  'THIERRY;MILLE\n' +
  ';\n' +
  'LUDOVIC;LAVOS-COELHO\n' +
  'David;DOLCE\n' +
  'JULIEN;IBARS\n' +
  'Marie;Coffinet\n' +
  'Sylvain;Cointat\n' +
  'Eric;Baconnier\n' +
  'DANY;MARQUETTE\n' +
  'François Xavier;MARIAGE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Saltzmann;Sébastien\n' +
  'Frederic;Descryve\n' +
  'philippe;janel\n' +
  'frederic;deneuville\n' +
  'Remy;Ruyant\n' +
  'Olivier;BLONDEL\n' +
  ';\n' +
  'Phillipe;Dupont\n' +
  'Najype;Sai\n' +
  'Gregory;Niepceron\n' +
  'Hamid;Haouchine\n' +
  'RENAUD;MEUNIER\n' +
  ';\n' +
  'Stéphane;Gaillot\n' +
  'JONATHAN;SAUDUBRAY\n' +
  'Guenaelle;Guinand\n' +
  'Christophe;Lefort\n' +
  'STEVE;FONTAINE\n' +
  'frederic;heras\n' +
  'stéphanie;THOUZET\n' +
  'Matthieu;RICHARD\n' +
  'VANESSA;SADIN\n' +
  'MARTINE;RAIMBAULT\n' +
  'Yveline;LE MOAL\n' +
  ';\n' +
  'VIRGINIE;ROBERT\n' +
  'Alain;BAFFICO\n' +
  'PIERRE YVES;BELDA \n' +
  'Julien;MATHIEU\n' +
  'THIERRY;CARRIGNON\n' +
  'didier;angelmann\n' +
  'Maëva ;LAROUSSE\n' +
  'Lesage;Christele\n' +
  'Sylvain;Ode\n' +
  'Sophie;GUSMAROLI\n' +
  ';\n' +
  'Eric;HERVO\n' +
  'Séverine;MONFRAIX\n' +
  'GUILLAUME;BEYLOT\n' +
  ';Corruble\n' +
  'Samy;Ben Chekroun\n' +
  'Christophe;Rouyer\n' +
  'Nelly;Gandrillon\n' +
  'Aurelien;Sido\n' +
  'Jose;Parra\n' +
  'Emmanuel;Deniau\n' +
  'LIONEL;PESSEAS\n' +
  'Melanie;Brahmi\n' +
  'Jean Claude;Forgeron\n' +
  ';\n' +
  'PATRICK;BEBIANO\n' +
  'CYRIL;BOUCHET\n' +
  ';\n' +
  'Mickaël;GEOFFROY\n' +
  ';\n' +
  'FREDERIC;BREN\n' +
  'Camille;Guyot\n' +
  'Camille;Paparone\n' +
  'CHARLOTTE;VEILLE\n' +
  'Gunther;Doll\n' +
  'AUDE;BOURDET QUEGUINER\n' +
  ';\n' +
  'GWENAEL;LAURET\n' +
  ';\n' +
  'philippe;vimont\n' +
  ';\n' +
  'AGNES;VIDAU\n' +
  'Pascal;MENETRIER\n' +
  ';\n' +
  'Pascal;Bigot\n' +
  'ROMAIN;IOCHEM\n' +
  'Jean Hugues;Degenne\n' +
  'Mylène;GOUGELIN\n' +
  ';\n' +
  'sylvain;chagnon\n' +
  'Armelle;Petit\n' +
  'Nathanaël;BIRRA\n' +
  'Marc Antoine;LEBOURG\n' +
  'Cécile;PEDRONO\n' +
  ';\n' +
  'celso;da costa\n' +
  'Yves;Paitel\n' +
  ';\n' +
  ';\n' +
  'ROMAIN;VALEIX\n' +
  'LAURENCE;BRODIN\n' +
  'YVANN;CAUVIN\n' +
  'Patrice;Duval\n' +
  'NICOLAS;EREAC \n' +
  'Elodie;BEUREL\n' +
  'PHILIPPE;GUYOMARD\n' +
  ';\n' +
  'NICOLE;RICHARD\n' +
  'Marie Claire;Biedermann\n' +
  'Louise;Cannesson\n' +
  'STEPHAN;CHLEBOWSKI\n' +
  'Pierre;SIMONNEAU\n' +
  'JULIEN;AMIOT\n' +
  'Didier;Berrezai\n' +
  'YOANN;NOMMAY\n' +
  'Jacques;BRONGNIART\n' +
  'Jean-Louis;MACE\n' +
  'Vincent;DJAFFARDJEE\n' +
  'Camille;PRONOST\n' +
  'Serge;BOBLIN\n' +
  'Clarisse;Duquenois\n' +
  'Florent;BOURASSEAU\n' +
  'Christelle;BRUHAT\n' +
  ';\n' +
  'SYLVIE;CHABRELY\n' +
  'SEBASTIEN;GUIGNON\n' +
  ';\n' +
  'THIERRY;BRAGADO\n' +
  'PRISCILLIA;LEGAY\n' +
  'ketty;lequesne\n' +
  ';\n' +
  'emmanuel;dusseaux\n' +
  'RUTIGLIANO;Léa\n' +
  'Christophe;Convain\n' +
  'Vignon;Jérome \n' +
  'Stephane;Gallina\n' +
  'HERVE;DI BARTOLOMEO\n' +
  'Joachim;Camara\n' +
  'Michael ;Montaner\n' +
  ';\n' +
  'Pierre;LELARGE\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'SYLVAIN;GAUTIER\n' +
  'ERIC;SOULARD\n' +
  'Audrey;Landreau\n' +
  'samuel;guignard\n' +
  ';\n' +
  'Marc;MARIE\n' +
  ';\n' +
  'Stéphane;CARON\n' +
  'MELODIE;LEFEBVRE\n' +
  ';\n' +
  ';\n' +
  'JULIEN;ROLANDO\n' +
  ';\n' +
  'OLIVIER;HOCHET\n' +
  'Ludovic;CASSAGNE\n' +
  'Nathalie;BRIAND\n' +
  'Philippe;CENA\n' +
  'bernard;jullié\n' +
  'Pierre;Carlessi\n' +
  'guillaume;lafon\n' +
  'vincent;marani\n' +
  'Nicolas;Debaix\n' +
  'Frédéric;COSSON\n' +
  'Marine;Morin\n' +
  'Xavier;DUMAS\n' +
  'James;Lafon\n' +
  'THIERRY;SAINT JORE\n' +
  'Vincent;LEFEVRE\n' +
  'Morgan;BOUCHET\n' +
  'Mohamed;BENAMMAR\n' +
  'Nicolas;Rateau\n' +
  'Olivier;BRANDELON\n' +
  'Sébastien;BRILLAUD\n' +
  'Maéva;GERIMONT\n' +
  'Marion;GERARD\n' +
  'Christine;ANTOINE\n' +
  'Cedric;Conduche\n' +
  'Pascal;FOLL\n' +
  'Jacques;LAVIGNE\n' +
  'Jérémy;PAYAN\n' +
  ';\n' +
  'Philippe;Collombon\n' +
  'Richard;Berron\n' +
  'Romain;Pedinielli\n' +
  'Maxime;Levotre\n' +
  'lorène;Papazian\n' +
  'Jean-Dominique;Roger\n' +
  'Arnaud;Roger\n' +
  'André;Sztukowski\n' +
  'Sébastien;Provida\n' +
  'Coralie;Courbois\n' +
  'MAX;GIRAUD\n' +
  'Anne-Cécile;REHEL\n' +
  'Lionel ;GILLE\n' +
  'DAVID;LARTIGUE\n' +
  ';\n' +
  'TIFFANY;CHEVREL\n' +
  ';\n' +
  'Cyril;Chauveau\n' +
  ';\n' +
  ';\n' +
  'LAURENT;QUEDREUX\n' +
  'Marc;PENVERNE\n' +
  'JEROME;MAIORANO\n' +
  'Samuel;Rodrigues\n' +
  'Cédric;Conduché\n' +
  'kelly;Cozzolino\n' +
  'Alexis;BAYARD\n' +
  'JEROME;MAUDET\n' +
  'Laurent;BERTEAUX\n' +
  'Julien;BON\n' +
  'BENOIT;BERTRANDO\n' +
  'FLORIAN;DAROQUE\n' +
  'Alexandre;Montfort\n' +
  'JOEL;TANNIOU\n' +
  'Afchin;Moaven\n' +
  ';\n' +
  'Pascal;COLLET\n' +
  'Pascal;HABCHI\n' +
  'Pascal;LEPLEGE\n' +
  'Cédric;LEGORGEU\n' +
  'Philippe;LECALVEZ\n' +
  'Bogdan;SZUTKIEWICZ\n' +
  'Philippe;Loriquer\n' +
  'Jean-Pierre;Abraham\n' +
  'Pascal;Merotto\n' +
  'David;Moula\n' +
  'Sebastien;Mauris\n' +
  'Sebastien;Denolf\n' +
  'Christophe;Gonzalez\n' +
  'Christophe;MALARDEAU\n' +
  'Michèle;BORIE\n' +
  'FABIAN;SERGINSKY\n' +
  ';\n' +
  ';\n' +
  'LAURE;DUPEYRE\n' +
  'Amélie;Momy\n' +
  'JEAN FRANCOIS;PETRA\n' +
  'Clément;Gaillard\n' +
  'Nicolas;Boulanger\n' +
  'Christophe;Durand\n' +
  'Christophe;Decroix\n' +
  'JACK;CARLES\n' +
  'REMI;PALIOT\n' +
  'amandine;demard\n' +
  'Déborah;Delvallée\n' +
  ';\n' +
  'Patrice;GALLOIS\n' +
  'DAVID;NABET\n' +
  'ALAIN;HERVOUET\n' +
  'Guillaume;BROSSEAU\n' +
  'THIBAUT;DROT\n' +
  'Vincent;Gorce\n' +
  'Titrent;Pauline\n' +
  'Christophe;PINTO\n' +
  ';\n' +
  ';\n' +
  'CHLOE;MINA\n' +
  'ALAIN;BARTHET\n' +
  'YOANN;RAMPLOU\n' +
  'ARNAUD;WALTER\n' +
  'MATHIEU;CLERC\n' +
  'MIKAEL;MAURY\n' +
  'AGATHE;CASTEX\n' +
  'JEROME;FORES\n' +
  'MICHEL;BOSC\n' +
  'Marie Chantal;Collet\n' +
  'pierre;bayle\n' +
  'Simon;Pujol\n' +
  'Stéphane;MELLONI\n' +
  'frederic;craipeau\n' +
  'Rouze;Aude\n' +
  ';\n' +
  'Sandy;CARIO\n' +
  'Anthony;Le Baccon\n' +
  'Nicolas;Bonnefoy\n' +
  'Jean Marc;Rougemont\n' +
  'Fabrice;Aubert\n' +
  'Jacky;Androuin\n' +
  'guillaume;dubois\n' +
  'frederic;klonouski\n' +
  'Patrice;DELRIEU\n' +
  ';\n' +
  'Jean-Philippe;MASSON\n' +
  'Violaine;Bray\n' +
  'Olivia ;Barré \n' +
  'xavier;goullot\n' +
  'PAULINE;ROUET\n' +
  'Christian;Laplume\n' +
  'Laurent;REVERDY\n' +
  'Loic;HERVOCHON\n' +
  ';\n' +
  'Rachid;ARHAB\n' +
  'Coraline;Bardet\n' +
  'Marina;BARBERA\n' +
  'Georges;DOULAIN\n' +
  'ludovic;le guennec\n' +
  'Sarah;GEOFFROY\n' +
  'Gwenola;Buan\n' +
  ';\n' +
  'J MARC;HEBERT\n' +
  ';\n' +
  'charlene;lamusse\n' +
  ';\n' +
  ';\n' +
  'LUDOVIC;MOULIN\n' +
  ';\n' +
  'Charlène;Fouasse\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'CHRISTINE;LEPAGNEZ\n' +
  ';\n' +
  'DIDIER;LETOUZEY\n' +
  'Eric;Valtier\n' +
  'Eric;Fajardo\n' +
  'jonathan;Robillard\n' +
  'jean louis;lambalot\n' +
  ';\n' +
  'Cédric;NICOLAS\n' +
  'Pierre;Pacary\n' +
  'Michel;DE ALBUQUERQUE\n' +
  'Christelle;Focqueu\n' +
  ';\n' +
  'Olivier;Senet\n' +
  'Sylvain;Jalabert\n' +
  ';\n' +
  'Thomas;LEFRANCOIS\n' +
  ';\n' +
  'Christine;VASSAL\n' +
  ';\n' +
  'PAULO;FERNANDES\n' +
  'Jeandet;Marie \n' +
  'Dominique;Didier\n' +
  'Philippe;Fanton\n' +
  'Nicolas;Chevalier\n' +
  'Emilie;Debuisson\n' +
  'Victor;Benedetti\n' +
  'Dominique;Dulac\n' +
  'Remi;Peyrot\n' +
  'Jonathan;Garcia\n' +
  'Jose;Marques\n' +
  'Olivier;Carbonnier\n' +
  ';\n' +
  'Pierre;LOUBAT\n' +
  'Mathilde ;Maillard \n' +
  'Alexandre;Dulot\n' +
  ';\n' +
  'Cédric;Foret\n' +
  'David;DANIEL\n' +
  'PATRICE;DUVERNOY\n' +
  'Bruno;DACOSTE\n' +
  'Arnaud;ANDRE-PIERRE\n' +
  ';\n' +
  'Lionel;HUE\n' +
  'Stéphane;Julienne\n' +
  'Andrea;Modica\n' +
  'Kévin;Thavisouk\n' +
  'Jean BAPTISTE;BEKIER\n' +
  'Fabien;Levallois\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Léa;NOUHAUD\n' +
  'Laurent;Brunet\n' +
  'Lise;BENISTY\n' +
  'Laura;Mussard\n' +
  ';\n' +
  'Arnaud;Touzet\n' +
  'Florian;LANDY\n' +
  ';\n' +
  ';\n' +
  'Yacine;TALEB\n' +
  ';\n' +
  'Elodie;HUMBERT\n' +
  'Audrey;Arnaud\n' +
  'Hélène;Rue\n' +
  ';\n' +
  ';\n' +
  'Sandrine;BLANCHARD\n' +
  'patrick;barreau\n' +
  'Pierre;MANNES\n' +
  'Michaël;Dusserre-Bresson\n' +
  'Artigues;Equipe vente VO \n' +
  'Merignac;Equipe vente VO\n' +
  'La Teste;Equipe vente VO\n' +
  'PHILIPPE;MANNES\n' +
  'Nicolas;Giltaire\n' +
  'OLIVIER;HOUARD\n' +
  'Cédric;PETIT-PIERRE\n' +
  'serdar;keskinkilic\n' +
  'LIONEL;RACANIERE\n' +
  ';\n' +
  'PIERRICK;WEYANT\n' +
  'Fabrice;Guyot\n' +
  ';Herbaut\n' +
  'Marc;Borzi\n' +
  'Christophe;Creton\n' +
  'Sébastien;Chatain\n' +
  'Alexandre;Chatain\n' +
  'Karine;German\n' +
  'Corinne;Rousselet\n' +
  'bertrand;vitse\n' +
  'Jean Philippe ;Carreres\n' +
  'DIDIER;BARDOUIL\n' +
  'PATRICK;ALLANNIC\n' +
  'Jean-Pascal;Dubois\n' +
  'Maryse;Humbert\n' +
  'Stephan;Laganier\n' +
  'Nicolas;Cannet\n' +
  'WILIMA;LANDRA\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'EDDY;STAGNARO\n' +
  'DORIAN;VILLA\n' +
  'FABIEN;MAGNOLER\n' +
  'Stéphane;LE BOHEC\n' +
  'CHAMPOUD;David\n' +
  'Pierre;Rajsavong\n' +
  'Laurent;Vaux\n' +
  'Karl;Pautric\n' +
  'Julien;Marnat\n' +
  'Vincent;Flachet\n' +
  'Christelle;Conduché\n' +
  'Sébastien;Chavant\n' +
  'Sabine;Desquines\n' +
  'NADINE;EVENO\n' +
  'DOMINIQUE;LE BAIL\n' +
  'Pascal;Faure\n' +
  'Mickaël;Tardy\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Samuel;Jousselin\n' +
  ';\n' +
  'JEAN-MARC;ZIMOLONG\n' +
  'Christophe;Dargelos\n' +
  'Bernard;Pierson\n' +
  'Thierry;Martin\n' +
  'Bruno;GERARDIN\n' +
  'Stéphane;Frenoux\n' +
  ';\n' +
  ';\n' +
  'Telmo;FERNANDES\n' +
  ';\n' +
  'Pascal;Bicheron\n' +
  'Christophe;DARRAS\n' +
  ';\n' +
  'Denis;BRICHET\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'Kevin;Morin\n' +
  ';\n' +
  'Eric;Roiné\n' +
  ';\n' +
  ';\n' +
  'CHANTAL;ARFEUILLERES\n' +
  'ALEXANDRE;GONCALVES\n' +
  'Alexis;Marchetti\n' +
  'SEBASTIEN;BRANCOURT\n' +
  ';\n' +
  ';\n' +
  ';\n' +
  'WILLIAM;PELLEFIGUE\n' +
  'Laurent;Lacroye\n' +
  'Christelle;Dupont\n' +
  'Franck;Rea\n' +
  'BRUNO;DA CUNHA\n' +
  ';\n' +
  'PAULINE;MADEC\n' +
  'FREDERIC;RICHARD\n' +
  ';\n' +
  ';\n' +
  'Christophe;Odetto\n' +
  'Thomas;Rousée\n' +
  'Olivier;Santamaria\n' +
  'Ingrid;Rabier\n' +
  'floriane;delobelle\n' +
  'PATRICE;LABRUYERE\n';

var info = {
  nbDuplicates: { name: 'Duplicates removed', value: 0 },
  nbLines: { name: 'Number of lines', value: 0 },
  nbEmptyLines: { name: 'Empty lines removed', value: 0 },
  nbAccents: { name: 'Number of accents removed', value: 0 },
  nbPoncts: { name: 'Number of words separations due to punctuation', value: 0 },
  nbSmallWords: { name: 'Removed small names <= 3', value: 0 },
  nbPlurals: { name: 'Removed all plurals "s"', value: 0 },
  nbTotalWords: { name: 'Final number of words', value: 0 }
};

function cleanAccents(text) { // change éà... to ea...
  var accent = [
    /[\300-\306]/g, /[\340-\346]/g, // A, a
    /[\310-\313]/g, /[\350-\353]/g, // E, e
    /[\314-\317]/g, /[\354-\357]/g, // I, i
    /[\322-\330]/g, /[\362-\370]/g, // O, o
    /[\331-\334]/g, /[\371-\374]/g, // U, u
    /[\321]/g, /[\361]/g, // N, n
    /[\307]/g, /[\347]/g // C, c
  ];
  var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
  var cleaned = text;
  for (var i = 0; i < accent.length; i++) {
    cleaned = cleaned.replace(accent[i], function () { // eslint-disable-line
      info.nbAccents.value++;
      return noaccent[i];
    });
  }
  return cleaned;
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

app.on('booted', function () {
  app.models.CensoredWords.find({}, function (err, dictionaries) {
    if (err) { console.log(err); return; }
    var currentWords = null;
    var cursesWords = null;
    var namesWords = null;
    if (!dictionaries || !dictionaries.length || dictionaries[0].language !== 'fr') {
      console.log('Error, didn\'t find the french dictionary');
      return;
    }
    currentWords = dictionaries[0].words;
    cursesWords = currentWords.filter(function (w) {
      return !(/[A-Z]/.test(w));
    });
    namesWords = currentWords.filter(function (w) {
      return /[A-Z]/.test(w);
    });

    var cleanedList =
      cleanAccents(dirtyNamesStr + ';' + namesWords.join(';')).toLowerCase()
        .replace(/\n/g, function () {
          info.nbLines.value++;
          return ';';
        })
        .replace(/[.,\/#!$%\^&\* :{}=\-_`~()]/g, function () { // eslint-disable-line
          info.nbPoncts.value++;
          return ';';
        })
        // .replace(/s\b/g, function () {
        //   info.nbPlurals.value++;
        //   return '';
        // })
        .replace(/;;+/g, function (m) {
          info.nbEmptyLines.value += m.length - 1;
          return ';';
        })
        .split(';');
    cleanedList = cleanedList.filter(function (elem) {
      info.nbSmallWords.value += (elem.length > 3 ? 1 : 0);
      return elem.length > 3;
    });

    cleanedList = cleanedList.filter(function (elem, pos) {
      info.nbDuplicates.value += (cleanedList.indexOf(elem) !== pos) ? 1 : 0;
      return cleanedList.indexOf(elem) === pos;
    });

    cleanedList.forEach(function (name, pos) {
      cleanedList[pos] = capitalize(name);
      cleanedList.push(name.toUpperCase());
    });

    cleanedList = cleanedList.concat(cursesWords);

    var finalRegex = ''; // '\\b(' + cleanedList.join('|') + ')\\b';

    cleanedList.forEach(function (word, pos) {
      cleanedList[pos] = '"' + word + '"';
    });

    info.nbTotalWords.value = cleanedList.length;

    Object.values(info).forEach(function (r) {
      console.log(r.name, ' : ', r.value);
    });

    var finalString = 'db.getCollection("censoredWords").update(\n  {language:"fr"},'
      + '\n  {\n    language:"fr",\n    words: [\n      ' + cleanedList.join(',\n      ') + '\n      ]\n  })\n'
    + finalRegex + '\n';

    fs.writeFile(__dirname + '/output.txt', finalString, function (err) { // eslint-disable-line
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
      process.exit();
    });
  });
});
