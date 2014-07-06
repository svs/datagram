class WatchPublisher

  # Creates a WatchResponse object to log the fact that a Watch was published
  # and to store the response when it is received

  def initialize(watch)
    @watch = watch
  end

  def publish!(exchange: $x, queue: $q)
    return false if published
    exchange.publish(payload.to_json, routing_key: queue.name)
    self.published = true
  end

  def published?
    published
  end


  def payload
    watch.attributes.merge(key: response.token)
  end

  private
  attr_reader :watch
  attr_accessor :published



  def response
    ts = (Time.now.to_f  * 1000).round
    @response ||= WatchResponse.where(watch_id: watch.id,
                                      strip_keys: watch.strip_keys,
                                      timestamp: ts,
                                      started_at: ts).first_or_create
  end




end
