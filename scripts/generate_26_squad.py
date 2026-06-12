import json
import random

random.seed(42)

data = json.load(open('src/data/players.json'))
existing = data['players']

# Current counts per team
from collections import Counter

team_players = {}
for p in existing:
    team_players.setdefault(p['team_id'], []).append(p)

# Target: 26 players per team, 3 GK / 9 DF / 8 MF / 6 FW
target = {'GK': 3, 'DF': 9, 'MF': 8, 'FW': 6}

# Realistic name pools per country (first names and last names)
name_pools = {
    'algeria': {'first': ['Yacine','Ismaël','Rayan','Houssem','Farès','Aïssa','Sofiane','Adam','Badreddine','Mohamed','Abdel','Karim','Riad','Zinedine','Mehdi','Rachid','Nabil','Hicham','Tahar','Lamine'], 'last': ['Bennacer','Mahrez','Brahimi','Feghouli','Ghezzal','Bensebaini','Mandi','Tahrat','Aït-Nouri','Touzghar','Zerrouki','Boudaoui','Belaili','Bounedjah','Slimani','Djebbari','Hanni','Medjani','Mesloub','Boudebouz']},
    'argentina': {'first': ['Lionel','Ángel','Julián','Lautaro','Enzo','Rodrigo','Nahuel','Germán','Nicolás','Gonzalo','Leandro','Pablo','Marcos','Cristian','Alejandro','Federico','Lucas','Emiliano','Franco','Matías'], 'last': ['Martínez','Fernández','Álvarez','Mac Allister','De Paul','Paredes','Romero','Tagliafico','Acuña','Molina','Montiel','Palacios','Correa','Dybala','Di María','Lo Celso','Foyth','Pezzella','Martínez Quarta','Almada']},
    'australia': {'first': ['Mathew','Aaron','Jackson','Riley','Connor','Harry','Craig','Miloš','Kye','Awer','Jamie','Mitchell','Trent','Daniel','Thomas','Keanu','Ryan','Callum','Jason','Gianni'], 'last': ['Ryan','Mooy','Irvine','McGree','Boyle','Souttar','Wright','Degenek','Atkinson','Behich','Mabil','Maclaren','Duke','Cummings','Tilio','Metcalfe','O\'Neill','Devlin','Silvera','Borrello']},
    'austria': {'first': ['David','Marcel','Christoph','Konrad','Florian','Xaver','Nicolas','Michael','Stefan','Marko','Roman','Kevin','Andreas','Patrick','Julian','Dejan','Muhammed','Alexander','Maximilian','Manfred'], 'last': ['Alaba','Sabitzer','Arnautović','Laimer','Schlager','Baumgartner','Grillitsch','Posch','Danso','Wöber','Friedl','Mwene','Seiwald','Gregoritsch','Kainz','Ljubičić','Wimmer','Trauner','Prass','Schmid']},
    'belgium': {'first': ['Kevin','Romelu','Eden','Thibaut','Youri','Leandro','Jeremy','Wout','Hans','Timothy','Zeno','Arthur','Amadou','Orel','Charles','Alexis','Dodi','Loïs','Roméo','Cédric'], 'last': ['De Bruyne','Lukaku','Hazard','Courtois','Tielemans','Trossard','Doku','Faes','Vanheusden','Castagne','Debast','Theate','Onyedika','Mangala','De Ketelaere','Saelemaekers','Lukebakio','Openda','Bakayoko','Kompany']},
    'bosnia-and-herzegovina': {'first': ['Edin','Miralem','Sead','Rade','Gojko','Anel','Amer','Ermin','Haris','Ibrahim','Smail','Denis','Adnan','Asmir','Toni','Elvir','Muhamed','Almir','Nedim','Armin'], 'last': ['Džeko','Pjanić','Kolašinac','Krunić','Cimirot','Hadžiahmetović','Gojak','Zec','Dedić','Šehić','Mujakić','Ahmedhodžić','Barišić','Todorović','Stevanović','Hodžić','Hajradinović','Lončar','Piric','Bešić']},
    'brazil': {'first': ['Neymar','Vinícius','Richarlison','Gabriel','Raphinha','Casemiro','Lucas','Éder','Bruno','André','Danilo','Éder','Weverton','Alex','Gérson','Pedro','Matheus','Joelinton','Antony','Wesley'], 'last': ['Júnior','Paquetá','Martins','Jesus','Martinelli','Militão','Marquinhos','Silva','Danilo','Lodi','Arana','Guimarães','Gomes','Ribeiro','Cunha','Henrique','Pereira','Nunes','Ramos','Firmino']},
    'canada': {'first': ['Alphonso','Jonathan','Cyle','Stephen','Maxime','Ismaël','Liam','Samuel','Richie','Tajon','Derek','Junior','Mark-Anthony','Kamal','Scott','Charles','Jacob','Dominick','Zachary','James'], 'last': ['Davies','David','Larin','Eustaquio','Kone','Cornelius','Vitoria','Johnston','Adekugbe','Buchanan','Laryea','Hoilett','Millar','Cavallini','Osorio','Piette','Fraser','Waterman','McGraw','Crepeau']},
    'cape-verde': {'first': ['Ryan','Jamiro','Jovane','Garry','Djaniny','Kenny','Jeffry','Roberto','Carlos','Luis','Rui','Marco','André','Hélder','Bruno','Nuno','Tiago','David','Miguel','Sérgio'], 'last': ['Mendes','Monteiro','Cabral','Rodrigues','Tavares','Fortes','Lopes','Silva','Santos','Fernandes','Soares','Gonçalves','Pereira','Almeida','Teixeira','Costa','Martins','Ribeiro','Carvalho','Ferreira']},
    'colombia': {'first': ['James','Radamel','Luis','Juan','Yerry','Davinson','Wilmar','Mateus','Rafael','Carlos','Johan','Cristian','Gustavo','Kevin','Andrés','Yairo','Jhon','Deiber','Santiago','Alexis'], 'last': ['Rodríguez','Falcao','Díaz','Cuadrado','Mina','Sánchez','Barrios','Uribe','Lerma','Cuesta','Borja','Zapata','Murillo','Arias','Mojica','Ospina','Vargas','Chará','Moreno','Sinisterra']},
    'croatia': {'first': ['Luka','Ivan','Mateo','Marcelo','Josip','Mario','Andrej','Borna','Lovro','Martin','Duje','Domagoj','Kristijan','Petar','Mislav','Josko','Nikola','Ante','Marko','Filip'], 'last': ['Modrić','Perišić','Brozović','Kovačić','Gvardiol','Livaja','Kramarić','Sosa','Juranović','Vida','Lovren','Stanišić','Pašalić','Vlašić','Majer','Oršić','Budimir','Livaković','Ivanišević','Barišić']},
    'curacao': {'first': ['Cuco','Leandro','Juninho','Jarchinio','Richairo','Charlison','Darren','Rangelo','Shermar','Kevin','Gino','Quincy','Shanon','Michaël','Rigino','Jurich','Brandley','Nicky','Gevaro','Jearl'], 'last': ['Martina','Bacuna','Antonia','Cabenda','Zivkovic','Benschop','Spoon','Janga','Felomina','Nijman','van Kessel','Hooi','Carmelia','Maria','Hector','Gaari','Rosario','Dos Santos','Nepomuceno','Carmona']},
    'czech-republic': {'first': ['Tomáš','Patrik','Václav','Jan','Jakub','Michal','David','Vladimír','Pavel','Lukáš','Jaroslav','Matěj','Karel','Martin','Filip','Adam','Ondřej','Roman','Radek','Milan'], 'last': ['Souček','Schick','Černý','Bořil','Coufal','Zima','Brabec','Holeš','Barák','Krejčí','Jankto','Hložek','Kuchta','Pešek','Sadílek','Provod','Kalvach','Zelený','Mandous','Kovář']},
    'dr-congo': {'first': ['Cédric','Gaël','Chancel','Meschak','Yoane','Samuel','Arthur','Grady','Edo','Neeskens','Britt','Silas','Joris','Aaron','Marcel','Dylan','Jonathan','Romain','Héritier','Bienvenu'], 'last': ['Bakambu','Kakuta','Mbokani','Elia','Wissa','Mpoku','Kayembe','Tshibola','Luyindama','Nsakala','Ikoko','Mpeko','Bokadi','Mpanzu','Bolasie','Lokilo','Kumbedi','Mvoué','Bongonda','Muleka']},
    'ecuador': {'first': ['Enner','Pervis','Moisés','Ángel','Jhegson','Gonzalo','Piero','José','Jeremy','Alan','Carlos','Diego','Joao','Marlon','Byron','Romario','Jordy','Nilson','Pedro','Luis'], 'last': ['Valencia','Estupiñán','Caicedo','Mena','Gruezo','Plata','Hincapié','Cifuentes','Sarmiento','Franco','Preciado','Arreaga','Torres','Palacios','Castillo','Ibarra','Méndez','Ortiz','Quiñónez','Chalá']},
    'egypt': {'first': ['Mohamed','Ahmed','Mahmoud','Trezeguet','Mostafa','Omar','Hamdi','Amr','Ali','Zizo','Abdallah','Mohanad','Ayman','Marwan','Hussein','Ibrahim','Mohamed','Karim','Ramadan','Nabil'], 'last': ['Salah','Hegazi','Elneny','Trezeguet','Mohamed','Marmoush','Fathi','Ward','Lasheen','Abdelmonem','Galal','Koka','Sobhi','Kahraba','El Solia','Hamed','Ashraf','Hamdy','Saad','El Said']},
    'england': {'first': ['Harry','Marcus','Bukayo','Jude','Phil','Declan','Mason','Jack','Kyle','John','Jordan','Trent','Ben','Conor','Cole','James','Aaron','Eberechi','Rico','Lewis'], 'last': ['Kane','Rashford','Saka','Bellingham','Foden','Rice','Mount','Grealish','Walker','Stones','Pickford','Alexander-Arnold','White','Gallagher','Palmer','Maddison','Ramsdale','Eze','Lewis','Dunk']},
    'france': {'first': ['Kylian','Antoine','Olivier','Ousmane','Eduardo','Aurélien','Adrien','William','Jules','Ibrahima','Lucas','Théo','Mike','Alphonse','Randal','Kingsley','Youssouf','Marcus','Benoît','Ferland'], 'last': ['Mbappé','Griezmann','Giroud','Dembélé','Camavinga','Tchouaméni','Rabiot','Saliba','Koundé','Konaté','Hernández','Hernández','Maignan','Areola','Kolo Muani','Coman','Fofana','Thuram','Pavard','Mendy']},
    'germany': {'first': ['Manuel','İlkay','Joshua','Jamal','Florian','Kai','Serge','Leroy','Niclas','Antonio','Leon','David','Jonathan','Nico','Benjamin','Marius','Felix','Robin','Kevin','Chris'], 'last': ['Neuer','Gündoğan','Kimmich','Musiala','Wirtz','Havertz','Gnabry','Sané','Füllkrug','Rüdiger','Goretzka','Raum','Tah','Schlotterbeck','Henrichs','Andrich','Beier','Koch','Stiller','Burkardt']},
    'ghana': {'first': ['Jordan','André','Thomas','Mohammed','Daniel','Joseph','Gideon','Abdul','Alexander','Iñaki','Antoine','Richmond','Salis','Alidu','Tariq','Elisha','Baba','Kingsley','Ransford','Samuel'], 'last': ['Ayew','Ayew','Partey','Kudus','Amartey','Wollacott','Lamptey','Salisu','Dijkstra','Williams','Semenyo','Baba','Bukari','Odoi','Mensah','Owusu','Sulemana','Fatawu','Seidu','Afriyie']},
    'haiti': {'first': ['Johnny','Duckens','Carnejy','Carlens','Bryan','Alex','Ricardo','Francois','Kevin','Stéphane','Ricardo','Jems','Bénchy','Leverton','Zachary','Mondy','Ronaldo','Fredler','Steeven','Bicou'], 'last': ['Placide','Nazon','Antoine','Arcus','Alceus','Christian','Ade','Levert','Etienne','Lambese','Désir','Geffrard','Prunier','Simon','Jérôme','Saba','Damus','Sainte','Nordé','Bazile']},
    'iran': {'first': ['Alireza','Sardar','Mehdi','Saman','Ehsan','Milad','Majid','Vahid','Saeid','Ahmad','Ramin','Morteza','Omid','Mohammad','Hossein','Amir','Aria','Ali','Yasin','Abolfazl'], 'last': ['Beiranvand','Azmoun','Taremi','Ghoddos','Hajsafi','Mohammadi','Hosseini','Ebrahimi','Amiri','Pouraliganji','Kanaanizadegan','Gholizadeh','Noorafkan','Ansarifard','Khalilzadeh','Shojaei','Dejagah','Jahanbakhsh','Torabi','Rafiei']},
    'iraq': {'first': ['Jalal','Aymen','Ali','Safaa','Amjad','Hussein','Ibrahim','Osama','Mohannad','Ahmed','Alaa','Bashar','Younis','Saad','Mohammed','Hassan','Karrar','Mustafa','Dhurgham','Mohanad'], 'last': ['Hassan','Hussein','Adnan','Attwan','Kalaf','Ali','Ahmed','Rashid','Abdul-Raheem','Faez','Mhawi','Jassim','Tariq','Natiq','Ghalib','Al-Imam','Bayesh','Resan','Karim','Jabbar']},
    'ivory-coast': {'first': ['Sébastien','Franck','Nicolas','Wilfried','Jean','Seko','Jérémie','Hamed','Maxwel','Simon','Christian','Willy','Evan','Oumar','Aboubakar','Jonathan','Idrissa','Kouadio','Vakoun','Yves'], 'last': ['Haller','Kessié','Pépé','Zaha','Seri','Fofana','Boga','Traoré','Cornet','Deli','Boly','Sangaré','Ndicka','Diakité','Kouamé','Gradel','Doumbia','Baila','Bamba','Konan']},
    'japan': {'first': ['Takefusa','Ritsu','Daichi','Wataru','Hiroki','Ko','Ayumu','Junya','Takumi','Kyogo','Kaoru','Yuta','Shuichi','Zion','Mao','Keito','Reo','Ao','Koki','Gaku'], 'last': ['Kubo','Doan','Kamada','Endo','Itakura','Machida','Seko','Ito','Minamino','Furuhashi','Mitoma','Nakayama','Gonda','Suzuki','Hosoya','Nakamura','Hatate','Tanaka','Ogawa','Shibasaki']},
    'jordan': {'first': ['Mousa','Yazan','Ali','Anas','Baha','Yousef','Mahmoud','Saed','Mohammad','Noor','Saleh','Ihsan','Fadi','Ahmad','Oday','Suleiman','Tamer','Hamza','Rashid','Hussein'], 'last': ['Al-Taamari','Al-Naimat','Olwan','Bani Yaseen','Al-Mardi','Abu Zrayq','Haddad','Al-Rawabdeh','Abu Hasheesh','Shelbaieh','Al-Ajalin','Nasib','Samir','Shatnawi','Al-Dardour','Al-Manasrah','Al-Maharmeh','Al-Fakhouri','Al-Haj','Al-Sanadid']},
    'mexico': {'first': ['Guillermo','Hirving','Raúl','Edson','Luis','Jesús','Andrés','Orbelín','Jorge','César','Henry','Uriel','Johan','Alexis','Kevin','Julio','Marcel','Erick','Santiago','Oswaldo'], 'last': ['Ochoa','Lozano','Jiménez','Álvarez','Chávez','Gallardo','Montes','Vega','Sánchez','Araujo','Martín','Antuna','Vásquez','Pineda','Álvarez','Córdova','Flores','Gutiérrez','Giménez','Rodríguez']},
    'morocco': {'first': ['Yassine','Achraf','Hakim','Noussair','Sofyan','Bilal','Azzedine','Romain','Youssef','Zakaria','Selim','Ilias','Eliesse','Oussama','Ismaël','Chadi','Abdel','Amir','Ayoub','Reda'], 'last': ['Bounou','Hakimi','Ziyech','Mazraoui','Amrabat','Díaz','Ounahi','Saïss','En-Nesyri','Aboukhlal','Amallah','Chair','Ben Seghir','El Khannouss','Sibari','Riad','Harit','Richardson','Adli','Tagnaouti']},
    'netherlands': {'first': ['Virgil','Frenkie','Memphis','Cody','Xavi','Tijjani','Donyell','Matthijs','Nathan','Denzel','Stefan','Micky','Jeremie','Joël','Marten','Jurriën','Daley','Ryan','Wout','Lutsharel'], 'last': ['van Dijk','de Jong','Depay','Gakpo','Simons','Reijnders','Malen','de Ligt','Aké','Dumfries','de Vrij','van de Ven','Frimpong','Piroe','de Roon','Timber','Blind','Gravenberch','Weghorst','Geertruida']},
    'new-zealand': {'first': ['Chris','Winston','Tommy','Sarpreet','Joe','Elijah','Clayton','Michael','Nando','Tim','Alex','Liberato','Francis','Marko','Max','Kosta','Oliver','Matthew','Dalton','Jesse'], 'last': ['Wood','Reid','Smith','Singh','Bell','Just','Lewis','Boxall','Pijnaker','Payne','Cacace','Sutton','de Vries','Stamenić','Crocombe','Barbarouses','Garbett','Woud','Rogerson','Howieson']},
    'norway': {'first': ['Erling','Martin','Sander','Fredrik','Ødegaard','Jørgen','Kristoffer','Morten','Oscar','Andreas','Jesper','Hugo','Mathias','Tobias','Marius','Julian','David','Adrian','Emil','Stian'], 'last': ['Haaland','Ødegaard','Berge','Aursnes','Larsen','Strandberg','Ajer','Pedersen','Ryerson','Gregersen','Dæhli','Vetlesen','Thorsby','Solbakken','Hauge','King','Bjørkan','Meling','Wolff Eikrem','Normann']},
    'panama': {'first': ['Luis','Ismael','Rolando','Aníbal','Adalberto','José','Edgar','Cristian','Eric','Alberto','Yoel','Fidel','José','César','Abdiel','Jorman','Jair','Roderick','Freddy','Erick'], 'last': ['Mejía','Díaz','Blackburn','Godoy','Carrasquilla','Fajardo','Bárcenas','Quintero','Davis','Cepellini','Guevara','Escobar','Murillo','Miller','Ayarza','Perdomo','Ramos','Cundumí','Valencia','Yanis']},
    'paraguay': {'first': ['Miguel','Ángel','Julio','Derlis','Alejandro','Matías','Gustavo','Richard','Alberto','Héctor','Óscar','Mathías','Antonio','Juan','Iván','Sergio','Diego','Robert','Carlos','Luis'], 'last': ['Almirón','Romero','Cáceres','González','Gamarra','Balbuena','Giménez','Villamayor','Sanabria','Cardozo','Rojas','Ávalos','Piris','Espínola','Velázquez','Martínez','Morel','Bareiro','Ojeda','Salcedo']},
    'portugal': {'first': ['Cristiano','Bruno','Bernardo','João','Diogo','Rúben','Rafael','Gonçalo','Otávio','Vítor','Nuno','Danilo','João','Pedro','Nélson','José','Ricardo','Matheus','Francisco','António'], 'last': ['Ronaldo','Fernandes','Silva','Cancelo','Jota','Dias','Leão','Ramos','Neves','Machado','Mendes','Pereira','Palhinha','Gonçalves','Félix','Horta','Mário','Nunes','Carvalho','Lopes']},
    'qatar': {'first': ['Saad','Akram','Hassan','Almoez','Boualem','Abdelkarim','Tarek','Pedro','Abdulaziz','Ahmed','Musab','Ali','Mohammed','Homam','Jassem','Abdullah','Mohanad','Ibrahim','Yousef','Salem'], 'last': ['Al Sheeb','Afif','Al-Haydos','Ali','Khoukhi','Hassan','Salman','Al-Abdullah','Miguel','Madibo','Al-Brake','Boudiaf','Waad','Al-Rawi','Jaber','Al-Ahrak','Muntari','Al-Hajri','Mazeed','Al-Bakri']},
    'saudi-arabia': {'first': ['Salem','Feras','Salman','Saud','Ali','Mohamed','Hassan','Abdullah','Sultan','Mohammed','Abdulelah','Ayman','Nasser','Hattan','Nawaf','Yasser','Ziyad','Turki','Riyadh','Samir'], 'last': ['Al-Dawsari','Al-Buraikan','Al-Faraj','Abdulhamid','Al-Bulaihi','Tambakti','Al-Owais','Al-Aqidi','Al-Shahrani','Kanno','Al-Hassan','Bahebri','Al-Najei','Al-Ghamdi','Al-Qahtani','Asiri','Madu','Al-Amri','Al-Malki','Al-Khaibari']},
    'scotland': {'first': ['Andrew','John','Scott','Callum','Billy','Kieran','Ryan','Stuart','John','James','Anthony','Grant','Jack','Kenny','David','Kevin','Lewis','Nathan','Liam','Jacob'], 'last': ['Robertson','McTominay','McKenna','McGinn','Gilmour','Tierney','Jack','Armstrong','McGregor','Forrest','Ralston','Hendry','Christie','McLean','Marshall','Adams','Dykes','Porteous','Hickey','Patterson']},
    'senegal': {'first': ['Sadio','Kalidou','Édouard','Idrissa','Ismaila','Pape','Boulaye','Nampalys','Abdou','Moussa','Cheikhou','Famara','Pathé','Iliman','Mame','Opa','Pape','Sada','Formose','Moussa'], 'last': ['Mané','Koulibaly','Mendy','Gueye','Jakobs','Sarr','Dia','Mendy','Diallo','Niakhaté','Kouyaté','Diédhiou','Ciss','Ndiaye','Diouf','Nguette','Gomis','Thioub','Sane','Baldé']},
    'south-africa': {'first': ['Percy','Themba','Lyle','Teboho','Mothobi','Nyiko','Evidence','Keagan','Luke','Siyabonga','Thapelo','Katlego','Bongani','Kgotso','Sphephelo','Khuliso','Oliver','Bruce','Hlongwane','Zakhele'], 'last': ['Tau','Zwane','Foster','Mokoena','Mvala','Mobbie','Makgopa','Dolly','Le Roux','Ngezana','Morena','Hlanti','Xulu','Mudau','Sithole','Mkhulise','Williams','Bvuma','Gumede','Ndlovu']},
    'south-korea': {'first': ['Son','Heung-min','Kang-in','Min-jae','Woo-young','Hee-chan','Hyun-woo','Jae-sung','Seung-ho','In-beom','Young-gwon','Tae-hwan','Jin-su','Sung-yueng','Chang-hoon','Ui-jo','Gue-sung','Seol-young','Min-kyu','Han-beom'], 'last': ['Heung-min','Lee','Kim','Hwang','Cho','Jo','Lee','Paik','Park','Kim','Hong','Kim','Jung','Lee','Hwang','Cho','Yoon','Lee','Kang','Lee']},
    'spain': {'first': ['Pedri','Lamine','Nico','Dani','Rodri','Mikel','Ferrán','Álvaro','Aymeric','Pau','Carvajal','Laporte','Alejandro','Marcos','David','Mikel','Jesús','Martín','Sergio','Bryan'], 'last': ['González','Yamal','Williams','Olmo','Hernández','Oyarzabal','Torres','Morata','Laporte','Cubarsí','Navas','Le Normand','Grimaldo','Llorente','Raya','Merino','Navas','Zubimendi','Gómez','Zaragoza']},
    'sweden': {'first': ['Victor','Alexander','Dejan','Emil','Robin','Jens','Viktor','Gustav','Hjalmar','Ludvig','Anton','Samuel','Jesper','Hugo','Isak','Nicolas','Simon','Marcus','Johan','Gabriel'], 'last': ['Lindelöf','Isak','Kulusevski','Forsberg','Olsen','Cajuste','Gyökeres','Gustafson','Ekdal','Augustinsson','Krafth','Holm','Karlström','Larsson','Sema','Claesson','Svanberg','Nilsson','Hien','Starfelt']},
    'switzerland': {'first': ['Yann','Manuel','Granit','Xherdan','Ruben','Denis','Remo','Nico','Silvan','Michel','Ricardo','Edimilson','Noah','Fabian','Dan','Kwadwo','Zeki','Andi','Cédric','Uran'], 'last': ['Sommer','Akanji','Xhaka','Shaqiri','Vargas','Zakaria','Freuler','Elvedi','Widmer','Aebischer','Rodríguez','Fernandes','Okafor','Rieder','Ndoye','Amdouni','Steffen','Zeqiri','Itten','Bislimi']},
    'tunisia': {'first': ['Wahbi','Youssef','Aïssa','Ali','Naim','Montassar','Mohamed','Ellyes','Ferjani','Hamza','Anis','Bechir','Bilel','Seifeddine','Oussama','Naïm','Taha','Rami','Firas','Houssem'], 'last': ['Khazri','Msakni','Laïdouni','Mâaloul','Sliti','Talbi','Dahmen','Ben Romdhane','Sassi','Rafia','Mathlouthi','Kechrida','Abdi','Dräger','Jaziri','Ben Larbi','Chaouat','Jemal','Ben Othmane','Gharbi']},
    'turkey': {'first': ['Hakan','Çağlar','Kerem','İrfan','Orkun','Merih','Abdülkerim','Ferdi','Salih','Okay','Mert','Ozan','Yusuf','Zeki','Rıdvan','Cengiz','Kenan','Kaan','Doğan','Samet'], 'last': ['Çalhanoğlu','Söyüncü','Aktürkoğlu','Kahveci','Kökçü','Demiral','Bardakçı','Kadıoğlu','Özcan','Yokuşlu','Günok','Kabak','Yazıcı','Çelik','Yılmaz','Ünder','Karaman','Ayhan','Erdoğan','Akaydin']},
    'united-states': {'first': ['Christian','Weston','Tyler','Gio','Tim','Antonee','Sergiño','Brenden','Folarin','Ricardo','Matt','Cameron','Yunus','Malik','Djordje','Auston','Cade','Kevin','Caleb','John'], 'last': ['Pulisic','McKennie','Adams','Reyna','Weah','Robinson','Dest','Aaronson','Balogun','Pepi','Turner','Carter-Vickers','Musah','Tillman','Mihailovic','Trusty','Scally','Paredes','Wiley','Lund']},
    'uruguay': {'first': ['Federico','Darwin','Facundo','Manuel','Nahitan','Ronald','Santiago','Mathías','José','Rodrigo','Bruno','Giorgian','Sergio','Maximiliano','Marcos','Emiliano','Cristian','Brian','Matías','Joaquín'], 'last': ['Valverde','Núñez','Pellistri','Ugarte','Araújo','Olivera','Giménez','Vecino','Bentancur','Aguirre','Cáceres','De Arrascaeta','Rochet','Gómez','Viña','Martínez','Olaza','Rodríguez','Ocampo','Píriz']},
    'uzbekistan': {'first': ['Eldor','Oston','Jaloliddin','Khojiakbar','Odiljon','Jamshid','Azizbek','Ikromjon','Shokhboz','Bekhruz','Mukhammad','Farrukh','Doston','Sherzod','Akmal','Zafar','Khusniddin','Sardor','Ulugbek','Shukhrat'], 'last': ['Shomurodov','Urunov','Masharipov','Alijonov','Khamrobekov','Iskanderov','Turgunboev','Abdullaev','Yokubov','Kholmatov','Kodirkulov','Suyunov','Toshpulatov','Mukhtarov','Tukhtakhodjaev','Nasrullaev','Rakhmonaliev','Nematov','Ergashev','Davlatov']},
}

