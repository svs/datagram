class AddSourceToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :source_id, :integer
  end
end
