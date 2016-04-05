class AddTokenToStreams < ActiveRecord::Migration
  def change
    add_column :streamers, :token, :string
  end
end
