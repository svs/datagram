class DatagramService

  def initialize(datagram, params = {})
    @datagram = datagram
    @params = params
  end

  def render(views = [])
    Array(views).compact.reduce(raw_json){|result, view| result = _render(result, view)}
  end



  attr_reader :datagram, :params

  def raw_json
    rc = datagram.refresh_channel(params[:params])
    response = datagram.response_json(params: params[:params],
                                      as_of: params[:as_of],
                                      staleness: params[:staleness]).merge(refresh_channel: rc)
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
    v = datagram.views[view] || view
    if v["type"] == "jq"
      return json.jq(v["template"])[0]
    end
    if v["type"] == "liquid"
      return Liquid::Template.parse(v["template"]).render(json).html_safe
    end
    if v["type"] == "pivot"
      pt = PivotTable.new(json)
      pt.render(v["template"].symbolize_keys)
    end
  end

end
