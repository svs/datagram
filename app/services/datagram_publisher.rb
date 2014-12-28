class DatagramPublisher

  # Publishes a datagram to RabbitMQ
  #
  # if params are provided,
  #    if params is a Hash with watch_ids as keys,
  #      then each watch is published with the corresponding params
  #    else each watch is published with the given params merged with its own default params
  # else each watch is published with the datagrams default params
  # if the datagram does not have default params
  #   the watches params are used
  #
  def initialize(datagram:, exchange: $x, queue: $datagrams, params: {})
    @datagram = datagram
    @exchange = exchange
    @queue = queue
    @timestamp = (Time.now.to_f).round
    @user = datagram.user
    @params = params
    @refresh_channel = datagram.refresh_channel(params)
  end


  # Returns the channel on which updates to this datagram-param combination will be published
  def publish!
    return false if @published
    exchange.publish(payload.to_json, routing_key: routing_key)
    @published = true
    Rails.logger.info "#DatagramPublisher published datagram id: #{datagram.id} token: #{datagram.token} routing_key: #{routing_key} params: #{params} refresh_channel: #{refresh_channel}"
    return refresh_channel
  end


  def payload
    return @payload if @payload
    watch_publishers.map{|wp| wp.make_new_response!(datagram_id: datagram.id, timestamp: timestamp)}
    @payload ||= {
      datagram_id: datagram.token.to_s,
      watches: watches_payload,
      routing_key: routing_key,
      datagram_token: datagram.token,
      timestamp: timestamp,
      refresh_channel: refresh_channel,
      response_q: $datagram_responses.name
    }
  end

  def channel_name
    datagram.refresh_channel(params)
  end


  private

  attr_reader :datagram, :exchange, :queue, :timestamp, :user, :refresh_channel

  def publish_params
    params_keys_are_subset_of_watch_ids? ? params.stringify_keys : Hash[datagram.watches.map{|w| [w.id.to_s, params]}]
  end

  def params
    @params.blank? ? (datagram.publish_params || {}) : @params
  end

  def params_keys_are_subset_of_watch_ids?
    param_keys = Set.new(params.keys.map(&:to_i))
    watch_ids = Set.new(datagram.watches.map(&:id))
    param_keys.subset?(watch_ids)
  end

  def watch_publishers
    @watch_publishers ||= datagram.watches.map{|w|
      WatchPublisher.new(w, publish_params[w.id.to_s])
    }
  end

  def watches_payload
    watch_publishers.map(&:payload)
  end

  def watches
    @watches ||= datagram.watches
  end

  def routing_key
    "datagram-#{datagram.routing_key || 'datagrams'}"
  end


end
