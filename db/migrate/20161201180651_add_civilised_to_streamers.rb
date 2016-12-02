class AddCivilisedToStreamers < ActiveRecord::Migration
  def change
    add_column :streamers, :civilised, :boolean
  end
end
