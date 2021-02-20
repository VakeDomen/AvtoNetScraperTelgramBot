echo "Starting service in $PWD in 5s"
# sleep 5
echo "Migration..."
while node_modules/db-migrate/bin/db-migrate up ; [ $? -ne 0 ];do
    echo "failed to make migrations! sleepting 5s"
    sleep 5
done
echo "Running server!"
npm run start
