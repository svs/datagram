class AddTransformToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :transform, :json
  end
end
