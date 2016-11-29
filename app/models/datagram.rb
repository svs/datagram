class Datagram < ActiveRecord::Base
  include Hmac
  belongs_to :user
  belongs_to :source
  has_many :streamers
  has_many :stream_sinks, through: :streamers
  before_save :make_token_and_slug
  before_save :make_param_sets
  accepts_nested_attributes_for :streamers


  include Rails.application.routes.url_helpers

  def as_json(include_root = false, max_size = Float::INFINITY)
    attributes.merge({
                       id: id.to_s,
                       private_url: private_url,
                       public_url: public_url,
                       watches: watches.map{|w| w.attributes.slice("name", "token","params","id","slug")},
                       timestamp: (Time.at(max_ts/1000) rescue Time.now),
                       publish_params: publish_params,
                       stream_sinks: streamers
                     }).except("_id")
  end


  # calls DatagramPublisher.publish! passing on the given hash.
  def publish(params = {}, streamer = nil)
    Rails.logger.info "#Publish #{params}"
    publisher(params, streamer).publish!
  end

  def payload
    publisher.payload
  end


  def watches
    @watches ||= Watch.find(watch_ids) rescue []
  end

  def private_url
    api_v1_t_path(slug: slug, api_key: user.token) rescue ""
  end

  def public_url
    api_v1_d_path(token: token, format: :json) rescue ""
  end

  def refresh_channel(params)
    params = {token: self.token}.merge(params || {}).deep_sort
    Base64.urlsafe_encode64(hmac("secret", params.to_json)).strip
  end

  def reset!
    @response_data = nil
  end

  def routing_key
    self.use_routing_key ? self.token : (user.use_routing_key ? user.token : nil)
  end

  def uid
    uid_for_params(params)
  end


  private

  def publisher(params = nil, streamer = nil)
    DatagramPublisher.new(datagram: self, params: params, streamer: streamer)
  end


  def max_ts
    last_update_timestamp
  end


  def all_responses(search_params, as_of)
    # filters responses for watch params
    return @responses if @responses
    params_clause = (search_params || {}).map{|k,v|
      v = v.gsub("'",%q(\\\')) # escape postgres single quotes
      "params->>'#{k}' = E'#{v}' "}.join(' AND ')
    # and for those where there is no response yet (crashed, timedout, still processing....)
    @responses = WatchResponse.where(watch_id: self.watch_ids, datagram_id: self.id).where('response_json is not null')
    # execute search filter
    if !search_params.blank?
      @responses = @responses.where(params_clause)
    end
    @responses
  end

  def make_token_and_slug
    self.token ||= SecureRandom.urlsafe_base64
    self.slug ||= name.parameterize
  end

  def make_param_sets
    self.param_sets ||= {"__default" => {"name" => nil, "params" => publish_params}}
  end

  def uid_for_params(params)
    "v1>" + Base64.encode64(hmac("secret",{datagram_id: datagram.id, params: params.deep_sort}.deep_sort.to_json))
  end

end
