-- redis-cli -h ec2-52-18-250-243.eu-west-1.compute.amazonaws.com -p 6739 -a ... --eval delete.lua
local i=0
for _,k in ipairs(redis.call('keys', 'sess:*')) do
    redis.call('del', k)
    i=i+1
end
return i