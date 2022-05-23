# move files older than 24h in /home/* and compress them
DATE=$(date '+%Y%m%d')
for SOURCE in /home/*; do
  if [ $SOURCE != "/home/ec2-user" ]
  then
    TARGET=/usr/local/ftpupload.backup/$DATE$SOURCE
    mkdir -p $TARGET
    find $SOURCE -maxdepth 1 -type f -mmin +43200 -exec mv "{}" $TARGET/ \;
  fi
done
tar -czf /usr/local/ftpupload.backup/$DATE.tgz /usr/local/ftpupload.backup/$DATE
rm -rf /usr/local/ftpupload.backup/$DATE
# tar -xzf 20181212.tgz -C dir_to_extract