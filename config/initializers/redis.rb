redis_url = Rails.application.secrets.redis_url || ENV['REDISTOGO_URL']
p redis_url
if redis_url
  $redis = Redis.new(url: redis_url)
else
  $redis = Redis.new
end
