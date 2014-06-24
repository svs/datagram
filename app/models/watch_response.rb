class WatchResponse

  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  before_validation :calc_diff

  field :watch_id, type: Integer
  field :status_code, type: Integer
  field :response_received_at, type: DateTime
  field :round_trip_time, type: Float
  field :response_json, type: Hash
  field :diff, type: Hash

  field :previous_response_token, type: String
  token length: 10

  def previous_response
    self.class.find(previous_response_token) rescue nil
  end

  def mark_response(response)
    update(response)
  end

  private

  def calc_diff
    if self.status_code
      self.diff = {"data" => HashDiff.diff(previous_response_data, response_json["data"])}
    end
    self.round_trip_time = DateTime.now.to_f - created_at.to_f

  end

  def previous_response_data
    previous_response.response_json["data"] rescue {}
  end





end
