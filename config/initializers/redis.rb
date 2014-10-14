if Rails.application.secrets.redis_url
  $redis = Redis.new(url: Rails.application.secrets.redis_url)
else
  $redis = Redis.new
end
