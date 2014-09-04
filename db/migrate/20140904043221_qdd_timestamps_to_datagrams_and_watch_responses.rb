class QddTimestampsToDatagramsAndWatchResponses < ActiveRecord::Migration
  def change
    add_column(:datagrams, :created_at, :datetime)
    add_column(:datagrams, :updated_at, :datetime)

    add_column(:watch_responses, :created_at, :datetime)
    add_column(:watch_responses, :updated_at, :datetime)

  end
end
