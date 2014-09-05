class AddReportTimeToWatch < ActiveRecord::Migration
  def change
    add_column :watches, :report_time, :string
  end
end
