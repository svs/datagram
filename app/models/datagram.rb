class Datagram < ActiveRecord::Base

  belongs_to :user

  before_save :make_token

  def as_json(include_root = false)
    attributes.merge({
                       id: id.to_s,
                       watches: watches.map{|w| w.attributes.slice("name", "token","params")},
                       responses: response_data.to_a,
                       timestamp: (Time.at(max_ts/1000) rescue Time.now)
                     }).except("_id")
  end

  def response_json(params: {}, as_of: nil)
    {responses: Hash[response_data(params, as_of).map{|r| [r[:slug], r]}]}
  end

  def publish(params = {})
    publisher(params).publish!
  end

  def payload
    publisher.payload
  end


  def watches
    @watches ||= Watch.find(watch_ids) rescue []
  end

  private

  def publisher(params)
    @publisher ||= DatagramPublisher.new(datagram: self, params: params)
  end


  def max_ts
    last_update_timestamp
  end

  def response_data(params = {},as_of = nil)
    rs = all_responses(params, as_of).select('distinct on (watch_id) *').order('watch_id, report_time desc')
    @response_data ||= rs.map{|r| {
        slug: r.watch.slug,
        name: r.watch.name,
        data: r.response_json,
        errors: r.error,
        metadata: r.metadata,
      }}
  end

  def all_responses(params, as_of)
    params_clause = (params || {}).map{|k,v|
      v = v.gsub("'",%q(\\\')) # escape postgres single quotes
      "params->>'#{k}' = E'#{v}' "}.join(' AND ')
    @responses ||= WatchResponse.where(datagram_id: self.id).where(params_clause)
    if as_of
      @responses = @responses.where('report_time <= ?',DateTime.parse(as_of))
    end
    @responses
  end

  def make_token
    self.token ||= SecureRandom.urlsafe_base64
  end

end
