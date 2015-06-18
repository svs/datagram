class AddDescriptionToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :description, :text
  end
end
