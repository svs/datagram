class AddViewsToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :views, :jsonb
  end
end
