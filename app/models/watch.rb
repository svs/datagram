class Watch < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  validates :user_id, { presence: true }
  belongs_to :user
  before_create :set_token

  def responses
    WatchResponse.where(watch_id: id)
  end

  def publish(args = {})
    publisher.publish!(args: args)
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
       :permalink => api_v1_watch_path(self)
     }
   end
   super.except(:url, :created_at, :updated_at, :diff).merge(uri_parts || {})
  end

  private

  def set_token
    self.token = SecureRandom.urlsafe_base64
  end

  def publisher
    @publisher ||= WatchPublisher.new(self)
  end


end
