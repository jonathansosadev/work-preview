# send secured request to the api
# -*- coding: utf-8 -*-
from collections import OrderedDict
from hashlib import sha1
import hmac
import platform
import logging
import requests
import sys
import time
import urllib

logging.basicConfig(level=logging.INFO)

API_URL = 'api.garagescore.com/'
PROTOCOL = 'https'
if platform.system() == 'Windows' or platform.system() == 'Darwin':
  API_URL = 'localhost:3000/public-api/'
  PROTOCOL = 'http'

def _encodeURI(str):
  return urllib.quote(str, safe='~@#$&()*!+=:;,.?/\'')

def _sign(API_KEY, API_SECRET, method, url, parameters):
  timestamp = str(int(time.time()))
  parametersString = urllib.urlencode(parameters)
  encodedUrl = _encodeURI(url)
  signatureString = API_KEY + method + encodedUrl + parametersString + timestamp;
  print("method "+method)
  print("encodedUrl "+encodedUrl)
  print("parametersString "+parametersString)
  print("timestamp "+timestamp)
  exit
  hashed = hmac.new(API_SECRET, signatureString, sha1)
  return hashed.digest().encode("hex")
# return crypto.createHmac('sha1', API_SECRET).update(signatureString).digest('hex');addresseeId


# generate an url to the api
# method GET,POST...
# uri endpoint, expl ping, garage/98a898787a/data ...
# params dictionnary
def generateURL(API_KEY, API_SECRET, method, uri, params, fullUrl):
  if (params and len(params) > 0):
    params = OrderedDict(sorted(params.items(), key=lambda t: t[0]))
  if not fullUrl:
    url = PROTOCOL + '://' + API_URL + uri
  else:
    url = uri
  signature = _sign(API_KEY, API_SECRET, method, url, params)
  parametersString = urllib.urlencode(params)
  if (parametersString):
    parametersString = '&' + parametersString
  requestURL = url + '?' + 'signature=' + signature + '&appId=' + API_KEY + parametersString
  logging.info('requestURL = ' + requestURL)
  return requestURL

def request(API_KEY, API_SECRET, method, uri, params = {}, jsonPOST = None, fullUrl=False):
  r = ''
  url = generateURL(API_KEY, API_SECRET, method, uri, params, fullUrl)
  if (method == 'GET'):
    r = requests.get(url).text
  else:
    r = requests.post(url, json = jsonPOST).text
  return r

def setApiUrl(apiUrl):
  global API_URL
  API_URL = apiUrl

def setApiProtocol(apiProtocol):
  global PROTOCOL
  PROTOCOL = apiProtocol


if __name__ == '__main__':
  API_KEY = sys.argv[1]
  API_SECRET = sys.argv[2]
  request(API_KEY, API_SECRET, 'GET', 'garage/577a30d774616c1a0056c263/data', {})
  request(API_KEY, API_SECRET, 'GET', 'garage/searchwith/businessId/31547505300031', {})
  request(API_KEY, API_SECRET, 'GET', 'garage/59397ebf9b90721900cc1f7b/reviews', {})
# request(API_KEY, API_SECRET, 'GET', 'garage/reviews/2/11/2016', {})
# generateURL(API_KEY, API_SECRET, 'GET', 'ftp/nextcreate', {})
# generateURL(API_KEY, API_SECRET, 'GET', 'ftp/accountcreated', { 'username': 'coucou', 'pwd': 'abcdefghij' })
# request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/garages', {})
# request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/conf', { 'garageId': '577a30d774616c1a0056c263'})
# request(API_KEY, API_SECRET, 'POST', 'ftp/ftp2s3/log', { 'taskId': '333'}, { 'taskLog': 'hehe'})
# request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/log', { 'taskId': '333'})
#request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/poptransfer')
