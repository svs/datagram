class AddDeletedAtToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :deleted_at, :datetime
  end
end
