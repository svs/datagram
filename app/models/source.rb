class Source < ActiveRecord::Base
  belongs_to :user

  before_validation :set_protocol
  before_validation :set_name

  def as_json(include_root = false)
    {
      _id: self.id,
      name: self.name,
      protocol: self.protocol
    }
  end

  private

  def set_protocol
    uri = URI.parse(url) rescue nil
    if uri
      self.protocol = uri.scheme
    end
  end

  def set_name
    return true if self.name
    uri = URI.parse(url) rescue nil
    hname = uri.host.length > 15 ? uri.host.split(".")[0] : uri.host
    self.name = "#{uri.scheme}://#{hname}#{uri.path}"
  end

end
