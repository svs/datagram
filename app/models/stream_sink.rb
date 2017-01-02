class StreamSink < ActiveRecord::Base
  has_many :streamers
  has_many :datagrams, through: :streamers

  before_save :set_token

  private

  def set_token
    self.token ||= SecureRandom.urlsafe_base64
  end

end
