INIT
db.getCollection('billingAccounts').updateMany({}, {$set: {billingType: 'Prélèvement SEPA à date de facture'}})
db.getCollection('billingAccounts').updateMany({ billingDate: { $lt: 11 } }, {$set: {billingDate: 11}})
db.getCollection('automaticBillingSubscriptions').updateMany({}, {$set: {subUsers.included': 3,'subUsers.price': 2.5}})
db.getCollection('automaticBillingSubscriptions').updateMany({'annex.enabled': true, 'annex.garageId': null}, {$set: {'annex.enabled': false}})

RESET
db.getCollection('billingAccounts').updateMany({}, {$set: {invoices: null, sentLastAt: null}})
db.getCollection('garages').updateMany({'subscriptions.setup.enabled': true}, { $set: { 'subscriptions.setup.alreadyBilled': false} })
db.getCollection('garages').updateMany({'subscriptions.setup.enabled': true, 'subscriptions.setup.billDate': {$gte: new ISODate('2019-05-01T00:00:00Z'), $lte: new ISODate('2019-06-01T00:00:00Z')}}, { $set: { 'subscriptions.setup.alreadyBilled': false} })
db.getCollection('billingAccounts').find({}).forEach((e) => {
    if (e.invoices) {
        e.invoices = e.invoices.filter((i) => {
            return !i.createdAt.includes('DATE A RENTRER ICI EXEMPLE 2019-09')
        })
    }
    db.getCollection('billingAccounts').updateOne({_id: e._id}, {$set: {invoices: e.invoices, sentLastAt: null}})
})



COMMANDE EXEMPLE PR GENERER LE MOIS DE JUILLET
heroku run -a garagescore node scripts/cron/automatic-billing/automatic-billing-vosfactures --force --fullMonth --month=7 --size=performance-m

INFOS
db.getCollection('garages').find({'subscriptions.setup.billDate': { $exists: true }}, {_id: 1, 'subscriptions.setup.price': 1, 'subscriptions.setup.enabled': 1, createdAt: 1, slug: 1, publicDisplayName: 1, 'subscriptions.setup.billDate': 1, 'subscriptions.dateStart': 1}).toArray().forEach((e) => {
    var billdate = ''
    if (e.subscriptions.setup && e.subscriptions.setup.enabled) {
        billdate = new Date(e.subscriptions.setup.billDate)
        billdate = billdate.getDate() + '-' + (billdate.getMonth() + 1) + '-' + billdate.getFullYear()
        print(e._id.toString().substring(10, 34) + ';' + e.publicDisplayName + ';' + billdate + ';' + (e.subscriptions.setup && e.subscriptions.setup.price) + ';' + e.createdAt)
    }

})

db.getCollection('garages').find({}, {_id: 1, 'subscriptions.Analytics': 1, 'subscriptions.Coaching': 1, 'subscriptions.Connect': 1, 'subscriptions.VehicleInspection': 1, 'subscriptions.EReputation': 1, 'subscriptions.Lead': 1, 'subscriptions.UsedVehicleSale': 1, 'subscriptions.NewVehicleSale': 1, 'subscriptions.Maintenance': 1, 'subscriptions.active': 1, 'subscriptions.users.price': 1, 'subscriptions.contacts.price': 1}).toArray().forEach((e) => {
    let contacts = ''
    let users = '';
    let abos = '';
    if (e.subscriptions.active) {
        users = e.subscriptions.users.price;
        contacts = e.subscriptions.contacts.price;
        abos = 0;
        if (e.subscriptions.Maintenance.enabled) {
            abos += e.subscriptions.Maintenance.price;
        }
        if (e.subscriptions.Analytics.enabled) {
            abos += e.subscriptions.Analytics.price;
        }
        if (e.subscriptions.Coaching.enabled) {
            abos += e.subscriptions.Coaching.price;
        }
        if (e.subscriptions.Connect.enabled) {
            abos += e.subscriptions.Connect.price;
        }
        if (e.subscriptions.VehicleInspection.enabled) {
            abos += e.subscriptions.VehicleInspection.price;
        }
        if (e.subscriptions.EReputation.enabled) {
            abos += e.subscriptions.EReputation.price;
        }
        if (e.subscriptions.Lead.enabled) {
            abos += e.subscriptions.Lead.price;
        }
        if (e.subscriptions.UsedVehicleSale.enabled) {
            abos += e.subscriptions.UsedVehicleSale.price;
        }
        if (e.subscriptions.NewVehicleSale.enabled) {
            abos += e.subscriptions.NewVehicleSale.price;
        }
    }
    print(e._id.toString().substring(10, 34) + ';' + contacts + ';' + users + ';' + abos)
})

// MONGO GET THE WEIRD ONES FROM THE DEBUG ARRAY (1848)
var weirdOnes = [];
db.getCollection('billingAccounts').find({accountingId: {$in: ['Herber-Forbach', 'old', 'Pga-AbcisBretagneMorlaix', 'GarageDuMarais', 'MidiAuto29-Brest', 'ProxAuto', 'ABVV', 'Pga-GrandsGaragesDuBerry', 'Pga-AbcisPicardie', 'Pga-Sovaca', 'Pga-GGP', 'Pga-GambadeAbcisPyrenees', 'Pga-SCAA', 'Pga-AbcisPyrenees', 'Pga-AbcisCentre', 'Pga-GrandsGaragesBiterrois', 'ClerfondAutomobiles', 'LdAutomobiles', 'MidiAuto-Lorient', 'DoriaAuto-RenaultBastia', 'ValDeSartheAutoSable', 'ValDeSartheAutoLaSuze', 'GarageMichelGeorget', 'ADcarrosserieSable', 'SudEstAutomobiles', 'Pga-ScapGeorget', 'City-Bike', 'HotBikesAprilia', 'Boscary-EMB01', 'toto', 'Groupe-JPV-TDA', 'JPV-MIA', 'JPV-IAM', 'MET-DAVIS-27', 'MET-DAVIS-76', 'MET-DAVIS-28', 'MET-DAVIS-DREUX', 'MET-DAVIS-DIEPPE', 'MET-DAVIS-MONGAZONS', 'MET-DAVIS-78', 'MET-ESPACE-DAVIS', 'Helice Moto old', 'GaragePetillot', 'Pasquinelli', 'BauerParis', 'DBauto59', 'Guillet-MontceauChalon', 'HarleyDavidsonLimoges', 'AutomobileDuVal', 'Gema-LeCannet', 'Gema-Grasse', 'RoadStar92', 'Bodemer-Guingamp', 'Auto-France-Neuilly', 'GasquetEtFils', 'Delieuvin-MFA', 'DynamismAutomobiles', 'ConcessionAuto-Charrier', 'RelaisDeChampagne-KiaLaon', 'RelaisDeChampagne-KiaSoissons', 'CentralAutos-CentralMotor', 'CentralAutos-CentralAutos', 'MichelBazin', 'Pga-SCAduPoitou', 'MoucherotteAuto', 'Daumont-RenaultGuibeville', 'AZauto-RenaultEtrechy', 'EbhAutomobiles', 'szs', 'GCA-GcfRennes', 'RobuchonAuto', 'GCA-GcaAvranches', 'GCA-GcaCherbourg', 'GarageCivetSA', 'BastyAuto-Beauce', 'GarageRocadeSud', 'HondaStarBike', 'Pga-OpelOreda', 'PresquileAuto', 'Brun', 'Guilmault-Sadac', 'Guilmault-Leroux', 'Guilmault-AutomobilesJLG', '87665443566', 'Cousty_old', 'RC Automobiles_old', 'Mannes-FranceLyon', 'Pga-RobertBel', 'Peyrot-LaudisMontauban', 'Peyrot-DominiqueDidier', 'BargeAutomobiles', 'DanielMoutonSA', 'DanielMoutonStMalo', 'RRG-CarrosserieCharonne', 'RRG-Charenton', 'RRG-Montreuil', 'RRG-SaintCloud', 'RRG-Clamart', 'RRG-Boulogne', 'RRG-Maurepas', 'RRG-Plaisir', 'RRG-Trappes', 'Carepolis-RedlineMotor', 'LaSuzeAuto', 'BeaulieuAutoServices', 'MercierSAS', 'MidiAuto29-Quimper', 'EspaceBienvenue', 'GarageTerrien', 'GarageMetropole', 'SargeAutomobiles', 'Gdauto', 'PoleMotoLimoges2', 'PoleMotoLimoges3', 'Nedelec-Chateaulin', 'Techstar-Meaux', 'Techstar-Savia', 'Fahy-Francheville', 'Fahy-StChamond', 'NCLautomobiles', 'GarageMaziarski', 'Dugardin-FirstInfiniti', 'Bouttier-PhizicarSarl', 'MyVoiture', 'Cachia-BretagneAuto', 'Techstar-ValEurope', 'SudEstMotos', 'Pga-TourismeAuto', 'VaillantAuto', 'VineuilAuto', 'StChristophe-Laxou', 'StChristophe-Sarrebourg', 'Marty-AutosSetam82', 'PgaMotors-Safi', 'StChristophe-ChateauThierry', 'StChristophe-ASD', 'GroupeStChristophe', 'Guez-CazauxAuto', 'Lebaudy-AmbianceAutoFlers', 'PgaMotors-AutovaleBleu', 'PgaMotors-StVaast', 'PgaMotors-ValenciennesAuto', 'PgaMotors-PatyAuto', 'PgaMotors-LallainLievin', 'PgaMotors-CroisetteAuto', 'PgaMotors-LallainNoyelles', 'DormoyFreres', 'Berbiguier-PremiumAuto', 'ByMyCar-Voiron', 'ByMyCar-Venissieux', 'DarmonAyache-Automotiv', 'Grim-Saval', 'Maurin-GarageDuLac', 'Maurin-SasVagneur', 'Techstar-Rivery', 'Simonneau-ScacAuto', 'PSAretail', 'Hory-MidiAuto28', 'MidiAutoChartres', 'FranceAuto-Korepaka', 'Deffeuille-Soreca', 'Guillet-ChalonAuto', 'PGA-TourraineAuto', 'RRG-LeMans', 'RRG-Angers', 'RRG-Chinon', 'RRG-Saran', 'AuvergneAuto', 'Nedey-Montbeliard', 'Nedey-Belfort', 'CarosserieFonseca', 'Bodemer-Alencon', 'Bodemer-Cherbourg', 'SimonneauAuto', 'Simonneau-EtsCosne', 'Rouyer-ChamberyAutoTeste', 'Rouyer-ChamberyAutoLormont', 'Rouyer-ChamberyAutoArveyres', 'Rouyer-ChamberyAutoMerignac', 'Rouyer-OuestAutomobiles', 'GarageDesmerger', 'Gemy-StBrieuc', 'EtoileDuMaine-Dauphine27', 'bernier', 'This-Angers', 'BrieDesNations-Nissan', 'Covalux', 'Faurie-AudiBrive', 'Faurie-VolkswagenBrive', 'Faurie-VolkswagenTulle', 'GarageLouedec', 'GabrielTissedre-Gtauto', 'Lepelletier', 'Pga-VwAudi', 'ComptesTest', 'Gibaud-RenaultChateauroux', 'SLUG', 'Warsemann', 'DMD ford brest et quimper', 'GaragePetitSas', 'AmetysMotoService', 'Motoextreme', 'AccesAutomobiles', 'Cavallari SARL', 'Cavallari-NiceVolvoKia', 'EtoileDuMaine-Dauphine27bis', 'HD-Legende76', 'GROUPE-PAUTRIC-BAYERN-AVENUE', 'fiatneuillysurMarne', 'EvenParcAutoAD', 'JPV-CASA', 'Groupe Peyrot', 'GarrijersonAlcaladeGuadaira', 'LAUDIS-GROUPE PEYROT', 'Delesalle-Dugardin 1', 'TarracoCenter', 'GrupoCatsa', 'GrupoNucesa', 'Autoprima', 'PLD seat skoda']}}).forEach((b) => {
    for (let i = 0; i < b.garageIds.length; i++) {
        const garage = db.getCollection('garages').find({_id: b.garageIds[i]}, {'subscriptions.active': true}).next();
        if (garage && garage.subscriptions && garage.subscriptions.active) {
            weirdOnes.push(b._id);
        }
    }
})
print(weirdOnes);

//MONGO GET THE BILLINGACCOUNT LIST
db.getCollection('billingAccounts').find({}).forEach((b) => {
    let garageIds = '';
    if (b.garageIds) b.garageIds.forEach((g) =>
        {
           garageIds += g + ' - ';
        })
    print(b._id + ';' + b.email + ';' + b.companyName + ';' + b.address + ';' + b.postalCode + ';' + b.city + ';' + garageIds)
});

db.getCollection('billingAccounts').find({}).forEach((b) => {
  let garageIds = '';
  if (b.garageIds) b.garageIds.forEach((g) =>
    {
    let garage = db.getCollection('garages').find({_id: g}, {_id: true, performerId: true, bizDevId: true}).toArray();
    garage = garage[0];
    print(b._id + ';' + b.name + ';' + b.companyName + ';' + b.accountingId + ';' + b.city + ';' + garage._id + ';' + garage.performerId + ';' + garage.bizDevId);
    }
  )
});

// raise price of selected garages by 3%

let garageIds21 = [ ObjectId("58de107cd6018e1a004e2550"),
ObjectId("5b080e2edebfb70013f9bf89"),
ObjectId("5afd840ca562d500138bd72c"),
ObjectId("5a82a49d31062400137e8d2b") ]

const requests = [];
db.getCollection('garages').find({_id: {$in: garageIds43}}, {_id: true, subscriptions: true}).forEach((g) => {
    if (g.subscriptions) {
        const keys = Object.keys(g.subscriptions);
        keys.forEach((key) => {
            if (key === 'Maintenance'
             || key === 'NewVehicleSale'
             || key === 'UsedVehicleSale'
             || key === 'VehicleInspection'
             || key === 'Lead'
             || key === 'EReputation'
             || key === 'Analytics'
             || key === 'Coaching'
             || key === 'Connect'
             || key === 'Escalation'
             || key === 'users'
             || key === 'contacts') {
                 if (g.subscriptions[key].price) {
                     g.subscriptions[key].price = Math.round(g.subscriptions[key].price * 103) / 100
                 }
             }
        });
        requests.push({ updateOne: { filter: {'_id': g._id}, update: { '$set': { 'subscriptions': g.subscriptions }}}})
    }
})

db.getCollection('garages').bulkWrite(requests);

// change Erep price from 1 to 19

let garageIds21 = [ ObjectId("58de107cd6018e1a004e2550"),
ObjectId("5b080e2edebfb70013f9bf89"),
ObjectId("5afd840ca562d500138bd72c"),
ObjectId("5a82a49d31062400137e8d2b") ]

db.getCollection('garages').find({_id: {$in: garageIds21}}, {_id: true, subscriptions: true}).forEach((g) => {
    if (g.subscriptions && g.subscriptions.EReputation && g.subscriptions.EReputation.price) {
         db.getCollection('garages').updateOne({'_id': g._id}, { '$set': { 'subscriptions.EReputation.price': 29 }});
    }
})

// Change specifically abo

ObjectId("589991a27c1d911a004327f8"),
...
ObjectId("5c8f9f707b345e0015f8b1a0")
];

let values = [ 29.00,
29.00,
...
67.10
];
const requests = [];
db.getCollection('garages').find({_id: {$in: garageIds5011}}, {_id: true, subscriptions: true}).forEach((g) => {
    const index = garageIds5011.findIndex((e) => e.valueOf() === g._id.valueOf());
    if (g.subscriptions && index !== -1 && index < values.length) {
        const keys = Object.keys(g.subscriptions);
        let found = false;
        keys.forEach((key) => {
            if (!found) {
                if (key === 'Maintenance'
                 || key === 'NewVehicleSale'
                 || key === 'UsedVehicleSale'
                 || key === 'VehicleInspection'
                 || key === 'Lead'
                 || key === 'EReputation'
                 || key === 'Analytics'
                 || key === 'Coaching'
                 || key === 'Connect'
                 || key === 'Escalation') {
                     if (g.subscriptions[key].price && g.subscriptions[key].enabled) {
                         const textKey = `subscriptions.${key}.price`
                         requests.push({ updateOne: { filter: {'_id': g._id}, update: { '$set': { [textKey]: values[index] }}}})
                     }
                 }
            }
        });

    }
})

db.getCollection('garages').bulkWrite(requests);

//
