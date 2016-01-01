class AddDescriptionToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :description, :text
  end
end
