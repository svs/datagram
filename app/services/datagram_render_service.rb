
class DatagramRenderService

  def initialize(datagram, params = {})
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
    response = datagram.response_json(params: params[:params],
                                      as_of: params[:as_of],
                                      staleness: params[:staleness], path: params[:path]).merge(refresh_channel: rc)
    if params[:refresh] && response[:responses].blank?
      if params[:sync]
        $redis.setex(rc, 10, 0)
      end
      datagram.publish(params[:params] || {})
      if params[:sync]
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
        response = datagram.response_json(params: params[:params], as_of: params[:as_of], path: params[:path]).merge(refresh_channel: rc)
      end
    end
    response
  end

  def _render(json, view)
    v = DatagramViewLoader.new(datagram, view).load
    return ViewRenderer.new(v, json, params, filename(view)).render
  end

  def filename(view)
    "#{datagram.refresh_channel(params)}-#{view}.png"
  end

end
