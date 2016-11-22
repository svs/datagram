class AddParamSetsToDatagrams < ActiveRecord::Migration
  def change
    add_column :datagrams, :param_sets, :json
  end
end
