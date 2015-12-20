
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
    ap view
    ap Dir.pwd
    json.deep_stringify_keys!
    v = ((datagram.views[view] || view) rescue (JSON.parse(datagram.views[view]))).with_indifferent_access
    if v["template"] =~ URI::regexp
      v["template"] = open(v["template"].gsub("file://","")).read
    end
    if v["type"] == "jq"
      return json.jq(v["template"])[0]
    end
    if v["type"] == "liquid"
      html = Liquid::Template.parse(v["template"]).render(json).html_safe
      if params["format"] == "html"
        return html
      elsif params["format"] == "png"
        x = SecureRandom.urlsafe_base64(5)
        File.open("/tmp/#{x}.html","w") {|f| f.write(html) }
        `wkhtmltoimage /tmp/#{x}.html /tmp/#{x}.png`
        return "/tmp/#{x}.png"
      end
    end
    if v["type"] == "pivot"
      pt = PivotTable.new(json)
      pt.render(v["template"].symbolize_keys)
    end
    if v["type"] == "chart"
      d = _render(json,v["template"])
      i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{JSON.dump(d)}&type=image/png")
      AWS::S3::S3Object.store(filename(view),i,'dg-tmp')
      {url: "https://s3.amazonaws.com/dg-tmp/#{filename(view)}"}
    end
  end

  def filename(view)
    "#{datagram.refresh_channel(params)}-#{view}.png"
  end

end
