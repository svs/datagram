class ChangeWatchResponsesParamsToJsonb < ActiveRecord::Migration
  def change
    execute "ALTER TABLE watch_responses ALTER COLUMN params SET DATA TYPE jsonb USING params::jsonb"
  end
end
