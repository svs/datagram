class WatchParamsRenderer
  def initialize(watch, params = {})
    params = params.stringify_keys if params
    @watch, @params = watch, params
    @params = params.blank? ? (watch.params || {}) : (watch.params || {}).merge(params) # should use watch parameters when no parameters provided

  end

  def render
    param_renderer.render
  end

  def real_params
    param_renderer.real_data
  end

  private

  attr_reader :watch, :params

  def param_renderer
    @param_renderer ||= ParamsRenderer.new(watch.data, params)
  end
end
