class DatagramRenderService

  # Given a datagram and params, this class renders the response.
  # It calls the appropriate view loader and view renderers to do this.
  # If a synchronous refresh is required it handles the complexity around that.

  def initialize(dfs)
    raise ArgumentError unless dfs.is_a?(DatagramFetcherService)
    @dfs = dfs
    @datagram = dfs.datagram
    @params = dfs.params
    @format = dfs.params.format
  end

  def render(views = [])
    Array(views).compact.reduce(raw_json){|result, view| result = _render(result, view)}
  end

  def last_view
    DatagramViewLoader.new(datagram, view).load
  end


  attr_reader :dfs, :datagram, :format, :params, :last_filename

  def raw_json
    dfs.raw_json
  end

  def _render(json, view)
    v = DatagramViewLoader.new(datagram, view).load
    return ViewRenderer.new(v, json, params, filename(view)).render
  end

  def filename(view)
    "#{datagram.refresh_channel(params.q_params)}-#{view}-#{datagram.last_update_timestamp}.png".tap{|x|
      @last_filename = x
    }
  end

end
