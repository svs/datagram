class AddSlugToWatch < ActiveRecord::Migration
  def change
    add_column :watches, :slug, :string
  end
end
