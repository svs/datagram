class AddUseRoutingKeyToWatches < ActiveRecord::Migration
  def change
    add_column :watches, :use_routing_key, :boolean
  end
end
