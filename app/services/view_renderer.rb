class ViewRenderer

  def initialize(view, json, params)
    @view = view
    @json = json.deep_stringify_keys!
    @params = params
  end

  def render
    renderer.render(view, json, params)
  end

  private
  attr_reader :view, :json, :params
  def renderer
    Kernel.const_get("ViewRenderer::" + view["type"].titleize)
  end

  class Jq
    def self.render(v, json, params)
      ap v, json
      json.jq(v["template"])[0]
    end
  end

  class Liquid
    def self.render(v, json, params)
      html = ::Liquid::Template.parse(v["template"]).render(json, params).html_safe
      if params["format"] == "html"
        return html
      elsif params["format"] == "png"
        x = SecureRandom.urlsafe_base64(5)
        File.open("/tmp/#{x}.html","w") {|f| f.write(html) }
        `wkhtmltoimage /tmp/#{x}.html /tmp/#{x}.png`
        return "/tmp/#{x}.png"
      end
    end
  end

  class Pivot
    def self.render(v, json, params)
      pt = PivotTable.new(json, params)
      pt.render(v["template"].symbolize_keys)
    end
  end

  class Chart
    def self.render(v, json, params)
      d = _render(json,v["template"])
      i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{JSON.dump(d)}&type=image/png")
      AWS::S3::S3Object.store(filename(view),i,'dg-tmp')
      {url: "https://s3.amazonaws.com/dg-tmp/#{filename(view)}"}
    end
  end

end
