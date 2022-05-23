/**
 * Script Robot3T pour ajouter manuellement les numéros sur la facture d'OVH sans faire de duplications !
 */
const startingPhone = '0033285522890'; // téléphone de départ, fini en 0 normalement !
const test = db.getCollection('phoneBucket').find({}).toArray();
for (let i = 0; i < 10; i++) {
  let newPhoneNumber = startingPhone.replace(/[0-9]$/, i);
  if (test.find((p) => p.value === newPhoneNumber)) print('Number ' + newPhoneNumber + ' already in the bucket !');
  else {
    print('Adding ' + newPhoneNumber + '...');
    const mongoPhone = {
      value: newPhoneNumber,
      status: 'Available',
      area: newPhoneNumber.slice(4, 5), // 0033[1]83626272...
      countryCode: newPhoneNumber.slice(0, 4), // [0033]183626272...
      createdAt: new ISODate(),
      updatedAt: new ISODate(),
    };
    db.getCollection('phoneBucket').save(mongoPhone);
  }
}
