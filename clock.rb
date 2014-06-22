require 'clockwork'
require 'clockwork/manager_with_database_tasks'
require_relative './config/boot'
require_relative './config/environment'

module Clockwork

  # required to enable database syncing support
  Clockwork.manager = ManagerWithDatabaseTasks.new

  sync_database_tasks model: Watch, every: 1.minute do |instance_job_name|

    task = MyScheduledTask.find(id)
    task.perform_async

    # Or, e.g. if your queue system just needs job names
    # Stalker.enqueue(instance_job_name)
  end
end
