class WatchResponseHandler

  def initialize(params)
    @params = params
    ap params
  end

  def handle!
    wr = WatchResponse.find_by(token: params[:id])
    update_attrs = {
      response_json: data,
      status_code: params[:status_code],
      elapsed: params[:elapsed],
      response_received_at: Time.zone.now,
      error: params[:errors]
    }
    if wr.update(update_attrs)
      return {watch_token: wr.watch ? wr.watch.token : nil, watch_response_token: wr.token, modified: wr.modified}
    end
  end

  def data
    data = params[:data]
    data = data.is_a?(Array) ? {data: data} : data
    data.is_a?(String) ? JSON.parse(data) : data
  end

  private

  def params
    @params.with_indifferent_access
  end


end
