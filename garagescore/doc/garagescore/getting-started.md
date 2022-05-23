# GETTING STARTED


# Pré requis :

* GarageScore fonctionne grâce à une application qui repose sur plusieurs autres composants :  
	* [NodeJs (LTS v12)](https://nodejs.org) 
	* le framework [LoopBack (v2)](https://loopback.io/doc/en/lb2/)
	* une API REST
	* une API GraphQL
	* un ensemble de scripts [python (2.7)](https://www.python.org/downloads/)
	* une connexion  à un serveur [Redis (v4)](https://redis.io/)  pour assurer l'authentification des utilisateurs GarageScore
	* une connexion  un  serveur [MongoDB (v4.2)](https://www.mongodb.org/) 
	* [GIT](https://git-scm.com/downloads) comme logiciel de versioning
  
NB: Sous Windows, c'est vraiment compliqué d'installer Redis car il est pas prévu pour. MongoDB n'est pas supporté sur WSL (Linux inside Windows)

## I/ Le code source

1) Après avoir téléchargé et installé GIT lancer cette commande :  
**git clone https://github.com/garagescore/garagescore.git**

2) Ouvrir le dossier "garagescore"
3) Lancez la commande "npm install" **(pour les utilisateurs windows merci de ne pas tenir compte de l'erreur qui s'affichera après l'installation des modules)**
4) Dupliquez le fichier "config/oussama.js" dans un nouveau fichier dans le dossier "config". Renommez le selon nom de votre HOSTNAME pour le cas "LAPTOP-SD3M659H" par exemple, créer le fichier "config/LAPTOP-SD3M659H.js" (vous pouvez changer les numéros de téléphones et mails par les votres si vous le souhaitez).
5) Copiez coller les fichiers "./git-hooks/pre-commit" "./git-hooks/pre-push" dans le dossier "./.git/hooks"
5) Pour finir copiez coller le texte ci-dessous et placez le dans la racine du dépôt sous le nom de fichier **".env"** .  
```
DEBUG=garagescore:*
AWS_ACCESS_KEY_ID=##
AWS_SECRET_ACCESS_KEY=###
POSTGRES_ENV=LOCAL
POSTGRES_LOCAL_URI=postgres://localhost/garagescore
BIME_API_ACCESS_TOKEN=###
BIME_API_BASE_URL=https://api.bime.io/v3
DATADOG_API_KEY=###
DATADOG_APP_KEY=###
DEFERRED_ALERTS_DELAY=300
FETCH_ALERT_FREQUENCY=600
ERROR_PAGE_URL=//www.garagescore.com/error.html
GARAGESCORE_COOKIES_SECRET=38qkpfg54zefsmock0dfgs0s0o4dfgsdgfswcscdsfgsdgsdfg1s3d
GARAGESCORE_REDIS_URL='redis://127.0.0.1:6379'
GARAGESCORE_REST_ENDPOINT='http://localhost:3000/api'
GARAGESCORE_SESSION_SECRET=###
GARAGESCORE_SLACK_BOT_API_TOKEN=###
GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL=###
HEROKU_APP_NAME=garagescore
MAILGUN_HOST=localhost
MAILGUN_PORT=3000
MAILGUN_PROTOCOL=http:
MAILGUN_ENDPOINT=/simulators/mailgum/v3
MAILGUN_DOMAIN=###
MAILGUN_SECRET_API_KEY=###
CLOUDAMQP_URL='amqp://ovucjnjs:SEu1m-BF8cSFbEjxfevZwLn7hy8EyzVQ@squirrel.rmq.cloudamqp.com/ovucjnjs'
DO_NO_SEND_EMAIL_ALERTS=true
MAINTENANCE_PAGE_URL=//www.garagescore.com/error.html
MAPBOX_API_TOKEN=####
NEW_RELIC_APP_NAME=garagescore
NEW_RELIC_LICENSE_KEY=####
NEW_RELIC_LOG=stdout
SMSFACTOR_API_HOST=http://smsdoctor.herokuapp.com
SMSFACTOR_API_PASSWORD=###
SMSFACTOR_API_USERNAME=hackers@garagescore.com
NODE_APP_INSTANCE=review
QUERY_MONITORING=true
WWW_URL='http://localhost:3000'
APP_URL='http://localhost:3000'
DB_ENV=LOCAL
DB_ENV_LOCAL_URI='mongodb://localhost:27017/garagescore'
REDIS_URL='redis://127.0.0.1:6379'
TZ='Europe/Paris'
GOOGLE_API_KEY=####
GOOGLE_BACKEND_API_KEY=###
ALLOW_CONFIG_MUTATIONS=true
SURVEY_URL='http://localhost:3000'
GITHUB_API_TOKEN=####
SELECTUP_CRYPTOKEY=####
SELECTUP_ALG=####
GOOGLE_CAPTCHA_SITE_KEY='Demander à Ouss ou JS'
GOOGLE_CAPTCHA_SECRET_KEY='Demander à Ouss ou JS'
```


## II/ La base de donnée

1) Telecharger et installer le serveur [MongoDB](https://www.mongodb.org/) 
   Après installation, si ce n'est déjà fait, créez le dossier /data/db

2) Lancez la commande suivante dans un nouveau terminal :  
:warning: **pour les utilisateurs windows, ajoutez une variable d'environnement pointant vers le dossier MONGODB contenant les commandes généralement "C:\Program Files\MongoDB\Server\3.4\bin"**  
```
mongod
```

3) Il est temps maintenant d'importer la base de données de l'application, pour cela nous allons récupérer une instance de la base récente sur le s3 d'amazon. Accédez à cette [URL](https://console.aws.amazon.com/s3/buckets/mlab.db.backups/mongolab/?region=eu-west-1&tab=overview#) et authentifiez vous.
Ensuite téléchargez l'une des instances compressée au format tgz de la base de données.   
**:warning:Merci de bien veiller à ce que vous récupériez l'instance la plus récente en cliquant sur le filtre "Dernière modification"**

4) Decompressez l'archive dans le dossier [dossier racine]/rs-ds051234_YYYY-MM-DDTXXXXXX.000Z

5) Après l'avoir décompressée, verifiez que voter serveur mongodb est toujours lancé et exécutez cette commande : 
```mongorestore --drop -d garagescore [dossier racine]/rs-ds051234_YYYY-MM-DDTXXXXXX.000Z/heroku_XXXXXXXX```  
**:warning: Merci de bien vérifier que le serveur mongodb est bien lancé et que la commande mongorestore pointe bien vers le répertoire contenant les fichiers BSON**

## III/ Lancer l'application

1) Après la fin de l'import de la base de données lancez le serveur Redis , revenez sur la racine du dépôt git et lancer la commande  
```node server/server.js```  
L'application devrait normalement se lancer :+1:.  
**:warning:Il se pourrait que l'application vous affiche un message d'erreur et crash, si ce cas de figure se produit merci de relancer l'application. Si le problème persiste vérifiez que les serveurs Redis et MongoDB sont bien actif.**
