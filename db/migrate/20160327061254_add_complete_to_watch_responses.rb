class AddCompleteToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :complete, :boolean
  end
end
