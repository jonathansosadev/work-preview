echo ####CERTIFIED#### keysim kObKvwfMCAah export.csv 577a30d774616c1a0056c263 > GarageScore-http2ftp.txt
:: ####CERTIFIED#### -> used to identified if it's a correct request
:: keysim -> ftp user name
:: kObKvwfMCAah -> ftp password
:: export.csv -> final file name
type export.csv >> GarageScore-http2ftp.txt
:: export.csv -> path to the file to upload
curl.exe --upload-file GarageScore-http2ftp.txt localhost:3000/ --insecure
::curl.exe --upload-file GarageScore-http2ftp.txt https://http2ftp.garagescore.com/ --insecure
::If using a proxy, add this argument: --proxy http://10.19.91.7:3128
