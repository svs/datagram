class AddThumbnailUrlToWatchResponses < ActiveRecord::Migration
  def change
    add_column :watch_responses, :thumbnail_url, :string
  end
end
