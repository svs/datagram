class Datagram

  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  field :name
  field :watch_ids, type: Array
  field :frequency, type: Integer
  field :at, type: String

  field :user_id, type: Integer

  token length: 10


  def as_json(include_root = false)
    attributes.merge({
                       id: _id.to_s,
                       watches: watches.map{|w| w.attributes.slice("name", "token")},
                       responses: responses.to_a,
                       timestamp: (Time.at(max_ts/1000) rescue Time.now)
                     }).except("_id")
  end

  def publish
    publisher.publish!
  end

  def payload
    publisher.payload
  end


  def watches
    @watches ||= Watch.find(watch_ids) rescue []
  end

  private



  def publisher
    @publisher ||= DatagramPublisher.new(datagram: self)
  end


  def max_ts
    @max_ts ||= responses.max(:timestamp)
  end

  def response_data
    @response_data ||= responses.where(timestamp: max_ts).map{|r| {name: r.watch.name, data: r.response_json, errors: r.error, metadata: r.metadata}}
  end

  def responses
    @responses ||= WatchResponse.where(datagram_id: self.id)
  end

end
