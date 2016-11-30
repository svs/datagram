class WatchResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!
    context = {datagram: (datagram.token rescue ""), watch: (watch.token rescue nil), timestamp: timestamp}
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
        if datagram
          $redis.hincrby(redis_tracking_key, watch.id, (wr.modified ? -2 : -1)) if redis_tracking_key
          DgLog.new("#WatchResponseHandler updating last_updated on #{datagram.id} to #{params[:timestamp]}", binding).log
          datagram.update(last_update_timestamp: params[:timestamp])
          Rails.logger.info("#Complete? #{complete?}")
          if complete?
            DgLog.new("#WatchResponseHandler complete - deleting all watch responses for datagram #{datagram.id} before #{params[:timestamp]}", binding).log
            WatchResponse.where(datagram_id: datagram.id, timestamp: params[:timestamp]).update_all(complete:true)
            WatchResponse.where('datagram_id = ? AND  timestamp < ? AND params @> ?', datagram.id, params[:timestamp], wr.params.to_json).destroy_all
            streamer_id = $redis.hget(redis_tracking_key, "streamer_id")
            ap "#StreamerId #{streamer_id} !!!!!!!!!!!!!!!"
            Streamer.find(streamer_id).render if streamer_id
            $redis.del(redis_tracking_key)
          end
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


  def tracking_data
    Hash[$redis.hgetall(redis_tracking_key).map{|k,v| [k,v.to_i]}] rescue {}
  end

  def datagram?
    datagram
  end

  def datagram
    @datagram ||= (Datagram.where('token = ? AND (last_update_timestamp < ? OR last_update_timestamp is null)', params[:datagram_id], params[:timestamp]).last)
  end

  def complete?
    DgLog.new("#WatchResponseHandler tracking data #{redis_tracking_key} => #{tracking_data}", binding).log
    datagram ? tracking_data.values.select{|x| x.to_i <= 0}.all? : true
  end

  def modified?
    datagram ? tracking_data.values.select{|x| x < 0}.any? : true
  end

  def timestamp
    @timestamp ||= params[:timestamp]
  end

  def null_datagram
    OpenStruct.new(id: nil, token: nil)
  end

  def redis_tracking_key
    "#{datagram.token}:#{timestamp.to_i}" rescue nil
  end
end
