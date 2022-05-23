#!/usr/bin/env bash

usage(){
    echo "->>>>>> usage: extract.sh -p mongopassword -t 2018-month09"
    echo "_________________________________DESCRIPTION________________________________________"
    echo "If today is 01/10/2018, we are between 01 and 10, then you need to manually generate the last month history like that:"
    echo "$> heroku run --app garagescore node scripts/maintenance/garage-history/reset-history-for-period.js --period-id 2018-month09"
    echo "Delete it after the extraction : db.garageHistories.deleteMany({ periodToken: '2018-month09'})"
    echo "_____________________________________END____________________________________________"
}
if [ "$1" == "" ]; then
  usage
  exit 1
fi
while [ "$1" != "" ]; do
    case $1 in
        -t | --token )          shift
                                token=$1
                                ;;
        -p | --pass )           shift
                                pass=$1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done
if [ "$pass" == "" ]  || [ "$token" == "" ]; then
  usage
  exit 1
fi
mongoexport --type=csv -h ds051234-a1.mongolab.com:51234 -d heroku_6jk0qvwj -u user_57myy34x -p "$pass" -c garageHistories -q '{ periodToken: "'$token'" }' -f garageId,garagePublicDisplayName,countSurveysResponded,countReceivedSurveys,countScheduledContacts --out "$token-history.csv"
