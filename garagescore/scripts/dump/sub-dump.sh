# dump only data of a specific time window
source .env
export LC_ALL=C
MONGO_URI=mongodb://$MONGO_USER:$MONGO_PWD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB

if [ -z "$1" ]
  then
    echo "please give 2 arguments minDate (included) and maxDate (excluded) (format DD/MM/YYYY)"
    exit
fi
if [ -z "$1" ]
  then
    echo "please give maxDate (excluded) (format DD/MM/YYYY) as a second argument"
    exit
fi
dateMin=$1 # format JJ/MM/AAAA
dateMax=$2 # format JJ/MM/AAAA
# store our variables in a file we will load first
echo "var dateMin='$dateMin'" > tmp_initvar.js
echo "var dateMax='$dateMax'" >> tmp_initvar.js

# create filters
mongo $MONGO_URI  tmp_initvar.js sub-dump.js > tmp_queries.js
# get filters
head -n 6 tmp_queries.js | tail -n 1 > tmp_dataFiles.json
head -n 7 tmp_queries.js | tail -n 1 > tmp_campaigns.json
head -n 8 tmp_queries.js | tail -n 1 > tmp_datas.json
head -n 9 tmp_queries.js | tail -n 1 > tmp_contacts.json
head -n 10 tmp_queries.js | tail -n 1 > tmp_shortUrls.json
cat tmp_dataFiles.json
cat tmp_campaigns.json
cat tmp_datas.json
cat tmp_contacts.json
cat tmp_shortUrls.json
# clean
rm -rf dump
# dump
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump --collection dataFiles --queryFile tmp_dataFiles.json
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump --collection campaigns --queryFile tmp_campaigns.json
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump --collection datas --queryFile tmp_datas.json
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump --collection contacts --queryFile tmp_contacts.json
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump --collection shortUrls --queryFile tmp_shortUrls.json
EXCLUSION=" --excludeCollection=dataFiles"
EXCLUSION="$EXCLUSION --excludeCollection=campaigns"
EXCLUSION="$EXCLUSION --excludeCollection=datas"
EXCLUSION="$EXCLUSION --excludeCollection=contacts"
EXCLUSION="$EXCLUSION --excludeCollection=shortUrls"
# no old collections
EXCLUSION="$EXCLUSION --excludeCollection=Event"
EXCLUSION="$EXCLUSION --excludeCollection=campaignItems"
EXCLUSION="$EXCLUSION --excludeCollection=customers"
EXCLUSION="$EXCLUSION --excludeCollection=dataRecords"
EXCLUSION="$EXCLUSION --excludeCollection=dataRecordsCommentThread"
EXCLUSION="$EXCLUSION --excludeCollection=dataRecordsComment"
EXCLUSION="$EXCLUSION --excludeCollection=dataRecordStatistics"
EXCLUSION="$EXCLUSION --excludeCollection=publicReviews"
EXCLUSION="$EXCLUSION --excludeCollection=surveys"
EXCLUSION="$EXCLUSION --excludeCollection=vehicles"
# no migration data
EXCLUSION="$EXCLUSION --excludeCollection=migration1"
EXCLUSION="$EXCLUSION --excludeCollection=migrationMonitoring"
# no consolidated data
EXCLUSION="$EXCLUSION --excludeCollection=garageHistories"
EXCLUSION="$EXCLUSION --excludeCollection=consolidatedGaragesStatistic"
mongodump --username $MONGO_USER --password $MONGO_PWD --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out dump $EXCLUSION
#compress
FILE="$dateMin-$dateMax-dump.tar.gz"
FILE=${FILE////-}
tar -zcvf "/tmp/$FILE" dump
aws s3 cp /tmp/$FILE s3://mlab.db.backups
echo "Dump available on https://console.aws.amazon.com/s3/buckets/mlab.db.backups//$FILE"
# clean
rm -rf dump
rm -f tmp*
rm /tmp/$FILE

