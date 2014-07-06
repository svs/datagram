class Watch < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  validates :user_id, { presence: true }

  before_create :set_token

  def responses
    WatchResponse.where(watch_id: id)
  end

  def publish
    WatchPublisher.new(self).publish!
  end

 def as_json( include_root = false )
   if url
     uri = URI.parse(url)
     uri_parts = {
       :hostname => uri.hostname,
       :pathname => uri.path.gsub("/ /",""),
       :permalink => api_v1_watch_path(self)
     }
   end
   super.except(:url, :created_at, :updated_at, :diff).merge(uri_parts || {})
  end

  private

  def set_token
    self.token = SecureRandom.urlsafe_base64
  end


end