clubs = {
    'algeria': ['Al Sadd', 'Algeria', 'MC Alger', 'JS Kabylie', 'ES Sétif', 'CR Belouizdad', 'Al Ahly', 'Zamalek', 'Al Hilal', 'Al Nassr', 'Galatasaray', 'OGC Nice', 'Marseille', 'Lyon', 'Montpellier', 'Angers', 'Toulouse', 'Clermont Foot', 'Nîmes', 'Le Havre'],
    'argentina': ['Boca Juniors', 'River Plate', 'Independiente', 'Racing Club', 'San Lorenzo', 'Vélez Sarsfield', 'Estudiantes', 'Newell\'s Old Boys', 'Rosario Central', 'Lanús', 'Talleres', 'Defensa y Justicia', 'Argentinos Juniors', 'Colón', 'Banfield', 'Godoy Cruz', 'Central Córdoba', 'Platense', 'Sarmiento', 'Unión'],
    'australia': ['Melbourne City', 'Sydney FC', 'Melbourne Victory', 'Western Sydney', 'Brisbane Roar', 'Adelaide United', 'Perth Glory', 'Central Coast', 'Newcastle Jets', 'Western United', 'Wellington Phoenix', 'Macarthur', 'Hearts', 'Celtic', 'Rangers', 'Sunderland', 'Portsmouth', 'Stoke City', 'Middlesbrough', 'Blackburn'],
    'austria': ['Red Bull Salzburg', 'Rapid Vienna', 'Austria Vienna', 'Sturm Graz', 'WSG Tirol', 'LASK', 'Wolfsberger AC', 'Hartberg', 'Altach', 'Klagenfurt', 'Ried', 'Austria Lustenau', 'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'Hoffenheim', 'Mainz', 'Freiburg'],
    'belgium': ['Club Brugge', 'Anderlecht', 'Standard Liège', 'Genk', 'Antwerp', 'Gent', 'Union SG', 'Charleroi', 'Mechelen', 'OH Leuven', 'Cercle Brugge', 'Westerlo', 'Eupen', 'Kortrijk', 'Zulte Waregem', 'Manchester City', 'Arsenal', 'Chelsea', 'Liverpool', 'AC Milan'],
    'bosnia-and-herzegovina': ['Sarajevo', 'Željezničar', 'Zrinjski Mostar', 'Borac Banja Luka', 'Široki Brijeg', 'Tuzla City', 'Velež Mostar', 'Sloboda Tuzla', 'Mladost Doboj', 'Radnik Bijeljina', 'Leotar', 'Igman Konjic', 'Dinamo Zagreb', 'Hajduk Split', 'Partizan', 'Red Star', 'Maribor', 'Olimpija', 'Celje', 'Domžale'],
    'brazil': ['Flamengo', 'Palmeiras', 'Santos', 'São Paulo', 'Corinthians', 'Grêmio', 'Internacional', 'Cruzeiro', 'Atlético Mineiro', 'Botafogo', 'Fluminense', 'Vasco da Gama', 'Bahia', 'Athletico Paranaense', 'Fortaleza', 'Red Bull Bragantino', 'Ceará', 'Goiás', 'Cuiabá', 'Coritiba'],
    'canada': ['Toronto FC', 'Vancouver Whitecaps', 'CF Montréal', 'Forge FC', 'Cavalry FC', 'Pacific FC', 'Atlético Ottawa', 'Valour FC', 'HFX Wanderers', 'York United', 'Club Brugge', 'Bayern Munich', 'Lille', 'Bordeaux', 'Porto', 'Benfica', 'Brentford', 'Watford', 'Reading', 'Barnsley'],
    'cape-verde': ['Sporting CP', 'Benfica', 'Porto', 'Braga', 'Vitória SC', 'Rio Ave', 'Famalicão', 'Boavista', 'Casa Pia', 'Estoril', 'Vizela', 'Chaves', 'Marítimo', 'Nacional', 'Santa Clara', 'Feirense', 'Leixões', 'Académica', 'Penafiel', 'Trofense'],
    'colombia': ['Atlético Nacional', 'Millonarios', 'América de Cali', 'Junior', 'Deportivo Cali', 'Independiente Medellín', 'Santa Fe', 'Deportes Tolima', 'Once Caldas', 'Alianza Petrolera', 'Deportivo Pereira', 'Envigado', 'La Equidad', 'Jaguares', 'Águilas Doradas', 'Boca Juniors', 'River Plate', 'Palmeiras', 'Flamengo', 'Monterrey'],
    'croatia': ['Dinamo Zagreb', 'Hajduk Split', 'Rijeka', 'Osijek', 'Lokomotiva', 'Slaven Belupo', 'Gorica', 'Istra 1961', 'Šibenik', 'Varaždin', 'Real Madrid', 'Barcelona', 'AC Milan', 'Inter Milan', 'Juventus', 'Bayern Munich', 'RB Leipzig', 'Wolfsburg', 'Tottenham', 'West Ham'],
    'curacao': ['Willem II', 'RKC Waalwijk', 'Excelsior', 'Sparta Rotterdam', 'FC Groningen', 'FC Emmen', 'Helmond Sport', 'VVV-Venlo', 'De Graafschap', 'Almere City', 'FC Eindhoven', 'Telstar', 'Jong Ajax', 'Jong PSV', 'ADO Den Haag', 'NAC Breda', 'Roda JC', 'MVV Maastricht', 'FC Dordrecht', 'TOP Oss'],
    'czech-republic': ['Slavia Prague', 'Sparta Prague', 'Viktoria Plzeň', 'Baník Ostrava', 'Sigma Olomouc', 'Jablonec', 'Mladá Boleslav', 'Slovacko', 'Teplice', 'Pardubice', 'Bohemians 1905', 'Karviná', 'České Budějovice', 'Hradec Králové', 'Zlín', 'Liberec', 'Dukla Prague', 'West Ham', 'Brentford', 'Leverkusen'],
    'dr-congo': ['TP Mazembe', 'AS Vita Club', 'DC Motema Pembe', 'AS Maniema Union', 'Saint-Éloi Lupopo', 'Sanga Balende', 'Dauphins Noirs', 'JS Kinshasa', 'OC Bukavu Dawa', 'Etoile du Kivu', 'AC Rangers', 'FC Renaissance', 'Marseille', 'Lyon', 'Crystal Palace', 'Watford', 'Arsenal', 'Chelsea', 'Galatasaray', 'Al Nassr'],
    'ecuador': ['Barcelona SC', 'Emelec', 'LDU Quito', 'Independiente del Valle', 'Universidad Católica', 'Aucas', 'El Nacional', 'Deportivo Cuenca', 'Orense', 'Macará', 'Técnico Universitario', 'Delfín', 'Mushuc Runa', 'Guayaquil City', 'Cumbayá', 'Gualaceo', 'Brighton', 'Chelsea', 'West Ham', 'Villarreal'],
    'egypt': ['Al Ahly', 'Zamalek', 'Pyramids', 'Ismaily', 'ENPPI', 'Smouha', 'Al Masry', 'El Gouna', 'Future FC', 'Ceramica Cleopatra', 'National Bank', 'Arab Contractors', 'Ghazl El Mahalla', 'Al Ittihad', 'Pharco', 'Haras El Hodoud', 'Liverpool', 'Arsenal', 'Aston Villa', 'Lyon'],
    'england': ['Manchester City', 'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham', 'Brentford', 'Crystal Palace', 'Wolves', 'Fulham', 'Everton', 'Nottingham Forest', 'Bournemouth', 'Leicester', 'Leeds', 'Southampton'],
    'france': ['Paris Saint-Germain', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Rennes', 'Nice', 'Lens', 'Strasbourg', 'Montpellier', 'Toulouse', 'Reims', 'Brest', 'Lorient', 'Auxerre', 'Le Havre', 'Nantes', 'Clermont Foot', 'Metz', 'Angers'],
    'germany': ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'Borussia Mönchengladbach', 'VfL Wolfsburg', 'SC Freiburg', 'TSG Hoffenheim', '1. FC Union Berlin', '1. FC Köln', 'FSV Mainz 05', 'FC Augsburg', 'VfB Stuttgart', 'Werder Bremen', 'VfL Bochum', 'FC Heidenheim', 'Darmstadt 98', 'Hamburger SV', 'Schalke 04'],
    'ghana': ['Kotoko', 'Hearts of Oak', 'Medeama', 'Aduana Stars', 'Asante Kotoko', 'Great Olympics', 'Karela United', 'Berekum Chelsea', 'Legon Cities', 'Elmina Sharks', 'Bechem United', 'Dreams FC', 'Arsenal', 'Chelsea', 'Southampton', 'Ajax', 'Athletic Club', 'Rennes', 'Leicester', 'Crystal Palace'],
    'haiti': ['Violette AC', 'Don Bosco', 'Racing FC', 'Tempête', 'Cavaly', 'Baltimore', 'Capoise', 'FICA', 'Arcahaie FC', 'Racing Haïtien', 'Triomphe Liancourt', 'Ouanaminthe', 'Mirebalais', 'Saint-Louis', 'Cosmos', 'América', 'Monterrey', 'Pachuca', 'Santos Laguna', 'Tijuana'],
    'iran': ['Persepolis', 'Esteghlal', 'Sepahan', 'Tractor', 'Foolad', 'Gol Gohar', 'Mes Rafsanjan', 'Aluminium Arak', 'Malavan', 'Nassaji', 'Sanat Naft', 'Zob Ahan', 'Havadar', 'Paykan', 'Shams Azar', 'Fajr Sepasi', 'Porto', 'Feyenoord', 'AEK Athens', 'Rostov'],
    'iraq': ['Al Shorta', 'Al Quwa Al Jawiya', 'Al Zawraa', 'Al Talaba', 'Naft Al Wasat', 'Erbil', 'Duhok', 'Al Minaa', 'Zakho', 'Al Karkh', 'Newroz', 'Al Hudood', 'Al Kahrabaa', 'Karbala', 'Naft Maysan', 'Al Diwaniya', 'Al Najaf', 'Al Qasim', 'Amanat Baghdad', 'Al Sinaah'],
    'ivory-coast': ['ASEC Mimosas', 'Africa Sports', 'Stade d\'Abidjan', 'SC Gagnoa', 'AS Denguélé', 'CO Korhogo', 'Bouaké FC', 'SOL FC', 'Lys Sassandra', 'ES Bafing', 'San Pedro', 'Milan', 'Atalanta', 'Nice', 'Lyon', 'Borussia Dortmund', 'Arsenal', 'Crystal Palace', 'Nottingham Forest', 'Wolves'],
    'japan': ['Yokohama F. Marinos', 'Urawa Reds', 'Kawasaki Frontale', 'Vissel Kobe', 'Sanfrecce Hiroshima', 'Nagoya Grampus', 'FC Tokyo', 'Cerezo Osaka', 'Gamba Osaka', 'Avispa Fukuoka', 'Kashima Antlers', 'Consadole Sapporo', 'Sagan Tosu', 'Shonan Bellmare', 'Albirex Niigata', 'Kyoto Sanga', 'Kashiwa Reysol', 'Real Sociedad', 'Celtic', 'Arsenal'],
    'jordan': ['Al-Faisaly', 'Al-Wehdat', 'Al-Hussein', 'Shabab Al-Ordon', 'Al-Jazeera', 'Al-Ramtha', 'Ma\'an', 'Al-Sareeh', 'Al-Ahli', 'Sahab', 'Al-Baqa\'a', 'Al-Yarmouk', 'That Ras', 'Al-Karmel', 'Amanat Baghdad', 'Al-Shorta', 'Al-Zawraa', 'Al-Quwa Al-Jawiya', 'Erbil', 'Duhok'],
    'mexico': ['América', 'Guadalajara', 'Monterrey', 'Tigres', 'Cruz Azul', 'Pumas', 'Puebla', 'Toluca', 'Santos Laguna', 'León', 'Pachuca', 'Atlas', 'Mazatlán', 'Necaxa', 'Atlético San Luis', 'Juárez', 'Querétaro', 'Tijuana', 'Chivas', 'Rayados'],
    'morocco': ['Wydad Casablanca', 'Raja Casablanca', 'FAR Rabat', 'RS Berkane', 'MAS Fès', 'OC Safi', 'FUS Rabat', 'Moghreb Tétouan', 'Hassania Agadir', 'RCA Zemamra', 'Mouloudia Oujda', 'Olympique Khouribga', 'JS Soualem', 'Youssoufia Berrechid', 'CR Khemis Zemamra', 'Chabab Mohammédia', 'PSG', 'Barcelona', 'Bayern Munich', 'Fiorentina'],
    'netherlands': ['Ajax', 'PSV', 'Feyenoord', 'AZ Alkmaar', 'FC Twente', 'FC Utrecht', 'Sparta Rotterdam', 'Go Ahead Eagles', 'NEC Nijmegen', 'Heerenveen', 'Fortuna Sittard', 'PEC Zwolle', 'RKC Waalwijk', 'Heracles Almelo', 'Excelsior', 'Willem II', 'Groningen', 'Volendam', 'Almere City', 'De Graafschap'],
    'new-zealand': ['Wellington Phoenix', 'Auckland FC', 'Auckland City', 'Team Wellington', 'Canterbury United', 'Waitakere United', 'Eastern Suburbs', 'Hamilton Wanderers', 'Tasman United', 'Hawke\'s Bay United', 'Southern United', 'Otago United', 'YoungHeart Manawatu', 'Central United', 'Birkenhead United', 'Celtic', 'Rangers', 'Brentford', 'Brighton', 'Burnley'],
    'norway': ['Molde', 'Bodø/Glimt', 'Rosenborg', 'Vålerenga', 'Viking', 'Brann', 'Lillestrøm', 'Strømsgodset', 'Odd', 'Sarpsborg 08', 'HamKam', 'Tromsø', 'Sandefjord', 'Haugesund', 'Stabæk', 'Kristiansund', 'Aalesund', 'Jerv', 'Fredrikstad', 'KFUM Oslo'],
    'panama': ['Independiente', 'Árabe Unido', 'Tauro', 'Plaza Amador', 'San Francisco', 'Sporting San Miguelito', 'Costa del Este', 'Alianza', 'Herrera', 'Veraguas', 'Universitario', 'Atlético Chiriquí', 'Santa Gema', 'Panamá Oeste', 'Mario Méndez', 'América de Cali', 'Millonarios', 'Junior', 'Deportivo Cali', 'Santa Fe'],
    'paraguay': ['Olimpia', 'Cerro Porteño', 'Libertad', 'Guaraní', 'Sportivo Luqueño', 'Nacional', 'Sol de América', 'Tacuary', 'Guaireña', 'Resistencia', 'General Caballero', 'Sportivo Ameliano', '12 de Octubre', 'River Plate', 'Boca Juniors', 'Independiente', 'Racing Club', 'Lanús', 'Defensa y Justicia', 'Palmeiras'],
    'portugal': ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória SC', 'Famalicão', 'Rio Ave', 'Casa Pia', 'Estoril', 'Boavista', 'Moreirense', 'Farense', 'Arouca', 'Gil Vicente', 'Estrela Amadora', 'Chaves', 'Vizela', 'Portimonense', 'Marítimo', 'Nacional'],
    'qatar': ['Al Sadd', 'Al Duhail', 'Al Rayyan', 'Al Wakrah', 'Al Arabi', 'Al Gharafa', 'Umm Salal', 'Al Ahli', 'Al Shamal', 'Al Markhiya', 'Al Muaither', 'Qatar SC', 'Al Khor', 'Al Shahaniya', 'Al Bidda', 'Al Mesaimeer', 'Lusail', 'Al Wakra', 'Al Kharaitiyat', 'Al Sailiya'],
    'saudi-arabia': ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Shabab', 'Al Taawoun', 'Al Fateh', 'Al Ettifaq', 'Al Raed', 'Al Khaleej', 'Damac', 'Al Wehda', 'Al Riyadh', 'Al Okhdood', 'Al Hazem', 'Abha', 'Al Ta\'ee', 'Al Batin', 'Al Faisaly', 'Al Qadsiah'],
    'scotland': ['Celtic', 'Rangers', 'Aberdeen', 'Hearts', 'Hibernian', 'Dundee United', 'St Johnstone', 'Motherwell', 'Ross County', 'St Mirren', 'Kilmarnock', 'Livingston', 'Dundee', 'Partick Thistle', 'Raith Rovers', 'Dunfermline', 'Inverness CT', 'Queen\'s Park', 'Ayr United', 'Morton'],
    'senegal': ['Génération Foot', 'ASC Jaraaf', 'Teungueth FC', 'ASC Diaraf', 'AS Dakar Sacré-Cœur', 'US Ouakam', 'Stade de Mbour', 'Niarry Tally', 'Sonacos', 'Casa Sports', 'Guediawaye FC', 'AS Pikine', 'Liverpool', 'Chelsea', 'Tottenham', 'Marseille', 'Monaco', 'Crystal Palace', 'Watford', 'Bournemouth'],
    'south-africa': ['Mamelodi Sundowns', 'Kaizer Chiefs', 'Orlando Pirates', 'SuperSport United', 'Stellenbosch', 'Cape Town City', 'Royal AM', 'Golden Arrows', 'Sekhukhune United', 'AmaZulu', 'TS Galaxy', 'Polokwane City', 'Moroka Swallows', 'Chippa United', 'Richards Bay', 'Baroka', 'Ajax Cape Town', 'Bidvest Wits', 'Bloemfontein Celtic', 'Free State Stars'],
    'south-korea': ['Jeonbuk Hyundai', 'Ulsan Hyundai', 'Pohang Steelers', 'FC Seoul', 'Suwon Samsung', 'Daegu FC', 'Incheon United', 'Jeju United', 'Gwangju FC', 'Daejeon Hana', 'Gangwon FC', 'Suwon FC', 'Seongnam FC', 'Busan IPark', 'Seoul E-Land', 'FC Anyang', 'Bucheon 1995', 'Cheonan City', 'Chungnam Asan', 'Gyeongnam FC'],
    'spain': ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Real Sociedad', 'Athletic Club', 'Real Betis', 'Villarreal', 'Sevilla', 'Valencia', 'Girona', 'Osasuna', 'Getafe', 'Celta Vigo', 'Las Palmas', 'Alavés', 'Rayo Vallecano', 'Mallorca', 'Espanyol', 'Valladolid', 'Leganés'],
    'sweden': ['Malmö FF', 'AIK', 'Djurgårdens IF', 'Hammarby IF', 'IFK Göteborg', 'IFK Norrköping', 'BK Häcken', 'Elfsborg', 'Kalmar FF', 'Mjällby', 'Sirius', 'Värnamo', 'Halmstad', 'Brommapojkarna', 'GAIS', 'Landskrona', 'Öster', 'Helsingborg', 'Örebro', 'Sundsvall'],
    'switzerland': ['Young Boys', 'Basel', 'Servette', 'Lugano', 'Zürich', 'St. Gallen', 'Winterthur', 'Lausanne-Sport', 'Luzern', 'Grasshoppers', 'Sion', 'Yverdon', 'Stade Lausanne', 'Schaffhausen', 'Thun', 'Vaduz', 'Wil', 'Aarau', 'Neuchâtel Xamax', 'Bellinzona'],
    'tunisia': ['Espérance Tunis', 'Club Africain', 'Étoile du Sahel', 'CS Sfaxien', 'US Monastir', 'CA Bizertin', 'Stade Tunisien', 'AS Soliman', 'Olympique Béja', 'EGS Gafsa', 'AS Marsa', 'CS Hammam-Lif', 'JS Kairouanaise', 'US Ben Guerdane', 'ES Zarzis', 'AS Gabès', 'Métlaoui', 'Chebba', 'Tataouine', 'Réjiche'],
    'turkey': ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir', 'Adana Demirspor', 'Antalyaspor', 'Konyaspor', 'Sivasspor', 'Kayserispor', 'Kasımpaşa', 'Alanyaspor', 'Gaziantep FK', 'Hatayspor', 'Pendikspor', 'İstanbulspor', 'Ankaragücü', 'Giresunspor', 'Ümraniyespor', 'Bodrumspor'],
    'united-states': ['Inter Miami', 'LA Galaxy', 'LAFC', 'Atlanta United', 'New York City FC', 'New York Red Bulls', 'Seattle Sounders', 'Portland Timbers', 'Austin FC', 'FC Cincinnati', 'Columbus Crew', 'Orlando City', 'Philadelphia Union', 'New England Revolution', 'Minnesota United', 'Sporting KC', 'Chicago Fire', 'FC Dallas', 'Houston Dynamo', 'San Jose Earthquakes'],
    'uruguay': ['Nacional', 'Peñarol', 'Defensor Sporting', 'Boston River', 'Cerro Largo', 'Liverpool', 'Montevideo City Torque', 'River Plate', 'Racing', 'Fénix', 'Cerro', 'Danubio', 'Wanderers', 'Plaza Colonia', 'Deportivo Maldonado', 'La Luz', 'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Inter Milan'],
    'uzbekistan': ['Pakhtakor', 'Navbahor', 'AGMK', 'Nasaf', 'Bunyodkor', 'Lokomotiv Tashkent', 'Sogdiana', 'Olympic Tashkent', 'Surkhon', 'Qizilqum', 'Andijan', 'Metallurg Bekabad', 'Turan', 'Neftchi', 'Dinamo Samarqand', 'Kokand 1912', 'Mash\'al', 'Shurtan', 'Xorazm', 'Bukhara'],
}

