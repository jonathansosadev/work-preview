# -*- coding: utf-8 -*-
# args for the api: --key --secret
# args for the yellow pages ftp: --ftp-host --ftp-user --ftp-pass
# args for the time windows --min-day-number --max-day-number
# Fetch from the garagescore api all the reviews created-and-shared or moderated
# between min-day-number (included) and max-day-number (included)
# send them to the yellow pages ftp (put various files: one for each garage (containing the reviews) and one with the list of every garages)

import time
import datetime
import yp_manager
import signature
import sys
import json

sys.path.append("..")
sys.path.append("./lib")
devMode = False


def day_number_to_date(daynumber):
    date = datetime.datetime.fromtimestamp(daynumber * 86400)
    date = date.replace(hour=0, minute=0, second=0)
    return date


def date_to_daynumber(date):
    epoch = datetime.datetime(1970, 1, 1)
    delta_time = int(((date - epoch).total_seconds()) / 86400)
    return delta_time


def datetime_range(start, end, delta):
    current = start
    if not isinstance(delta, datetime.timedelta):
        delta = datetime.timedelta(**delta)
    while current < end:
        yield current
        current += delta


def usage():
    print("usage: yellow_pages.py")
    print("\t[--min-day-number ]")
    print("\t[--max-day-number ]")
    print("\t[--key ]")
    print("\t[--secret ]")
    print("\t[--ftp-host ]")
    print("\t[--ftp-user ]")
    print("\t[--ftp-pass ]")


def get_params():
    args = sys.argv
    i = 0
    today = datetime.datetime.now()
    today = today.replace(hour=0, minute=0, second=0)
    tomorrow = today + datetime.timedelta(days=1)

    minDate = today
    maxDate = tomorrow

    key = ""
    secret = ""
    ftp_host = ""
    ftp_user = ""
    ftp_pass = ""
    help = False

    for arg in args:
        if arg == "--min-day-number":
            minDate = day_number_to_date(int(args[i + 1]))
        if arg == "--max-day-number":
            maxDate = day_number_to_date(int(args[i + 1]))
        if arg == "--key":
            key = args[i + 1]
        if arg == "--secret":
            secret = args[i + 1]
        if arg == "--ftp-host":
            ftp_host = args[i + 1]
        if arg == "--ftp-user":
            ftp_user = args[i + 1]
        if arg == "--ftp-pass":
            ftp_pass = args[i + 1]
        if arg == "--help":
            help = True
        i = i + 1

    if help:
        usage()
        sys.exit()
    if i < 7:
        print("No enough params, for help use --help")
        sys.exit()

    return {
        "minDate": minDate,
        "maxDate": maxDate,
        "key": key,
        "secret": secret,
        "ftp_host": ftp_host,
        "ftp_user": ftp_user,
        "ftp_pass": ftp_pass,
    }


if __name__ == "__main__":
    params = get_params()
    startDate = params["minDate"]
    endDate = params["maxDate"]
    API_KEY = params["key"]
    API_SECRET = params["secret"]
    ftp_host = params["ftp_host"]
    ftp_user = params["ftp_user"]
    ftp_pass = params["ftp_pass"]

    ypManager = yp_manager.YellowPagesManager(
        ftp_host, ftp_user, ftp_pass, {
            "key": API_KEY, "secret": API_SECRET}, devMode
    )

    # Fetch garages that share reviews
    garages = ypManager.sendGarages()

    # Init a dict of reviewsId to delete keyed by businessId
    reviewIdsByBusinessId = dict()
    for garage in garages:
        reviewIdsByBusinessId[garage["businessId"]] = []

    # For every days of the period fetch moderated reviews
    for date in datetime_range(startDate, endDate, {'days': 1, 'hours': 0}):
        print('Fetch Data for :', date.strftime("%d/%m/%Y"))
        daynumber = date_to_daynumber(date)
        url = "share-reviews/moderatedShared"
        params = {
            "minDayNumber": daynumber,
            "maxDayNumber": daynumber + 1
        }
        data = signature.request(
            ypManager.api['key'], ypManager.api['secret'], "GET", url, params)
        time.sleep(1)
        moderatedReviews = json.loads(data)

        # Fill the reviews to delete dict
        for garage in garages:
            for review in moderatedReviews:
                if garage["id"] == review["garageId"]:
                    reviewIdsByBusinessId[garage["businessId"]].append(
                        review["id"])

    # Create and send files to yellow pages ftp server
    dateNow = ypManager.getDate()
    for businessId in reviewIdsByBusinessId:
        reviews = reviewIdsByBusinessId[businessId]
        if len(reviews) > 0:
            print(businessId, reviews)
            # Create file for garage using businessId
            fileName = "syndication-contribution-EG01-GSC" + businessId + "-" + dateNow
            reviewsFileName = fileName + ".csv"
            decReview = fileName + ".dec"
            content = ypManager.getHeader() + '\n'

            for review in reviews:
                content += ";;;;;;" + review + "000000000000;" + ";;;" + '\n'

            ypManager.createFile(reviewsFileName, content)
            ypManager.sendFile(reviewsFileName, ["pub", "avis", "a_traiter"])
            ypManager.deleteFile(reviewsFileName)

            ypManager.createFile(decReview)
            ypManager.sendFile(decReview, ["pub", "avis", "a_traiter"])
            ypManager.deleteFile(decReview)


# python2 ./lib/removeModeratedReviewsForPeriod.py --key "" --secret "" --ftp-host "" --ftp-user "" --ftp-pass "" --min-day-number 18696 --max-day-number 18906
