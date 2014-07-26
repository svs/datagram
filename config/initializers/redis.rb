if Rails.application.secrets.redis_url
  $redis = Redis.new(Rails.application.secrets.redis_url)
else
  $redis = Redis.new
end
