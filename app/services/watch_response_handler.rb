class WatchResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!

    context = {datagram: (datagram.token rescue ""), watch: watch.token, timestamp: timestamp}
    DgLog.new("#WatchResponseHandler processing: #{params[:id]}", context).log
    if wr
      update_attrs = {
        response_json: data,
        status_code: params[:status_code],
        elapsed: params[:elapsed],
        response_received_at: now,
        error: params[:error],
        report_time: nil
      }
      if wr.update(update_attrs)
        if watch
          watch.update_column(:last_response_token, params[:id])
          watch_token = watch.token
        end
        $redis.hincrby(tracking_key, watch.id, (wr.modified ? -2 : -1)) if tracking_key
        if datagram
          DgLog.new("#WatchResponseHandler updating last_updated on #{datagram.id} to #{params[:timestamp]}", binding).log
          datagram.update(last_update_timestamp: params[:timestamp])
        end

        return {watch_token: watch_token || nil,
                timestamp: params[:timestamp],
                watch_response_token: wr.token,
                modified: modified?,
                complete: complete?,
                datagram_token: (datagram? ? datagram.token : nil),
                refresh_channel: wr.refresh_channel}
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

  def datagram?
    datagram
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

  def timestamp
    @timestamp ||= params[:timestamp]
  end


end
