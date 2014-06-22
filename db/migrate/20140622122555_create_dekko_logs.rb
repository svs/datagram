class CreateDekkoLogs < ActiveRecord::Migration
  def change
    create_table :dekko_logs do |t|
      t.string :key
      t.integer :status
      t.integer :watch_id
      t.timestamps
    end
  end
end