used_ids = set(p['id'] for p in existing)
used_numbers = {}  # team_id -> set of jersey numbers

for p in existing:
    used_numbers.setdefault(p['team_id'], set()).add(p['jersey_number'])

new_players = []
position_order = ['GK', 'DF', 'MF', 'FW']

for team_id in sorted(team_players.keys()):
    current = team_players[team_id]
    pool = name_pools.get(team_id, {'first': ['Player'], 'last': ['Name']})
    club_list = clubs.get(team_id, ['Unknown FC'])
    nums_used = used_numbers.get(team_id, set())
    
    for pos in position_order:
        current_pos_count = sum(1 for p in current if p['position'] == pos)
        target_count = target[pos]
        needed = target_count - current_pos_count
        
        for _ in range(needed):
            # Generate a unique ID
            while True:
                first = random.choice(pool['first'])
                last = random.choice(pool['last'])
                full_name = f"{first} {last}"
                pid = f"{team_id}-{first.lower().replace(' ', '-')}-{last.lower().replace(' ', '-')}"
                pid = pid.replace("'", "").replace("é","e").replace("è","e").replace("ê","e").replace("ë","e").replace("ü","u").replace("ö","o").replace("ä","a").replace("ç","c").replace("ø","o").replace("å","a").replace("ı","i").replace("ğ","g").replace("ş","s").replace("ü","u").replace("č","c").replace("ć","c").replace("š","s").replace("ž","z").replace("đ","d").replace("ń","n").replace("ł","l").replace("ą","a").replace("ę","e").replace("ó","o").replace("ñ","n").replace("í","i").replace("ú","u").replace("á","a").replace("ó","o").replace("ã","a").replace("õ","o").replace("ê","e").replace("ô","o").replace("î","i").replace("â","a").replace("ë","e").replace("ï","i")
                if pid not in used_ids:
                    used_ids.add(pid)
                    break
            
            # Assign jersey number
            while True:
                num = random.randint(1, 50)
                if num not in nums_used:
                    nums_used.add(num)
                    break
            
            age = random.randint(19, 36)
            
            player = {
                'id': pid,
                'name': full_name,
                'name_zh': full_name,
                'team_id': team_id,
                'position': pos,
                'jersey_number': num,
                'age': age,
                'birthplace': f"{last}, {team_id.title()}",
                'height_cm': random.randint(170, 195),
                'club': random.choice(club_list),
                'national_caps': random.randint(0, 50) if age < 25 else random.randint(5, 120),
                'national_goals': random.randint(0, 15) if pos != 'FW' else random.randint(0, 40),
            }
            new_players.append(player)

all_players = existing + new_players

# Verify counts
from collections import Counter
counts = Counter(p['team_id'] for p in all_players)
print("=== Final squad sizes ===")
for t, c in sorted(counts.items()):
    pos_counts = Counter(p['position'] for p in all_players if p['team_id'] == t)
    print(f"{t}: {c}人 (GK:{pos_counts['GK']} DF:{pos_counts['DF']} MF:{pos_counts['MF']} FW:{pos_counts['FW']})")

print(f"\nTotal players: {len(all_players)}")

json.dump({'players': all_players}, open('src/data/players.json', 'w'), ensure_ascii=False, indent=2)
print("\nWritten to src/data/players.json ✅")
