class AddReportTimeToWatchResponse < ActiveRecord::Migration
  def change
    add_column :watch_responses, :report_time, :datetime
  end
end
