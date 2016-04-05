class DatagramPublisher
  include Hmac
  # Publishes a datagram to RabbitMQ
  # Datagram#publish_params are merged with @params and sent to each WatchPublisher.
  # Name conflicts in Watch params are not yet handled

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
    publishers.map(&:publish!)
    @published = true
    DgLog.new("#DatagramPublisher published datagram routing_key: #{routing_key} params: #{params} refresh_channel: #{refresh_channel}", binding).log
    return refresh_channel
  end

  private

  attr_reader :datagram, :exchange, :queue, :timestamp, :user, :refresh_channel

  def publishers
    watches.map{|w| WatchPublisher.new(watch: w, params: params,
                                       exchange: exchange,
                                       queue: queue,
                                       datagram: datagram,
                                       timestamp: timestamp,
                                       refresh_channel: refresh_channel,
                                       routing_key: routing_key
                                       )}
  end

  def params
    (datagram.publish_params || {}).merge(@params || {})
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
