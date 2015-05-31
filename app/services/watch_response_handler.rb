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
        error: params[:error],
        report_time: report_time
      }
      if wr.update(update_attrs)
        if watch
          watch.update_column(:last_response_token, params[:id])
          watch_token = watch.token
        end
        $redis.hincrby(tracking_key, watch.id, (wr.modified ? -2 : -1)) if tracking_key
        if datagram
          datagram.update(last_update_timestamp: params[:timestamp])
        end

        return {watch_token: watch_token || nil, watch_response_token: wr.token, modified: modified?, complete: complete?, datagram: datagram, refresh_channel: wr.refresh_channel}
      end
    else
      Rails.logger.info "#WatchResponseHandler No such watch_response #{params[:id]}"
    end
  end

  def data
    d = params[:data]
    d = d.is_a?(String) ? JSON.parse(d) : d
    d.is_a?(Array) && d.length == 1 ? d[0] : d
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
        @report_time = DateTime.parse(jt) rescue nil
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

  def tracking_key
    params["datagram_id"] ? "#{params["datagram_id"]}:#{params["timestamp"]}" : nil
  end

  def tracking_data
    Hash[$redis.hgetall(tracking_key).map{|k,v| [k,v.to_i]}] rescue {}
  end

  def datagram
    @datagram ||= Datagram.where('token = ? AND (last_update_timestamp < ? OR last_update_timestamp is null)', params[:datagram_id], params[:timestamp]).last
  end

  def complete?
    datagram ? tracking_data.values.select{|x| x <= 0}.all? : true
  end

  def modified?
    datagram ? tracking_data.values.select{|x| x < 0}.any? : true
  end


end
