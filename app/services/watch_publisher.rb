class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch)
    @watch = watch
  end

  def publish!(exchange: $x, queue: $watches, datagram_id: nil, timestamp: nil, args: {}, params: params)
    if make_new_response!(datagram_id: datagram_id, timestamp: timestamp, args: args)
      exchange.publish(payload(args).to_json, routing_key: routing_key)
      Rails.logger.info "#WatchPublisher published watch #{watch.id} with routing_key #{routing_key}"
    end
    self.published = true
    @token
  end


  def make_new_response!(datagram_id: nil, timestamp: nil, args: {}, params: {})
    params = watch.params if params.empty?
    ap params

    return false if published
    ts = timestamp || (Time.now.to_f)
    if !args[:preview]
      @response ||= WatchResponse.where(watch_id: watch.id,
                                        timestamp: ts,
                                        token: token,
                                        datagram_id: datagram_id,
                                        ).first_or_create(strip_keys: watch.strip_keys,
                                                          keep_keys: watch.keep_keys,
                                                          started_at: ts,
                                                          params: params)
    else
      @response ||= WatchResponse.create(watch_id: watch.id,
                                         timestamp: ts,
                                         token: token,
                                         datagram_id: "nil",
                                         strip_keys: watch.strip_keys,
                                         keep_keys: watch.keep_keys,
                                         started_at: ts,
                                         preview: true,
                                         params: params)
    end
    self.published = true
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



  def token
    @token ||= SecureRandom.urlsafe_base64
  end


  def routing_key
    "watch:#{watch.use_routing_key ? watch.user.token : "watches"}"
  end


end
