redis_url = Rails.application.secrets.redis_url || ENV['REDIS_URL']
p "Connecting to Redis at #{redis_url}"
if redis_url
  $redis = Redis.new(url: redis_url)
else
  $redis = Redis.new
end
