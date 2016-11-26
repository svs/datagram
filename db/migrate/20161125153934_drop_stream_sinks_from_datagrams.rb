class DropStreamSinksFromDatagrams < ActiveRecord::Migration
  def change
    remove_column :datagrams, :stream_sinks
  end
end
