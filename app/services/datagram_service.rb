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
    v = ((datagram.views[view] || view) rescue (JSON.parse(datagram.views[view]))).with_indifferent_access
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
    if v["type"] == "chart"
      d = _render(json,v["template"])
      i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{JSON.dump(d)}&type=image/png")
      AWS::S3::S3Object.store(filename(view),i,'dg-tmp')
      {url: "https://s3.amazonaws.com/dg-tmp/#{filename(view)}?rand=#{rand(100000)}"}
    end
  end

  def filename(view)
    "#{datagram.refresh_channel(params)}-#{view}.png"
  end

end
