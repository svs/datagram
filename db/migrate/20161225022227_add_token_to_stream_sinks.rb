class AddTokenToStreamSinks < ActiveRecord::Migration
  def change
    add_column :stream_sinks, :token, :string
  end
end
