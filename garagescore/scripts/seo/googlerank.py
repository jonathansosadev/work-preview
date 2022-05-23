#install libs with : python -m pip install requests beautifulsoup4
# -*- coding: utf-8 -*-
queries = u"""ford angers""".split('\n')

import requests, re, time, datetime, sys, codecs
from bs4 import BeautifulSoup
def process(query):
  q = query
  url = 'http://www.google.fr/search'
  headers = { 'User-agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' }
  payload = { 'q' : q, 'size': 50}
  cookies = {}
  r = requests.get( url, params = payload, headers = headers,  cookies=cookies ).text
  '''
  file = codecs.open('index.html', 'w', encoding='utf8')
  file.write(r)
  file.close()
  '''
  '''
  file = open('index.html', 'r') 
  r = file.read()
  '''
  soup = BeautifulSoup( r, 'html.parser' )
  h3tags = soup.find_all( 'div', class_='rc' )
  snippets = soup.find_all( 'div', class_='s' )
  url_found=''
  pos_found=''
  stars_found=''
  box_found='0'
  pos=0
  quit
  for h3 in h3tags:
    try:
      pos=pos+1
      url = h3.a['href'] #re.search('url\?q=(.+?)\&sa', ).group(1)
      if "garagescore.com" in url:
        url_found=url
        pos_found=pos
    except:
      continue
  for snippet in snippets:
    snippet = str(snippet)
    try:
      if "garagescore" in snippet and "g-review-stars" in snippet:
        stars_found='1'
    except:
      continue
  if 'sur 10 sur GarageScore' in r :
    box_found='1'
  date = datetime.datetime.today().strftime('%d/%m/%Y')
  month = datetime.datetime.today().strftime('%Y-%m')
  print (u'%s;%s;%s;%s;%s;%s;%s' % (q, date, month, url_found, pos_found, stars_found, box_found))
  #print (u'%s;%s' % (q, stars_found))
  time.sleep(3)

print (u'requete;date;année-mois;url;position;stars_found;business box')
for query in queries:
  process(query)
#process(queries[0])
'''

soup.find_all( 'span', class_='_G2n _N2n' )


'''