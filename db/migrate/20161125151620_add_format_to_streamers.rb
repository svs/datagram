class AddFormatToStreamers < ActiveRecord::Migration
  def change
    add_column :streamers, :format, :string
  end
end
