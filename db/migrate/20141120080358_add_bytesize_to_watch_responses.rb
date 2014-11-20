class AddBytesizeToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :bytesize, :integer
  end
end
