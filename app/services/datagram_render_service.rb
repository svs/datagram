class DatagramRenderService

  # Given a datagram and params, this class renders the response.
  # It calls the appropriate view loader and view renderers to do this.
  # If a synchronous refresh is required it handles the complexity around that.

  def initialize(datagram, params = {}, format = :json)
    @datagram = datagram
    @params = params
    ap params
  end

  def render(views = [])
    Array(views).compact.reduce(raw_json){|result, view| result = _render(result, view)}
  end



  attr_reader :datagram, :params

  def raw_json
    rc = datagram.refresh_channel(params[:params])
    staleness = (Integer(params[:refresh]) rescue nil) || params[:staleness]
    sync = params[:sync] != "false"
    response = datagram.response_json(params: params[:params],
                                      as_of: params[:as_of],
                                      staleness: staleness).merge(refresh_channel: rc)
    if params[:refresh] && response[:responses].blank?
      if sync
        $redis.setex(rc, 10, 0)
      end
      datagram.publish(params[:params] || {})
      if sync
        done = false
        while (!done) do
          t = Time.now
          v = $redis.get(rc)
          if v == nil
            Rails.logger.info "#DatagramController TIMEOUT #{rc}"
          end
          done = v != "0"
          sleep 0.2
        end
        datagram.reset!
        response = datagram.response_json(params: params[:params], as_of: params[:as_of]).merge(refresh_channel: rc)
      end
    end
    response
  end

  def _render(json, view)
    v = DatagramViewLoader.new(datagram, view).load
    return ViewRenderer.new(v, json, params, filename(view)).render
  end

  def filename(view)
    "#{datagram.refresh_channel(params)}-#{view}-#{datagram.last_update_timestamp}.png"
  end

end
