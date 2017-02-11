class ViewRenderer

  def initialize(view, json, params, filename)
    @view = view
    @json = json.deep_stringify_keys!
    @params = params
    @filename = filename
  end



  def render
    renderer.render(transform, params, filename)
  end

  def transform
    transformer.transform(view, json, params)
  end

  private
  attr_reader :view, :json, :params, :filename
  def renderer
    Kernel.const_get("ViewRenderer::Render" + view["render"].titleize.gsub(" ",""))
  end

  def transformer
    if view["transform"].blank?
      ViewRenderer::NullTransformer
    else
      Kernel.const_get("ViewRenderer::Transform" + view["transform"].titleize.gsub(" ",""))
    end
  end

  class NullTransformer
    def self.transform(v, json, params)
      [v,json]
    end
  end

  class TransformJq
    def self.transform(v, json, params)
      json.jq(v["template"])[0]
    end
  end

  class TransformJmespath
    def self.transform(v, json, params)
      JMESPath.search(v["template"], json)
    end
  end

  class TransformLiquid
    def self.transform(v, json, params)
      r = ::Liquid::Template.parse(v["template"]).render(json.merge(params: params)).html_safe
    end
  end

  class RenderChart
    def self.render(json,params,filename)
      if params.format == "png"
        j = JSON.dump(json)
        i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{j}&type=image/png")
        AWS::S3::S3Object.store(filename,i,'dg-tmp')
        return {url: "https://s3.amazonaws.com/dg-tmp/#{filename}"}
      else
        return json
      end
    end
  end

  class RenderJson
    def self.render(json,params,filename)
      return json
    end
  end

  class RenderAgGrid < RenderJson
  end

  class RenderCsv < RenderJson
    def self.render(json, params, filename)
      super
    end
  end

  class RenderHtml
    def self.render(html, params, filename)
      if params.format != "png"
        return {html: html}
      elsif params.format == "png"
        x = SecureRandom.urlsafe_base64(5)
        File.open("/tmp/#{x}.html","w") {|f| f.write(html) }
        `wkhtmltoimage /tmp/#{x}.html /tmp/#{x}.png`
        AWS::S3::S3Object.store(filename,open("/tmp/#{x}.png"),'dg-tmp')
        return {url: "https://s3.amazonaws.com/dg-tmp/#{filename}"}
      end
    end
  end
end
