class DatagramPublisher
  include Hmac
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
    #return false if @published
    watches.map{|w| WatchPublisher.new(watch: w, params: publish_params[w.id.to_s],
                                       exchange: exchange,
                                       queue: queue,
                                       datagram: datagram,
                                       timestamp: timestamp,
                                       refresh_channel: refresh_channel,
                                       routing_key: routing_key
                                       ).publish!
    }
    @published = true
    DgLog.new("#DatagramPublisher published datagram routing_key: #{routing_key} params: #{params} refresh_channel: #{refresh_channel}", binding).log
    return refresh_channel
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


  def watches
    @watches ||= datagram.watches
  end

  def routing_key
    if datagram.use_routing_key
      "datagram-#{datagram.routing_key}"
    else
      nil
    end
  end


end
