class CreateWatches < ActiveRecord::Migration
  def change
    create_table :watches do |t|
      t.integer :user_id
      t.json :data
      t.integer :interval
      t.string :name
      t.string :webhook_url
      t.timestamps
    end
  end
end
