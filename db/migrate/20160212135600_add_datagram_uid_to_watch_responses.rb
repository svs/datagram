class AddDatagramUidToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :datagram_uid, :string
  end
end
