class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch:, params: {},exchange: $x, queue: $watches, datagram: nil, timestamp: nil, args: {}, routing_key: nil, refresh_channel: nil)
    @watch = watch
    params = params.stringify_keys if params
    @params = params.blank? ? (watch.params || {}) : watch.params.merge(params) # should use watch parameters when no parameters provided
    @exchange = exchange
    @queue = queue
    @datagram = datagram
    @timestamp = timestamp
    @args = {}
    @routing_key = routing_key || default_routing_key
    @refresh_channel = refresh_channel
  end

  def publish!()
    return false if published
    if make_new_response!
      exchange.publish(payload.to_json, routing_key: routing_key)
      if datagram
        $redis.hincrby("#{datagram.token}:#{timestamp}",watch.id,1)
      end
      Rails.logger.info "#WatchPublisher published watch #{watch.id} with routing_key #{routing_key}"
    end
    self.published = true
    @token
  end

  private
  attr_reader :watch, :params
  attr_accessor :published
  attr_reader :datagram, :timestamp, :args, :exchange, :refresh_channel, :routing_key

  def make_new_response!
    return false if published
    ts = timestamp || (Time.now.to_f)
    uniquifiers = {watch_id: watch.id, timestamp: ts, token: token, datagram_id: datagram.id, refresh_channel: refresh_channel}
    watch_response_data = watch.attributes.slice("strip_keys","keep_keys","transform").merge(started_at: ts, params: params)
    if !args[:preview]
      @response ||= WatchResponse.where(uniquifiers).first_or_create(watch_response_data)
    else
      @response ||= WatchResponse.create(uniquifiers.merge("datagram_id" => nil).
                                          merge(watch_response_data).merge(preview: true))

    end
    self.published = true
  end

  def published?
    published
  end

  def payload
    @payload ||= watch_attributes.merge(key: token, meta: args, datagram_id: datagram.token, timestamp: timestamp, refresh_channel: refresh_channel)
  end

  def watch_attributes
    watch.attributes.stringify_keys.merge("url" => watch_url, "data" => watch_data, "params" => params)
  end

  def watch_url
    watch.url ? (::Mustache.render(watch.url, params)) : watch.url
  end

  def watch_data
    watch.data ? JSON.parse(::Mustache.render(JSON.dump(watch.data), params).gsub("\\n"," ").gsub("&#39;","'")) : watch.data
  end

  def token
    @token ||= SecureRandom.urlsafe_base64
  end

  def default_routing_key
    "watch-#{watch.routing_key || "watches"}"
  end
end
