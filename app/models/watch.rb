class Watch < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  validates :user_id, { presence: true }

  before_create :set_token

  def publish(exchange: $x, queue: $q, callback_host: "http://localhost:3000")
    log!
    callback_url = "#{callback_host}/watch_responses/#{@key}"
    d = attributes.merge("key" => @key, "callback_url" => callback_url)
    exchange.publish(d.to_json, routing_key: queue.name)
    @key
  end

  def responses
    WatchResponse.where(watch_id: id)
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

  def log!
    WatchResponse.create(watch_id: self.id, previous_response_token: previous_response_token, strip_keys: strip_keys).tap{|d|
      @key = d.token
    }
  end

  def previous_response_token
    WatchResponse.where(watch_id: self.id).last.token rescue nil
  end

  def set_token
    self.token = SecureRandom.urlsafe_base64
  end


end
