class Source < ActiveRecord::Base
  belongs_to :user

  before_validation :set_protocol

  private

  def set_protocol
    uri = URI.parse(url) rescue nil
    if uri
      self.protocol = uri.scheme
    end
  end
end
