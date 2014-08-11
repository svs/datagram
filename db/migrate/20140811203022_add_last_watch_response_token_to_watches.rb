class AddLastWatchResponseTokenToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :last_response_token, :string
  end
end
