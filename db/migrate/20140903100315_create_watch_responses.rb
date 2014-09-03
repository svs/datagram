class CreateWatchResponses < ActiveRecord::Migration
  def change
    create_table :watch_responses do |t|

      t.integer :watch_id
      t.integer :datagram_id
      t.integer :status_code
      t.datetime :response_received_at
      t.integer :round_trip_time
      t.json :response_json
      t.json :error
      t.string :signature
      t.boolean :modified
      t.integer :elapsed
      t.json :strip_keys
      t.json :keep_keys
      t.integer :started_at
      t.integer :ended_at
      t.string :token
      t.boolean :preview
    end

    add_column :watch_responses, :timestamp, :bigint

  end
end
