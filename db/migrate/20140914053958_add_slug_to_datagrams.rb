class AddSlugToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :slug, :string
  end
end
