if [ "$#" -ne 2 ]; then
 echo "username and/or password parameters missing"
 exit 1
fi
id -u $1 &> /dev/null
if [ $? -eq 0 ]; then
 echo user $1 already exists
 exit 1
fi
sudo useradd -m -d /home/$1 $1
sudo usermod --password $(echo $2 | openssl passwd -1 -stdin) $1
exit 0