class AddNameToStreamers < ActiveRecord::Migration
  def change
    add_column :streamers, :name, :string
  end
end
