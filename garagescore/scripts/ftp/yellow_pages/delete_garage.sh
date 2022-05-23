parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
source $parent_path/.env
python ./lib/yellow_pages_delete.py --key $API_KEY --secret $API_SECRET --ftp-host $FTP_HOST --ftp-user $FTP_USER --ftp-pass $FTP_PASS --garageId $1
