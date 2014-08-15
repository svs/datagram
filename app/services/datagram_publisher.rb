class DatagramPublisher

  # Publsihes a datagram to RabbitMQ
  #

  def initialize(datagram:, exchange: $x, queue: $datagrams)
    @datagram = datagram
    @exchange = exchange
    @queue = queue
    @timestamp = (Time.now.to_f * 1000).round
    @user = datagram.user
  end


  def publish!
    return false if @published
    x = watch_publishers.map{|wp| wp.publish!(exchange: nil, datagram_id: datagram.id, timestamp: timestamp)}
    exchange.publish(payload.to_json, routing_key: routing_key)
    @published = true
    Rails.logger.info "#DatagramPublisher published datagram #{datagram.id}"
    payload
  end


  def payload
    @payload ||= {
      datagram_id: datagram.id.to_s,
      timestamp: (Time.now.to_f  * 1000).round,
      watches: watches_payload,
      routing_key: routing_key,
      datagram_token: datagram.token,
      timestamp: timestamp
    }
  end

  private

  attr_reader :datagram, :exchange, :queue, :timestamp, :user


  def watch_publishers
    @watch_publishers ||= datagram.watches.map{|w|
      WatchPublisher.new(w)
    }
  end

  def watches_payload
    watch_publishers.map(&:payload)
  end

  def watches
    @watches ||= datagram.watches
  end

  def routing_key
    "datagram:#{datagram.use_routing_key ? user.token : queue.name}"
  end

end
