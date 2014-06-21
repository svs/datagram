require 'clockwork'
require 'sidekiq'
require_relative './config/boot'
require_relative './config/environment'

module Clockwork
  handler do |job|
    puts "Running #{job}"
    TestWorker.perform_async(job)
  end

  every(10.seconds, 'frequent.job')
end
