# Sync collections from prod or morty to our localhost db
# Usage:
# python import-collection-from-atlas.py --help
# by default: sync your local with morty

import os, re, sys, getopt

hostprod = "atlas-jgvwe2-shard-0/heroku-6jk0qvwj-shard-00-01.r1p0d.mongodb.net:27017,heroku-6jk0qvwj-shard-00-01.r1p0d.mongodb.net:27017,heroku-6jk0qvwj-shard-00-02.r1p0d.mongodb.net:27017"
hostreview = "atlas-126yvp-shard-0/morty-shard-00-00.pdh4w.mongodb.net:27017,morty-shard-00-01.pdh4w.mongodb.net:27017,morty-shard-00-02.pdh4w.mongodb.net:27017"

onlycollection = None
stage = "MORTY"
localdb = "garagescore"
localport = "27017"
useheroku = False

try:
    argumentList = sys.argv[1:]
    options = [""]
    long_options = ["help","stage=", "collection=", "localdb=", "localport=", "useheroku"]
    arguments, values = getopt.getopt(argumentList, options, long_options)
     
    # checking each argument
    for currentArgument, currentValue in arguments:
 
        if currentArgument in ("-h", "--help"):
            print ("Sync your local DB with Atlas data, usage:")
            print ("--stage: PROD or MORTY (default: MORTY)")
            print ("--collection: only sync one collection (default: none)")
            print ("--localdb: local port (default: garagescore)")
            print ("--localport: local port (default: 27017)")
            print ("--useheroku: ask the user to directly input the db uri instead of using heroku")
            exit()
        elif currentArgument in ("--stage"):
            stage = currentValue
            if(stage != "MORTY" and stage != "PROD"):
                print("stage can only be PROD or MORTY")
                exit()
        elif currentArgument in ("--collection"):
            onlycollection = currentValue
        elif currentArgument in ("--localdb"):
            localdb = currentValue
        elif currentArgument in ("--localport"):
            localport = currentValue
        elif currentArgument in ("--useheroku"):
            useheroku = True
             
except getopt.error as err:
    print (str(err))
    exit()

print("Importing from "+stage)

def syncCollection(collection, host, db, user, pwd):
    # choose heroku app and atlas hosts
    if(collection == "data_partial" and stage == "PROD"):
        print("PROD has no data_partial")
        exit()
    # dump and restore
    dump = 'mongodump -h "{host}" -d {db} -u {user} -p "{pwd}" --authenticationDatabase admin --ssl -c {collection}'.format(host=host, db=db, user=user, pwd=pwd, collection=collection)
    cmd = '{dump} --archive | mongorestore --drop --archive --nsFrom=heroku_6jk0qvwj.{collection} --nsTo={localdb}.{collection} --port={localport}'.format(dump=dump, collection=collection, localdb=localdb, localport=localport)
    print(cmd)
    os.popen(cmd)
    if(collection=="datas_partial"):
        cmd1 = 'mongo {localdb} -p {localport} --eval "db.datas.renameCollection(\'datas_old\')"'.format(localdb=localdb, localport=localport)
        cmd2 = 'mongo {localdb} -p {localport} --eval "db.datas_partial.renameCollection(\'datas\')"'.format(localdb=localdb, localport=localport)
        print(cmd1)
        print(cmd2)
        os.popen(cmd1)
        os.popen(cmd2)


host = hostreview
uri = ""
if useheroku:
    heroku = "next-garagescore DB_ENV_MORTY_URI"
    if stage == 'PROD':
        host = hostprod
        heroku = "garagescore DB_ENV_PROD_URI"
    # get user and password from heroku
    stream = os.popen('heroku config:get -a ' + heroku)
    uri = stream.read()
else :
    uri = input("Enter remote mongodb uri (format: mongodb+srv://user:pwd@host):\n")

search = re.search(r'^.*//(.*):(.*)@(.*)/(.*)\?.*$', uri)

user = search.group(1)
pwd = search.group(2)
db = search.group(4)
if onlycollection == None:
    collections = ["garages", "User", "kpiByPeriod", "garageHistories", "automationCampaign", "automationCampaignsEvents", "customers", "incomingCrossLeads", "campaignScenarios"]
    if stage == 'PROD':
        collections.append("datas")
    if stage == 'MORTY':
        collections.append("datas_partial")
    for collections in collections:
        syncCollection(collections, host, db, user, pwd)
else:
    syncCollection(onlycollection, host, db, user, pwd)
