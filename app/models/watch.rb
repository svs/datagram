class Watch < ActiveRecord::Base

  validates :user_id, { presence: true }
  validates :frequency, { presence: true }


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
   uri = URI.parse(url)
   super.except(:url, :created_at, :updated_at, :diff).merge(
     :hostname => uri.hostname,
     :pathname => uri.path.gsub("/ /","")
   )
  end

  private

  def log!
    WatchResponse.create(watch_id: self.id, previous_response_token: previous_response_token).tap{|d|
      @key = d.token
    }
  end

  def previous_response_token
    WatchResponse.where(watch_id: self.id).last.token rescue nil
  end


end
