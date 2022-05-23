# run this on your ec2 instance to update all the files from master
cd /git
git pull
cp -r /git/scripts/ftp /home/ec2-user/cronjobs/python
echo "code deployed"
