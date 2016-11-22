
class DatagramService

  def initialize(datagram, params = {})
    @datagram = datagram
    @params = params
    @views = views
  end

  def render(views = [])
    @views = views
    compare_response ? response.merge(compare_data: compare_response) : response
  end


  private
  attr_reader :datagram, :views

  def response
    ap "#DatagramService params"
    ap params
    @response ||= DatagramRenderService.new(datagram, params).render(views)
  end

  def compare_params
    @params[:compare_params] ? params.merge(params: @params[:compare_params]) : nil
  end

  def params
    if !@params[:params].is_a?(Hash)
      @params[:params] = datagram.param_sets.fetch(@params["param_set"], datagram.param_sets["__default"])["params"]
    end
    @params.except(:compare_params).with_indifferent_access
  end

  def compare_response
    if compare_params
      @compare_response ||= DatagramRenderService.new(datagram, compare_params).render(views)
    end
  end


end
