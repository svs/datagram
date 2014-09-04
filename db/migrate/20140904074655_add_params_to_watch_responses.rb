class AddParamsToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :params, :json
  end
end
