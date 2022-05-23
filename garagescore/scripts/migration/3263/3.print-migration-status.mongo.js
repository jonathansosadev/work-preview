/**
 * Affiche l'état de complétion de la migration
 * */
print(
  db.getCollection('tmpFixCustomers').count({ status: 'COMPLETE' }) + '/' + db.getCollection('tmpFixCustomers').count()
);
