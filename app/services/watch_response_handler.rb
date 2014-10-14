class WatchResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!
    Rails.logger.info "#WatchResponseHandler processing: #{params[:id]}"
    if wr
      update_attrs = {
        response_json: data,
        status_code: params[:status_code],
        elapsed: params[:elapsed],
        response_received_at: now,
        error: params[:errors],
        report_time: report_time
      }
      if wr.update(update_attrs)
        if watch
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

  def now
    @now ||= Time.zone.now
  end

  def report_time
    return @report_time if @report_time
    if watch.report_time
      jt = JsonPath.new(watch.report_time).on(data.to_json)[0]
      if jt.is_a?(Fixnum) #seconds since epoch
        @report_time = Time.strptime(jt.to_s,'%s')
      else
        @report_time = DateTime.parse(jt)
      end
    else
      @report_time ||= (wr.report_time || now)
    end
  end

  def wr
    @wr ||= WatchResponse.find_by(token: params[:id]) rescue nil
  end

  def watch
    @watch ||= wr.watch
  end

end
