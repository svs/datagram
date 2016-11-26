class CreateStreamSinks < ActiveRecord::Migration
  def change
    create_table :stream_sinks do |t|
      t.string :name
      t.string :stream_type
      t.jsonb :data

      t.timestamps null: false
    end
  end
end
