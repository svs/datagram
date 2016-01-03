class WatchParamsRenderer
  # renders watch data to a hash, replacing params with provided data
  # and rendering dates where required

  def initialize(watch, params = {})
    params = params.stringify_keys if params
    @watch, @params = watch, params
    @params = params.blank? ? (watch.params || {}) : (watch.params || {}).merge(params) # should use watch parameters when no parameters provided

  end

  def render
    replace_dates && render_mustache
  end

  def real_params
    replace_dates
  end
  private

  attr_reader :watch, :params

  def render_mustache
    @result = watch.data ?JSON.parse(::Mustache.render(JSON.dump(watch.data), params).gsub("\\n"," ").gsub("&#39;","'")) : watch.data
  end

  def replace_dates
    @params = Hash[
      params.map{|k,v|
        [k, render_date(v)]
      }
    ]
  end

  def render_date(v)
    match_data, direction, value, type, snap = v.match(/\A\[\[([[+-]])(\d+)([[dwm]])([[\<\>]]?)\]\]/).to_a # extracts [[-1w<]] into ["-","1","w","<"]
    return v unless match_data
    dur = ActiveSupport::Duration.new(
      Time.now,
      {
        {"w" => :weeks, "m" => :months, "d" => :days}[type] => value.to_i
      }
    )

    date = dur.send({"+" => "since", "-" => "ago"}[direction]).tap{|dt|
      if ["<",">"].include?(snap)
        dt = dt.send({"<" => "beginning", ">" => "end"}[snap] + "_of_" + {"w" => "week", "m" => "month"}[type])
      end
    }.strftime('%Y-%m-%d')

  end

end
