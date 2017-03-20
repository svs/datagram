class AddTruncatedJsonToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :truncated_json, :json
  end
end
