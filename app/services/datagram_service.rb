
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
    @response ||= DatagramRenderService.new(datagram, params).render(views)
  end

  def compare_params
    @params[:compare_params] ? params.merge(params: @params[:compare_params]) : nil
  end

  def params
    @params.except(:compare_params)
  end

  def compare_response
    if compare_params
      @compare_response ||= DatagramRenderService.new(datagram, compare_params).render(views)
    end
  end


end
