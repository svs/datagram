class WatchResponse < ActiveRecord::Base
  include Hmac
  belongs_to :watch
  before_validation :check_changed
  before_create :set_timestamp
  before_create :set_token
  before_save :set_bytesize

  validates :token, uniqueness: { scope: :watch_id }

  def modified?
    modified
  end

  def as_json(x = nil)
    {
      data: response_json,
      errors: error,
      metadata: metadata,
      params: params
    }
  end

  def metadata
    attributes.slice("elapsed", "status_code", "token", "response_received_at", "timestamp").
      merge("staleness" => Time.zone.now - response_received_at)
  end

  private

  def check_changed
    self.signature = sig
    if (id && status_code)
      self.modified = (self.signature != previous_response_signature)
      self.ended_at ||= Time.zone.now
      self.round_trip_time ||= (self.ended_at - self.started_at) rescue 0
    end
    return true
  end

  def sig
    "v1>" + Base64.encode64(hmac("secret", sig_data))
  end

  def sig_data
    (({data: response_json}).merge(status_code: status_code)).to_json
  end

  def uid_data
    {watch_id: watch_id, datagram_id: datagram_id, params: params.deep_sort}.deep_sort.to_json
  end

  def previous_response_signature
    previous_response.signature rescue {}
  end

  def set_timestamp
    self.timestamp ||= Time.zone.now
  end

  def set_token
    self.token ||= SecureRandom.base64(20)
    self.uid ||=   "v1>" + Base64.encode64(hmac("secret", uid_data))

  end

  def previous_response
    self.class.where('id < ? and uid = ?', id, uid).last if id
  end

  def set_bytesize
    self.bytesize = self.response_json.to_json.bytesize
  end

end
