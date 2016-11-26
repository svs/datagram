
class DatagramService

  # params here is the actual controller params object. It is required as it contains the return format (png, csv, etc)

  def initialize(datagram, params = {})
    @datagram = datagram
    @params = params
    ap params
  end

  def render(views = [])
    @views = Array(views)
    response
  end


  private
  attr_reader :datagram, :views

  def response
    ap "#DatagramService params"
    ap params
    @response ||= DatagramRenderService.new(datagram, params).render(views)
  end

  def params
    if !@params[:params].is_a?(Hash)
      @params = datagram.param_sets.fetch(@params["param_set"], datagram.param_sets["__default"])["params"]
    end
    @params.with_indifferent_access
  end



end
