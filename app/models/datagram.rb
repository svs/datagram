class Datagram < ActiveRecord::Base

  belongs_to :user

  before_save :make_token

  def as_json(include_root = false)
    attributes.merge({
                       id: id.to_s,
                       watches: watches.map{|w| w.attributes.slice("name", "token")},
                       responses: response_data.to_a,
                       timestamp: (Time.at(max_ts/1000) rescue Time.now)
                     }).except("_id")
  end

  def response_json(time = nil)
    {responses: Hash[response_data.map{|r| [r[:slug], r]}]}
  end

  def publish(params: {})
    publisher.publish!(params)
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
    last_update_timestamp
  end

  def response_data(timestamp = nil)
    if timestamp
      rs = all_responses.where('timestamp < ?', timestamp).last
    else
      rs = all_responses.where(timestamp: max_ts)
    end
    @response_data ||= rs.map{|r| {
        slug: r.watch.slug,
        name: r.watch.name,
        data: r.response_json,
        errors: r.error,
        metadata: r.metadata
      }}
  end

  def all_responses
    @responses ||= WatchResponse.where(datagram_id: self.id)
  end

  def make_token
    self.token ||= SecureRandom.urlsafe_base64
  end

end
