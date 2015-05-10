class ChangeErrorColumnToText < ActiveRecord::Migration
  def change
    rename_column :watch_responses, :error, :error_json
    add_column :watch_responses, :error, :text
  end
end
