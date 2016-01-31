class CreateStreamers < ActiveRecord::Migration
  def change
    create_table :streamers do |t|
      t.integer :datagram_id
      t.string :stream_sink
      t.json :stream_data

      t.timestamps null: false
    end
  end
end
