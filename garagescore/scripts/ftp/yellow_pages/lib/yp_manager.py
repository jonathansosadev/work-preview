# -*- coding: utf-8 -*-
# # library used by yellow_pages.py and yellow_pages_delete.py

from log import log
import sys
sys.path.append("..")
import signature
sys.path.append("./lib")
import io
import os
import pysftp
import datetime
import time
import json
import logging

class YellowPagesManager:

  def __init__(self,ftp_host,ftp_user,ftp_pass,api,isDev=False):
    self.ftp_host=ftp_host
    self.ftp_user=ftp_user
    self.ftp_pass=ftp_pass
    self.api = api
    self.isDev = isDev
    if not os.path.exists("tmp"):
      os.makedirs("tmp")

  def addZero(self,val,maxVal):
    finalVal = ""
    if val < maxVal:
      finalVal += "0"
    finalVal += str(val)

    return str(finalVal)

  def getDate(self):
    now = datetime.datetime.now()
    dateStr = str(now.year)
    dateStr += self.addZero(now.month,10)
    dateStr += self.addZero(now.day,10)
    dateStr += self.addZero(now.hour,10)
    dateStr += self.addZero(now.minute,10)
    dateStr += self.addZero(now.second,10)

    return dateStr

  def doubleQuote(self, txt):
    return txt.replace('"', '""')

  # ! round and divide by 2
  def roundNote(self, note):
    note = float(note)
    note = round(note)
    note = note/2
    note = int(note)
    return note

  def formatGarage(self, garage):
    line = 'ETABLISSEMENT;'
    line += 'GSC' + self.checkVal(garage,"businessId") + ';'

    garageName = self.checkVal(garage,"publicDisplayName")
    garageName = self.doubleQuote(garageName)

    line += garageName + ';'

    line += '"' + self.doubleQuote(self.checkVal(garage,"streetAddress")) + '";'
    line += self.checkVal(garage,"postalCode") + ';'
    line += self.doubleQuote(self.checkVal(garage,"city")) +';'
    line += self.checkVal(garage,"phone").replace(" ", "") +';'
    line += self.checkVal(garage,"businessId")
    line += '\n'
    return line;

  def getHeader(self):
    header = "PRENOM;NOM;DATE_EXPERIENCE;DATE_AVIS;NOTE;AVIS;UID_AVIS;UID_CLIENT;UID_REPONSE;DATE_REPONSE;REPONSE"
    return header

  def formatDateReview(self, dateIso):
    #date DD/MM/YYYY hh :mm :ss
    cnvterDate = datetime.datetime.strptime( dateIso, "%Y-%m-%dT%H:%M:%S.%fZ" )

    dateReview = '"' + self.addZero(cnvterDate.day,10) + "/"
    dateReview += self.addZero(cnvterDate.month,10) + "/"
    dateReview += str(cnvterDate.year) + " "
    dateReview += self.addZero(cnvterDate.hour,10) + ":"
    dateReview += self.addZero(cnvterDate.minute,10) + ":"
    dateReview += self.addZero(cnvterDate.second,10) + '"'

    return dateReview;

  def validateDateReview(self, dateIso):
    #date DD/MM/YYYY hh :mm :ss
    cnvterDate = datetime.datetime.strptime( dateIso, "%Y-%m-%dT%H:%M:%S.%fZ" )
    return cnvterDate.year > 2010;

  def getReviewScore(self, review):
    noteGs = self.checkVal(review, "score")
    scoreOutOf = self.checkVal(review, "scoreOutOf")
    if noteGs != None:
      if scoreOutOf == 5:
        noteGs *= 2
      noteGs = self.roundNote(noteGs)
    return noteGs

  def formatReview(self, review, delete=False):
    if not "comment" in review: # ignore empty comments
      return None
    deleteReview = ";;;;;;" + self.checkVal(review, "id") + "000000000000;" + ";;;" + '\n'
    try:
      noteGs = self.getReviewScore(review)
      # pagesjaunes will not accept the review if the rating is 0
      if delete == True or noteGs < 1 or review['shareWithPartners'] == False:
        return deleteReview
      else:
        names = review["authorPublicDisplayName"].split(".")
        line = names[0] + ";"
        line += names[1].replace(" ", "") + ";"
        line += self.formatDateReview(review["completedAt"]) + ";"
        line += self.formatDateReview(review["createdAt"]) + ";"

        if noteGs != None:
          line += str(noteGs)

        line += ";"
        comment = review["comment"]
        comment = comment.replace('\n', ' ')
        comment = comment.replace('\n\r', ' ')
        comment = comment.replace('\r', ' ')
        comment = comment.replace('\r\n', ' ')
        comment = comment.replace('\t', ' ')
        comment = self.doubleQuote(comment)

        line += '"' + comment + '"' + ";"
        line += self.checkVal(review, "id") + "000000000000;"
        line += "GSC" + self.checkVal(review, "businessId") + ";"

        idReply = ""
        dateReply = ""
        replyText = ""

        if "reply" in review:
          if ("text" in review["reply"]) and ("approvedAt" in review["reply"]):
            if review["reply"]["approvedAt"] != None:
              idReply = review["id"] + "reply0000000"
              dateReply = self.formatDateReview(review["reply"]["approvedAt"])
              replyText = '"' + review["reply"]["text"] + '"'

              replyText = replyText.replace('\n', ' ')
              replyText = replyText.replace('\n\r', ' ')
              replyText = replyText.replace('\r', ' ')
              replyText = replyText.replace('\r\n', ' ')
              replyText = replyText.replace('\t', ' ')
              replyText = self.doubleQuote(replyText)

        line += idReply + ";"  # U_ID RESPONSE
        line += dateReply + ";"  # DATE_RESPONSE
        line += '"' + replyText + '"\n'  # RESPONSE

        return line
    except:
      log("ERROR ON REVIEW : ")
      log(review['garageId'] + "=>" + review['id'])
      return deleteReview

  def checkVal(self,array,key):
    if(array.get(key,None)):
      return array[key]
    else:
      return ""

  def sendGarages(self):
    garages = signature.request(self.api['key'], self.api['secret'], "GET", "share-reviews/garages", { "localeCode": "fr_FR" })
    time.sleep(1)
    garages = json.loads(garages)

    closeFileName = "syndication-contribution-rapprochement-EG01.csv"
    decFileName = "syndication-contribution-rapprochement-EG01.dec"
    closeFile = ""

    for garage in garages:
      if len(garage['businessId']) >= 14 and not garage.get('city') == 'Monaco' and not garage.get('postalCode') == '98000':
        formattedGarage = self.formatGarage(garage)
        closeFile += formattedGarage

    if closeFile == "":
      closeFile = None

    self.createFile(closeFileName,closeFile)
    self.sendFile(closeFileName,["pub","rapprochement","a_traiter"])
    self.deleteFile(closeFileName)

    self.createFile(decFileName)
    self.sendFile(decFileName,["pub","rapprochement","a_traiter"])
    self.deleteFile(decFileName)

    return garages

  def sendReviews(self, reviews,garages):
    date = self.getDate()
    for garage in garages:
      fileName = "syndication-contribution-EG01-GSC" + garage["businessId"] + "-" + date
      reviewsFileName = fileName + ".csv"
      decReview = fileName + ".dec"
      totalReviews = 0

      reviewsFile = self.getHeader() + "\n"
      for review in reviews :
        review["businessId"] = garage["businessId"]
        formattedReview = self.formatReview(review)
        if formattedReview is None:
          log("Ignoring empty review")
          continue
        if not self.validateDateReview(review["createdAt"]):
          log("Ignoring review with incorrect createdAt " + review["createdAt"])
          continue
        if not self.validateDateReview(review["completedAt"]):
          log("Ignoring review with incorrect completedAt " + review["completedAt"])
          continue
        if review["garageId"] == garage["id"]:
          reviewsFile += formattedReview
          totalReviews+=1

      if garage["businessId"] is None or len(garage['businessId']) < 14:
        log("Ignoring " + garage['id'] + " with no SIRET " + str(totalReviews) + " review(s) lost")
        continue

      log("total reviews to send for " + garage['id'] + " => " + str(totalReviews))
      if totalReviews > 0:
        self.createFile(reviewsFileName,reviewsFile)
        self.sendFile(reviewsFileName,["pub","avis","a_traiter"])
        self.deleteFile(reviewsFileName)

        self.createFile(decReview)
        self.sendFile(decReview,["pub","avis","a_traiter"])
        self.deleteFile(decReview)

  def deleteModeratedReviews(self,garages, daynumber):
    url = "share-reviews/moderatedShared"
    params = {
      "minDayNumber" : daynumber,
      "maxDayNumber" : daynumber + 1
    }
    reviewsModerated = signature.request(self.api['key'], self.api['secret'], "GET", url ,params)
    time.sleep(1)
    reviewsModerated = json.loads(reviewsModerated)

    for review in reviewsModerated:
      selectedGarage = False
      for g in garages:
        if g["id"] == review["garageId"]:
          selectedGarage = g
      if selectedGarage != False:
        date = self.getDate()
        fileName = "syndication-contribution-EG01-GSC" + selectedGarage["businessId"] + "-" + date
        reviewsFileName = fileName + ".csv"
        decReview = fileName + ".dec"

        content = self.getHeader()
        resultFormatReview = self.formatReview(review,True)
        content = content+ '\n' + (resultFormatReview if resultFormatReview is not None else "") #if formatReview is None, use an empty string
        self.createFile(reviewsFileName,content)
        self.sendFile(reviewsFileName,["pub","avis","a_traiter"])
        self.deleteFile(reviewsFileName)

        self.createFile(decReview)
        self.sendFile(decReview,["pub","avis","a_traiter"])
        self.deleteFile(decReview)


  def sendFile(self, fileName,directories):
    logging.disable(logging.INFO)
    if self.isDev == False :
      cnopts = pysftp.CnOpts()
      cnopts.hostkeys = None
      with pysftp.Connection(host=self.ftp_host, username=self.ftp_user,
                             password=self.ftp_pass, cnopts=cnopts) as sftp:
        try:
          for dir in directories:
            sftp.chdir(dir)
          if(self.isDev != True):
            sftp.put("tmp/" + fileName)
          sftp.close()
        except IOError as ex:
          log("ERROR=> SENDFILE")
          log(ex)
    else :
      log("Don't send file tmp/" + fileName + "  in dev mode")
    logging.disable(logging.NOTSET)

  def createFile(self,filename,content = None):
    try :
      file = io.open("tmp/" + filename, encoding="utf-8", mode='w+')
      if (content != None) and (len(content) > 0) :
        file.write(unicode(content))
      file.close()
    except IOError as ex:
      log("ERROR : ")
      log(ex)

  def deleteGarageReview(self, garage):
    date = self.getDate()
    fileName = "syndication-contribution-EG01-GSC" + garage["businessId"] + "-" + date
    content = self.getHeader() + '\n'
    reviewsFileName = fileName + ".csv"
    decReview = fileName + ".dec"

    reviews = self.loadReviews(garage['id'], True)
    log("Total reviews to delete for " + garage['id'] + " => " + str(len(reviews)))
    for review in reviews:
      content += self.formatReview(review, True)

    self.createFile(reviewsFileName,content)
    self.sendFile(reviewsFileName,["pub","avis","a_traiter"])
    self.deleteFile(reviewsFileName)

    self.createFile(decReview)
    self.sendFile(decReview,["pub","avis","a_traiter"])
    self.deleteFile(decReview)

  def deleteFile(self,filename):
    if(self.isDev != True) :
      # os.remove("tmp/" + filename)
      log("Keeping temporary file tmp/"+filename)

  def loadReviews(self, garageId, shareWithPartners = None):
    i = 0
    limit = 200
    url = "garage/" + garageId + "/reviews"
    reviews = []
    next = True
    while next == True:
      params = {"pagina": i, "pLimit" : limit}
      results = signature.request(self.api['key'], self.api['secret'], "GET", url, params)
      time.sleep(1)
      results = json.loads(results)

      for review in results:
        if shareWithPartners != None:
          if review["shareWithPartners"] == shareWithPartners:
            reviews.append(review)
        else:
          reviews.append(review)
      if len(results) == limit:
        i = i+1
      else:
        next = False
    return reviews

