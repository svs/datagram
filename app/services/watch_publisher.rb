class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch)
    @watch = watch
  end

  def publish!(exchange: $x, queue: $watches)
    return false if published
    make_new_response!
    if exchange
      exchange.publish(payload.to_json, routing_key: queue.name)
    end
    self.published = true
    @token
  end

  def published?
    published
  end

  def payload
    @payload ||= watch.attributes.merge(key: token)
  end



  private
  attr_reader :watch
  attr_accessor :published


  def make_new_response!
    ts = (Time.now.to_f  * 1000).round
    @response ||= WatchResponse.where(watch_id: watch.id,
                                      strip_keys: watch.strip_keys,
                                      timestamp: ts,
                                      started_at: ts,
                                      token: token).first_or_create
  end

  def token
    @token ||= SecureRandom.urlsafe_base64
  end


end
