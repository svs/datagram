class DatagramResponseFinder

  def initialize(datagram, params = DatagramFetcherService::Params.new, max_size = Float::INFINITY)
    raise ArgumentError unless params.is_a?(DatagramFetcherService::Params)
    @datagram = datagram
    @q_params = params.q_params
    @staleness = params.staleness
    @max_size = max_size
  end

  def response
    rs = all_responses(params).
    select('distinct on (watch_id) *').
    order('watch_id, timestamp desc')
    if staleness
      rs = rs.where('extract(epoch from (? - response_received_at)) < ?', Time.zone.now, staleness)
    end
    ap rs.to_sql
    rs

  end


  private

  attr_reader :datagram, :staleness, :max_size

  def params
    ParamsRenderer.new({},@params).real_data
  end

  def all_responses(search_params)
    # filters responses for watch params
    return @responses if @responses
    @responses = WatchResponse.where(watch_id: datagram.watch_ids, datagram_id: datagram.id, status_code: 200, complete: true).
                 where('response_json is not null')
    if !search_params.blank?
      @responses = @responses.where('params @> ?', params.to_json)
    end
    @responses
  end




end
