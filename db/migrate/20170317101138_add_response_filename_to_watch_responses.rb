class AddResponseFilenameToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :response_filename, :string
  end
end
