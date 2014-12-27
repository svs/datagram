class AddUseRoutingKeyToUsers < ActiveRecord::Migration
  def change
    add_column :users, :use_routing_key, :boolean
  end
end
