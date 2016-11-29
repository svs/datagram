class AddFrequencyAndAtToStreamers < ActiveRecord::Migration
  def change
    add_column :streamers, :frequency, :integer
    add_column :streamers, :at, :string
  end
end
