require 'clockwork'
require 'clockwork/database_events'
require_relative './config/boot'
require_relative './config/environment'
require 'bunny'
require './config/initializers/rabbitmq.rb'

module Clockwork

  # required to enable database syncing support
  Clockwork.manager = DatabaseEvents::Manager.new

  sync_database_events model: DatagramFinder, every: 1.minute do |datagram|
    datagram = Datagram.find(datagram.id)
    Rails.logger.info "Clock publishing #{datagram.name}"
    begin
      datagram.publish
    rescue Exception => e
      Rails.logger.error e.message
      nil
    end
    # Or, e.g. if your queue system just needs job names
    # Stalker.enqueue(instance_job_name)
  end

  error_handler do |error|
    Rails.logger.error "#Clock failed #{error}"
  end
end
