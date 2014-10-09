class AddParamsToDatagram < ActiveRecord::Migration
  def change
    add_column :datagrams, :publish_params, :json
  end
end
