class AddDetailsToStreamers < ActiveRecord::Migration
  def change
    add_column :streamers, :stream_sink_id, :integer
    add_column :streamers, :param_set, :string
    add_column :streamers, :view_name, :string
  end
end
