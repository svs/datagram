class RemoveStreamSinkAndAddResponseAndUrlToStreamer < ActiveRecord::Migration
  def change
    remove_column :streamers, :stream_sink, :jsonb
    add_column :streamers, :response_json, :jsonb
    add_column :streamers, :last_run_at, :datetime
  end
end
