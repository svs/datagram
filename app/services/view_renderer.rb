class ViewRenderer

  def initialize(view, json, params, filename)
    @view = view
    @json = json.deep_stringify_keys!
    @params = params
    @filename = filename
  end


  def render
    renderer.new(self).render
  end

  def transform
    transformer.transform(view, json, params)
  end
  attr_reader :view, :json, :params, :filename

  private
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
    def self.transform(v, json, params = null)
      begin
        x = json.jq(v["template"])[0]
      rescue Exception => e
        {error: e.message}
      end
    end
  end

  class TransformJmespath
    def self.transform(v, json, params)
      JMESPath.search(v["template"], json)
    end
  end

  class TransformHandlebars
    def self.transform(v, json, params)
      ap [v, json, params]
      handlebars = Handlebars::Context.new
      template = handlebars.compile(v["template"])
      template.call(json)
    end
  end


  class Render
    def initialize(view_renderer)
      @view_renderer = view_renderer
    end
    attr_reader :view_renderer

    delegate :params, to: :view_renderer
    delegate :filename, to: :view_renderer
    delegate :view, to: :view_renderer

    def json
      view_renderer.transform
    end

    def render
      return json
    end

  end

  class RenderHighcharts < Render
    def render
      if params.format == "png"
        j = JSON.dump(json)
        i = ::RestClient.post('http://export.highcharts.com/',"content=options&options=#{j}&type=image/jpeg")
        s3 = Aws::S3::Resource.new
        s3.put_object(key: filename,body: i, bucket: 'dg-tmp')
        return {url: "https://s3.amazonaws.com/dg-tmp/#{filename}"}
      else
        return json
      end
    end
  end

  class RenderJson < Render
  end

  class RenderAgGrid < Render
    def render
      super.merge(gridOptions: view["gridOptions"])
    end

  end

  class RenderTaucharts < Render
    def render
      view["tauChartsOptions"]["tco"].merge({data: super})
    end

  end



  class RenderPivot < Render
    def render
      return {data: json, config: config}
    end

    def config
      Hash[view["pivotOptions"].slice("aggregatorName","cols","rows","vals","rendererName").map{|k,v| [k, v ? v : []]}]
    end
  end

  class RenderCsv < Render
  end

  class RenderHtml < Render
  end
end
