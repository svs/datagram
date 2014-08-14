class Datagram

  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  field :name
  field :watch_ids, type: Array
  field :frequency, type: Integer
  field :at, type: String

  field :user_id, type: Integer
  field :last_update_timestamp, type: Integer
  token length: 10


  def user
    User.find(user_id)
  end

  def as_json(include_root = false)
    attributes.merge({
                       id: _id.to_s,
                       watches: watches.map{|w| w.attributes.slice("name", "token")},
                       responses: response_data.to_a,
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

  def self.find_by_name(name)
    Datagram.find_by(name: name)
  end


  private



  def publisher
    @publisher ||= DatagramPublisher.new(datagram: self)
  end


  def max_ts
    last_update_timestamp
  end

  def response_data
    @response_data ||= responses.where(timestamp: max_ts).map{|r| {name: r.watch.name, data: r.response_json, errors: r.error, metadata: r.metadata}}
  end

  def responses
    @responses ||= WatchResponse.where(datagram_id: self.id)
  end

end
