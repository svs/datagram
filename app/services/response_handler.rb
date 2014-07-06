class ResponseHandler

  def initialize(params)
    @params = params
    Rails.logger.ap params
  end

  def handle!
    wr = WatchResponse.find(params[:id])
    update_attrs = {
      response_json: {data: data},
      status_code: params[:status_code],
      elapsed: params[:elapsed],
      response_received_at: Time.zone.now,
      error: params[:errors]
    }
    if wr.update(update_attrs)
      begin
        Rails.logger.info "Pushing watch id: #{wr.watch_id} to channel #{wr.watch.token}"
        d = {token: wr.token, modified: wr.modified}
        Pusher.trigger(wr.watch.token, 'data', d)
      end
    end
  end

  def data
    params[:data]
  end

  private

  def params
    @params.with_indifferent_access
  end


end
