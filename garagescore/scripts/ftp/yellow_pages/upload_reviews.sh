parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
source $parent_path/.env
params=""

if [ "$#" -gt 1 ]
then
  params="--min-day-number $1 --max-day-number $2"
fi

python ./lib/yellow_pages.py --key $API_KEY --secret $API_SECRET --ftp-host $FTP_HOST --ftp-user $FTP_USER --ftp-pass $FTP_PASS $params

