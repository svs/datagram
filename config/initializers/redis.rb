if Rails.application.secrets.redis_url
  $redis = Redis.new(url: Rails.application.secrets.redis_url || ENV['REDISTOGO_URL'])
else
  $redis = Redis.new
end
