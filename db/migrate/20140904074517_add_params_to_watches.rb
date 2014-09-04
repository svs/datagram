class AddParamsToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :params, :json
  end
end
