class AddRefreshChannelToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :refresh_channel, :string
  end
end
