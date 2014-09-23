class AddLinkedAccountAndRoleToUsers < ActiveRecord::Migration
  def change
    add_column :users, :linked_account_id, :integer
    add_column :users, :role, :string
  end
end
