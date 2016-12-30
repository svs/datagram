class AddReadonlyToUsers < ActiveRecord::Migration
  def change
    add_column :users, :ro, :boolean
  end
end