def date_to_daynumber(date):
  epoch = datetime.datetime(1970, 1, 1)
  delta_time = int(((date - epoch).total_seconds())/86400)

  return delta_time

if __name__ == '__main__':
  API_KEY = sys.argv[1]
  API_SECRET = sys.argv[2]
  garage_id = sys.argv[3]
  params_api = {"key": API_KEY, "secret": API_SECRET}
  params = {
    "garageId": garage_id,
    "minDayNumber": 17372,
    "maxDayNumber": 17642
  }
  ypManager = YellowPagesManager("ftp_host", "ftp_user", "ftp_pass", params_api, True)

  garages = signature.request(API_KEY, API_SECRET, "GET", "share-reviews/garages", { "localeCode": "fr_FR" })

  time.sleep(1)

  paramsReviews = {"dateField": "sharedWithPartners", "pagination": "true"}

  signature.request(API_KEY, API_SECRET, "GET", "garage/reviews/21/03/2018" ,paramsReviews)
  signature.request(API_KEY, API_SECRET, "GET", "share-reviews/garages2delete", {
    "minDayNumber": date_to_daynumber(datetime.datetime(2015, 1, 1)),
    "maxDayNumber": date_to_daynumber(datetime.datetime.now()),
    "garageId": garage_id,
    "localeCode": "fr_FR"
  })
  signature.request(API_KEY, API_SECRET, "GET", "share-reviews/garages", { "localeCode": "fr_FR" })
  signature.request(API_KEY, API_SECRET, "GET", "share-reviews/moderatedShared" ,params)

