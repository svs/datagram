class AddKeepKeysToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :keep_keys, :json
  end
end
