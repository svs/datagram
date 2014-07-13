class WatchResponse

  include Mongoid::Document
  include Mongoid::Timestamps

  before_validation :check_changed
  after_validation :strip_keys!

  field :watch_id, type: Integer
  field :datagram_id, type: String
  field :status_code, type: Integer
  field :response_received_at, type: DateTime
  field :round_trip_time, type: Float
  field :response_json, type: Hash
  field :error, type: Array
  field :signature, type: String
  field :modified, type: Boolean
  field :elapsed, type: Integer
  field :strip_keys, type: Hash
  field :keep_keys, type: Hash
  field :timestamp, type: Integer
  field :started_at, type: Integer
  field :ended_at, type: Integer
  field :token, type: String

  validates :token, uniqueness: { scope: :watch_id }


  def previous_response
    self.class.all.lt(timestamp: timestamp).last
  end

  def modified?
    modified
  end

  def watch
    @watch ||= (watch_id ? Watch.find(watch_id) : nil)
  end

  def watch=(watch)
    self.watch_id = watch.id
  end

  def as_json(x = nil)
    {
      data: response_json,
      errors: error,
      metadata: metadata
    }
  end

  def metadata
    attributes.slice("elapsed", "status_code", "token", "response_received_at")
  end

  private

  def check_changed
    if self.status_code
      self.signature = "v1>" + Base64.encode64(hmac("secret", response_json[:data].to_json + status_code.to_json)).strip
      self.modified = (self.signature != previous_response_signature)
      self.ended_at = (Time.now.to_f  * 1000).round
      self.round_trip_time = self.ended_at - self.started_at
    end
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


end
