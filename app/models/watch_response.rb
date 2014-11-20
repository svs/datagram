class WatchResponse < ActiveRecord::Base

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
      metadata: metadata
    }
  end

  def metadata
    attributes.slice("elapsed", "status_code", "token", "response_received_at", "report_time").
      merge("staleness" => Time.zone.now - response_received_at)
  end

  def diff_with(token)
    wr = WatchResponse.find_by(token: token)
    diff = HashDiff.diff(self.response_json, wr.response_json)
  end



  private

  def check_changed
    strip_keys!
    json2json!
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
    ((response_json || {}).merge(status_code: status_code)).to_json
  end

  def json2json!
    return if response_json.blank?
    return unless self.transform
    self.response_json = Json2Json.transform(self.response_json, self.transform)
  end

  def previous_response_signature
    previous_response.signature rescue {}
  end

  def hmac(key, value, digest = 'sha256')
    OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new(digest), key, value)
  end

  def strip_keys!
    return if response_json.blank?
    if keep_keys && !keep_keys.empty?
      self.response_json = HashFilter.keep(self.response_json, keep_keys)
    end
    if strip_keys
      self.response_json = HashFilter.drop(response_json, strip_keys)
    end
  end

  def set_timestamp
    self.timestamp ||= Time.zone.now
  end

  def set_token
    self.token ||= SecureRandom.base64(20)
  end

  def previous_response
    self.class.where('id < ? and watch_id = ?', id, watch_id).last if id
  end

  def set_bytesize
    self.bytesize = self.response_json.to_json.bytesize
  end

end
