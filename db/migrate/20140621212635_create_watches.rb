class CreateWatches < ActiveRecord::Migration
  def change
    create_table :watches do |t|
      t.integer :user_id
      t.json :data
      t.integer :frequency
      t.string :at
      t.string :name
      t.string :url
      t.string :method, default: "get"
      t.string :webhook_url
      t.string :protocol, default: "http"
      t.timestamps
    end
  end
end
