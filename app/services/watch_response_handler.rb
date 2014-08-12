class WatchResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!
    wr = WatchResponse.find_by(token: params[:id]) rescue nil
    if wr
      Rails.logger.info "#WatchResponseHandler found token: #{params[:id]}"
      update_attrs = {
        response_json: data,
        status_code: params[:status_code],
        elapsed: params[:elapsed],
        response_received_at: Time.zone.now,
        error: params[:errors]
      }
      if wr.update(update_attrs)
        if watch = wr.watch
          watch.update_column(:last_response_token, params[:id])
          watch_token = watch.token
        end
        return {watch_token: watch_token || nil, watch_response_token: wr.token, modified: wr.modified}
        end
    else
      Rails.logger.info "#WatchResponseHandler No such watch_response #{params[:id]}"
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
