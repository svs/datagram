class AddStreamSinksToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :stream_sinks, :jsonb
  end
end
