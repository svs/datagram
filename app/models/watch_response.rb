class WatchResponse

  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  before_validation :check_changed

  field :watch_id, type: Integer
  field :status_code, type: Integer
  field :response_received_at, type: DateTime
  field :round_trip_time, type: Float
  field :response_json, type: Hash
  field :diff, type: Hash
  field :signature, type: String
  field :modified, type: Boolean

  field :previous_response_token, type: String
  token length: 10

  def previous_response
    self.class.find(previous_response_token) rescue nil
  end

  def modified?
    modified
  end

  private

  def check_changed
    if self.status_code
      self.signature = "v1>" + Base64.encode64(hmac("secret", response_json[:data].to_json)).strip
      self.modified = (self.signature != previous_response_signature)
      self.round_trip_time = DateTime.now.to_f - created_at.to_f
    end

  end

  def previous_response_signature
    previous_response.signature rescue {}
  end

  def hmac(key, value, digest = 'sha256')
    OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new(digest), key, value)
  end




end
