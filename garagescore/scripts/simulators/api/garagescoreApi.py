# This program makes request to GarageScore's public API.
# Help is available by launching the program with -h or --help ( python garagescoreApi.py -h )
# -*- coding: utf-8 -*-
from collections import OrderedDict
from hashlib import sha1
import hmac
import logging
import requests
import sys
import time
import urllib
import json
import argparse
import time

logging.basicConfig(level=logging.INFO)

API_URL = 'localhost'#'api.garagescore.com/' #g3ek9zjqch.execute-api.eu-west-3.amazonaws.com/LOCAL/'
PROTOCOL = 'http'

parser = argparse.ArgumentParser(prog='GarageScore public API tester',
    description= 'This program makes requests to GarageScore\'s public API. It requires the module requests (pip install requests)',
    epilog='''Examples:
        python garagescoreApi.py -u localhost -g 57308e1d198cee1a00ee7b0a  # Requests the data for garage 57308e1d198cee1a00ee7b0a
    ''')
configArgs = parser.add_argument_group('config', 'Arguments which use is to set the API key/secret pair and the base URL')
configArgs.add_argument('-k', '--key', '--api-key', default='6441beaf9960158586fced4bf3cf7738', help='Sets the API key', metavar='API Key')
configArgs.add_argument('-s', '--secret', default='0JgsLtlGxiA95CajLIXBQZ7XYwnkLYha', help='Sets the API secret', metavar='API Secret')
configArgs.add_argument('-u', '--url', '--base-url', default='api.garagescore.com', help='Sets the base URL for our requests, defaults to api.garagescore.com', metavar='base URL')
configArgs.add_argument('-p', '--protocol', '--proto', default='http', help='Sets the protocol, defaults to http', metavar='protocol')

filtersArgs = parser.add_argument_group('requests', 'Arguments that defines the request and its parameters')
filtersArgs.add_argument('-g', '--garage', nargs='?', help='Launches the garages/data/ request for the garage whose id is specified', metavar='garageId')
filtersArgs.add_argument('--garages', action='store_true', help='Launches the garages/data/ request')
#  'Maintenance','NewVehicleSale','UsedVehicleSale','ExogenousReview','LeadOnly','Unknown'
filtersArgs.add_argument('-t', '--type', choices=['Maintenance', 'NewVehicleSale', 'UsedVehicleSale'], help='Chooses the type of reviews for -r|--reviews request')
filtersArgs.add_argument('-a', '--after', help='Offsets the results after the given dataId for reviewsByDate', metavar='dataId')

requestArgs = parser.add_mutually_exclusive_group()
requestArgs.add_argument('-r', '--reviews', action='store_true', help='Launches the /reviews request. Garage has to be selected with -g|--garage ')
#parser.add_argument('--reviews-type', help'Launches the reviewsByType request', metavar='TYPE')
#parser.add_argument('--reviews-garage', help='Lauches the reviewsByGarage request', metavar='garageId')
requestArgs.add_argument('--reviews-date', dest='date', help='Lauches the reviewsByDate request with a date in DD/MM/YYYY format')
#parser.add_argument('--reviews-count', nargs=0, help='Launches the reviewsCount request')
requestArgs.add_argument('--garage-search', dest='criterion', help='Launches the garage/searchwith/ request. criterion must be of key=value format', metavar='criterion')


def _encodeURI(str):
    return urllib.quote(str, safe='~@#$&()*!+=:;,.?/\'')

def _sign(API_KEY, API_SECRET, method, url, parameters):
    timestamp = str(int(time.time()))
    parametersString = urllib.urlencode(parameters)
    if 'api-no-proxy.garagescore.com' in API_URL or 'api.garagescore.com' in API_URL:
        print API_URL
        print url
        url = url.replace(API_URL + '/public-api', 'api.garagescore.com')
    encodedUrl = _encodeURI(url)
    print parametersString
    signatureString = API_KEY + method + encodedUrl + parametersString + timestamp;
    hashed = hmac.new(API_SECRET, signatureString, sha1)
    return hashed.digest().encode("hex")


def build_url(arguments):
    url = PROTOCOL + '://' + arguments.url
    if 'api.garagescore.com' not in API_URL:
        url += '/public-api' 
    if arguments.date is not None: # Calling reviewsByDate
        if len(arguments.date.split('/')) is 3 and [2, 2, 4] == [len(e) for e in arguments.date.split('/')]:
            if arguments.garage:
                url += '/garage/' + arguments.garage + '/reviews' + arguments.date
            else:
                url += '/garage/reviews/' + arguments.date
            if arguments.after:
                url += '/after/' + arguments.after
        else:
            raise Exception('date is not valid, must be of format DD/MM/YYYY')
    elif arguments.criterion is not None:
        if len(arguments.criterion.split('=')) is 2:
            url += '/garage/searchwith/' + '/'.join(arguments.criterion.split('='))
        else:
            raise Exception('criterion is not valid, must be of format key=value')
    elif arguments.reviews:
        if arguments.garage:
            url += '/garage/' + arguments.garage + '/reviews'
        else:
            raise Exception('garage must be specified')
    elif arguments.garage:
        url += '/garage/' + arguments.garage + '/data'
    elif arguments.garages:
        url += '/garages/data'
    else:
        parser.print_help()
        raise Exception('a request has to be selected')
    return url


# generate an url to the api
def generateURL(API_KEY, API_SECRET, method, uri, params):
    if (params and len(params) > 0):
        params = OrderedDict(sorted(params.items(), key=lambda t: t[0]))
    signature = _sign(API_KEY, API_SECRET, method, url, params)
    parametersString = urllib.urlencode(params)
    if (parametersString):
        parametersString = '&' + parametersString
    requestURL = url + '?' + 'signature=' + signature + '&appId=' + API_KEY + parametersString
    logging.info('requestURL = ' + requestURL)
    return requestURL
#decode json
def byteify(input):
    if isinstance(input, dict):
        return {byteify(key): byteify(value)
            for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input

# request the api
def request(API_KEY, API_SECRET, method, uri, params = {}, jsonPOST = None):
    r = None
    url = generateURL(API_KEY, API_SECRET, method, uri, params)
    url = url.replace('https', 'http')
    if (method == 'GET'):
        r = requests.get(url)
    else:
        r = requests.post(url, json = jsonPOST)
    logging.info(repr(r))
    if r.status_code == requests.codes.ok:
        return r.text
    else:
        raise Exception('Something went wrong in the request status code: ' + str(r.status_code) + ' ' + r.text)

if __name__ == '__main__':
    arguments = parser.parse_args()
    API_URL = arguments.url
    PROTOCOL = arguments.protocol
    url = build_url(arguments)
    pagina = 0
    data = []
    while url:
        r = json.loads(byteify(request(arguments.key, arguments.secret, 'GET', url, {'pagination': 'true', 'dateField': 'sharedWithPartners'})))
        if len(r) == 0:
            print 'No more pages to load, bye !'
            break
        print len(r)
        data += [r] if type(r) is type(dict()) else r
        # Some requests are not paginated, for example garages/ or reviewsByDate
        if type(r) is type(dict()) or arguments.date is not None:
            break
        pagina+=1
    print '\nRequests are finished :'
    print 'Amount of elements retreived: ' + str(len(data))
    print ''
    print(data)
