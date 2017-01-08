class Watch < ActiveRecord::Base

  include Rails.application.routes.url_helpers
  include FriendlyId

  validates :user_id, { presence: true }
  belongs_to :user
  before_create :set_token

  friendly_id :name, use: :slugged

  has_many :watch_responses
  belongs_to :source
  def url
    source.try(:url) || read_attribute(:url)
  end

  def source_string
    source.try(:name) || url
  end

  def responses
    WatchResponse.where(watch_id: id)
  end

  def publish(args = {})
    publisher(args).publish!
  end

  def payload
    @payload ||= publisher.payload
  end

  def as_json( include_root = false )
    if url
     uri = URI.parse(url) rescue nil
      uri_parts = {
        :hostname => (uri.hostname rescue ''),
        :pathname => (uri.path.gsub("/ /","") rescue ''),
        :permalink => api_v1_watch_path(self),
        :data_link => api_v1_w_path(self.token)
      }
    end
    super.merge(source_string: source_string).except(:url, :created_at, :updated_at, :diff).merge(uri_parts || {})
  end

 def last_good_response
   w = WatchResponse.where(watch_id: id, status_code: 200).last
 end

 def routing_key
   self.use_routing_key ? self.token : (user.use_routing_key ? user.token : nil)
 end

  def refresh_channel(params)
    params = {token: self.token}.merge(params || {})
    Base64.urlsafe_encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha256'), "secret", params.to_json)).strip
  end


  private

  def set_token
    self.token = SecureRandom.urlsafe_base64
  end

  def publisher(args = {})
    p = {args: args}
    p.merge!(routing_key: routing_key) if use_routing_key
    p.merge!(watch: self)
    @publisher ||= WatchPublisher.new(p)
  end


end
