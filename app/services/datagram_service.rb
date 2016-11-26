
class DatagramService

  # params here is the actual controller params object. It is required as it contains the return format (png, csv, etc)

  def initialize(datagram, params = {})
    @datagram = datagram
    @params = params.with_indifferent_access
    ap params
  end

  def render(views = [])
    @views = Array(views)
    response.tap{|r|
      if r[:url] && default_params?
        datagram.update(default_view_url: r[:url])
      end
    }
  end


  private
  attr_reader :datagram, :views

  def response
    @response ||= DatagramRenderService.new(datagram, params).render(views)
  end

  def default_params?
    params[:params] == datagram.param_sets["__default"]["params"]
  end

  def params
    if !@params[:params].is_a?(Hash)
      @params = datagram.param_sets.fetch(@params["param_set"], datagram.param_sets["__default"])["params"]
    end
    (@params || {}).with_indifferent_access
  end



end
