class ViewRenderer

  def initialize(view, json, params, filename)
    ap view
    @view = view
    @json = json.deep_stringify_keys!
    @params = params
    @filename = filename
  end

  def render
    renderer.render(view, json, params, filename)
  end

  private
  attr_reader :view, :json, :params, :filename
  def renderer
    type = view == "chart" ? "chart" : view["type"]
    Kernel.const_get("ViewRenderer::" + type.titleize)
  end

  class Jq
    def self.render(v, json, params, filename)
      ap v, json
      json.jq(v["template"])[0]
    end
  end

  class Liquid
    def self.render(v, json, params, filename)
      ap json
      ap params
      html = ::Liquid::Template.parse(v["template"]).render(json.merge("_params" => params)).html_safe
      if params["format"] != "png"
        return html
      elsif params["format"] == "png"
        x = SecureRandom.urlsafe_base64(5)
        File.open("/tmp/#{x}.html","w") {|f| f.write(html) }
        if params["width"]
          `wkhtmltoimage --width #{params["width"]} --disable-smart-width --quality 50 /tmp/#{x}.html /tmp/#{x}.png`
        else
          `wkhtmltoimage /tmp/#{x}.html /tmp/#{x}.png`
        end
        AWS::S3::S3Object.store(filename,open("/tmp/#{x}.png"),'dg-tmp')
        return {url: "https://s3.amazonaws.com/dg-tmp/#{filename}"}
      end
    end
  end

  class Pivot
    def self.render(v, json, params, filename)
      pt = PivotTable.new(json, params)
      pt.render(v["template"].symbolize_keys)
    end
  end

  class Chart
    def self.render(v, json, params, filename)
      i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{JSON.dump(json)}&type=image/png")
      AWS::S3::S3Object.store(filename,i,'dg-tmp')
      {url: "https://s3.amazonaws.com/dg-tmp/#{filename}"}
    end
  end

end
