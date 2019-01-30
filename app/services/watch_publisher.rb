class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch:, params: {},exchange: $x, queue: $watches, datagram: nil, timestamp: nil, args: {}, routing_key: nil, refresh_channel: nil, datagram_uid: nil)
    Rails.logger.info "\n#WatchPublisher params #{params}"
    @watch = watch
    params = params.stringify_keys if params
    @params = params.blank? ? (watch.params || {}) : (watch.params || {}).merge(params) # should use watch parameters when no parameters provided
    @exchange = exchange
    @queue = queue
    @datagram = datagram || null_datagram
    @timestamp = (timestamp || Time.now).to_f
    @args = {}
    @routing_key = routing_key || default_routing_key
    @refresh_channel = refresh_channel
    @datagram_uid = datagram_uid
  end

  def publish!()
    if make_new_response!
      exchange.publish(payload.to_json, routing_key: routing_key)
      if datagram
        $redis.hincrby(redis_tracking_key,watch.id,1)
      end
      DgLog.new("#WatchPublisher published watch token: #{@response.token}, rkey: #{routing_key}, params: #{params}", binding).log
    end
    self.published = true
    refresh_channel
  end

  private
  attr_reader :watch, :params
  attr_accessor :published
  attr_reader :datagram, :timestamp, :args, :exchange, :routing_key, :datagram_uid

  def make_new_response!
    #return false if published
    uniquifiers = {watch_id: watch.id, timestamp: timestamp, token: token, datagram_id: datagram.id, refresh_channel: refresh_channel, datagram_uid: datagram_uid}
    watch_response_data = watch.attributes.slice("strip_keys","keep_keys","transform").merge(started_at: timestamp, params: real_params)
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
    @payload ||= watch_attributes.merge(key: token, meta: args, datagram_id: datagram.token, timestamp: timestamp, refresh_channel: refresh_channel, context: context)
  end

  def watch_attributes
    watch.attributes.stringify_keys.merge("url" => watch_url, "data" => watch_data, "params" => params)
  end

  def real_params
    WatchParamsRenderer.new(watch, params).real_params
  end

  def watch_url
    url = ((watch.source && watch.source.url) || watch.url)
    u = ::Mustache.render(url, params)
    u.gsub('drive://',"drive://#{watch.user.google_token}@")
  end

  def watch_data
    WatchParamsRenderer.new(watch, params).render
  end

  def token
    @token ||= SecureRandom.urlsafe_base64
  end

  def default_routing_key
    "watch-#{watch.routing_key || "watches"}"
  end

  def refresh_channel
    @refresh_channel || watch.refresh_channel(params)
  end

  def null_datagram
    OpenStruct.new(id: nil, token: nil)
  end

  def redis_tracking_key
    "#{datagram.token}:#{timestamp.to_i}"
  end

  def context
    {datagram: datagram.slug, watch: watch.slug, user: watch.user.id, timestamp: timestamp, channel: refresh_channel}
  end
end
