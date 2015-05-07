class AddProtocolToSources < ActiveRecord::Migration
  def change
    add_column :sources, :protocol, :string
  end
end
