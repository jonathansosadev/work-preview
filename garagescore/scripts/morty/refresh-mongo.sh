#!/usr/bin/env bash

echo "Starting refresh..."
tarName=$(aws s3 ls s3://mlab.db.backups/mongolab/ | grep `date +%Y-%m-%d -d '1 day ago'` | grep "[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]" | grep -o "rs-ds.*tgz")
echo "We found $tarName backup. Start cp..."
aws s3 cp s3://mlab.db.backups/mongolab/$tarName /tmp
echo "Success! Un-taring it..."
tar -zxvf /tmp/$tarName -C /tmp/
echo "Untar done. Let's mongorestore ! ${tarName::-4}"
mongorestore /tmp/${tarName::-4}/heroku_6jk0qvwj --drop -d garagescore --port 37541 -u heroku -p [PASS]
