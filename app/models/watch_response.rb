class WatchResponse

  include Mongoid::Document
  include Mongoid::Token
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
  field :timestamp, type: Integer
  field :started_at, type: Integer
  field :ended_at, type: Integer

  token length: 10


  def previous_response
    self.class.all.lt(timestamp: timestamp).last
  end

  def modified?
    modified
  end

  def watch
    @watch ||= Watch.find(watch_id)
  end

  def watch=(watch)
    self.watch_id = watch.id
  end

  def as_json(x = nil)
    {
      data: response_json[:data],
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
      self.signature = "v1>" + Base64.encode64(hmac("secret", response_json[:data].to_json)).strip
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
    _strip_keys(strip_keys, response_json)
  end

  def _strip_keys(keys, hash)
    Array(keys).map do |k, v|
      if !v.is_a?(Hash)
        Array(v).map do |_v|
          hash[k].delete(_v)
        end
      else
        _strip_keys(v, hash[k])
      end
    end
  end





end
