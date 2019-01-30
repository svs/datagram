require 'redis'
require_relative './config/boot'
require_relative './config/environment'
require 'bunny'
require './config/initializers/rabbitmq.rb'
require './config/initializers/redis.rb'
require 'redis-scheduler'


streams = Streamer.where('frequency IS NOT NULL')
s = RedisScheduler.new($redis, blocking: false)
s.schedule!(rand(100), Time.now + 10)
ap s.items.map{|x| x}
ap s.items.map{|x| x[0].to_i}
# s.each do |x|
#   ap x
#   s = Streamer.find(x)
#   x.publish
# end
