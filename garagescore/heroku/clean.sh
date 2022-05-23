# Clean unused PR
# Usage: bash heroku/clean.sh
pr=$(hub pr list | tr -s ' ' | cut -d ' ' -f 2)
apps=$(heroku apps | grep pr | tr -s ' ' | cut -d ' ' -f 1)
for a in $apps
do
    n=$(echo "$a" | cut -d '-' -f 4)
    if ! echo $pr | grep -q $n; then
        echo ""
        read -p "No open PR found for $a. Destroy the app?" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            heroku apps:destroy -a $a -c $a
        fi
    fi
done