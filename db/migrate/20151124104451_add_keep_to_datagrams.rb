class AddKeepToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :keep, :boolean, default: false
  end
end
