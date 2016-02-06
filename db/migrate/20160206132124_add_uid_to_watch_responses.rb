class AddUidToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :uid, :string
  end
end
