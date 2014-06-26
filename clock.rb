require 'clockwork'
require 'clockwork/manager_with_database_tasks'
require_relative './config/boot'
require_relative './config/environment'
require 'bunny'
require './config/initializers/rabbitmq.rb'

module Clockwork

  # required to enable database syncing support
  Clockwork.manager = ManagerWithDatabaseTasks.new

  sync_database_tasks model: Watch, every: 1.minute do |instance_job_name|
    watch = Watch.find_by_name(instance_job_name)
    watch.publish(exchange: $x, queue: $q, callback_host: "http://localhost:3000")

    # Or, e.g. if your queue system just needs job names
    # Stalker.enqueue(instance_job_name)
  end
end
