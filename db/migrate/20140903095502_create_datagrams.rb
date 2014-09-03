class CreateDatagrams < ActiveRecord::Migration
  def change
    create_table :datagrams do |t|
      t.string :name
      t.integer :watch_ids, array: true
      t.string :at
      t.integer :frequency
      t.integer :user_id
      t.string :token, length: 10
      t.boolean :use_routing_key
      t.column :last_update_timestamp, :bigint
    end
  end
end
