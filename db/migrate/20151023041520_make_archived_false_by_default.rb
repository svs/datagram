class MakeArchivedFalseByDefault < ActiveRecord::Migration
  def change
    change_column :datagrams, :archived, :boolean, default: false
  end
end
