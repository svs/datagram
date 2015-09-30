class AddArchivedToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :archived, :boolean
  end
end
