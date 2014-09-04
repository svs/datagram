class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch)
    @watch = watch
  end

  def publish!(exchange: $x, queue: $watches, datagram_id: nil, timestamp: nil, args: {})
    return false if published
    make_new_response!(datagram_id, timestamp, args)
    if exchange
      exchange.publish(payload(args).to_json, routing_key: routing_key)
      Rails.logger.info "#WatchPublisher published watch #{watch.id} with routing_key #{routing_key}"
    end
    self.published = true
    @token
  end

  def published?
    published
  end

  def payload(args = {})
    @payload ||= watch.attributes.merge(key: token).merge(meta: args)
  end



  private
  attr_reader :watch
  attr_accessor :published


  def make_new_response!(datagram_id = nil, timestamp = nil, args = {})
    ts = timestamp || (Time.now.to_f)
    if !args[:preview]
      @response ||= WatchResponse.where(watch_id: watch.id,
                                      timestamp: ts,
                                      token: token,
                                      datagram_id: datagram_id).first_or_create(strip_keys: watch.strip_keys,
                                                                                keep_keys: watch.keep_keys,
                                                                                started_at: ts)
    else
      @response ||= WatchResponse.create(watch_id: watch.id,
                                         timestamp: ts,
                                         token: token,
                                         datagram_id: "nil",
                                         strip_keys: watch.strip_keys,
                                         keep_keys: watch.keep_keys,
                                         started_at: ts,
                                         preview: true)
    end
  end

  def token
    @token ||= SecureRandom.urlsafe_base64
  end


  def routing_key
    "watch:#{watch.use_routing_key ? watch.user.token : "watches"}"
  end


end
