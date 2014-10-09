class AddTransformToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :transform, :json
  end
end
