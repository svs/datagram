require 'clockwork'
require 'clockwork/manager_with_database_tasks'
require_relative './config/boot'
require_relative './config/environment'
require 'bunny'

if ENV['RABBITMQ_BIGWIG_TX_URL']
  $conn = Bunny.new(ENV['RABBITMQ_BIGWIG_TX_URL'])
else
  $conn = Bunny.new
end

$conn.start

$ch = $conn.create_channel
$q  = $ch.queue("watches", :durable => true)
$x  = $ch.default_exchange

module Clockwork

  # required to enable database syncing support
  Clockwork.manager = ManagerWithDatabaseTasks.new

  sync_database_tasks model: Watch, every: 1.minute do |instance_job_name|
    watch = Watch.find_by_name(instance_job_name)
    $x.publish(watch.publish.to_json, routing_key: $q.name)

    # Or, e.g. if your queue system just needs job names
    # Stalker.enqueue(instance_job_name)
  end
end
