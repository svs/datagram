class PivotTable

  def initialize(data)
    @data = data
  end

  def render(row_attr: nil, col_attr: nil, data_attr: nil, fn: nil)
    rows = data.group_by{|a| a.send(row_attr)}
    cols = Hash[rows.map{|k,v| [k,v.group_by{|a| a.send(col_attr)}]}]
    Hash[cols.map{|k,v| [k,Hash[v.map{|a,b| [a, b.map{|f| f.send(data_attr)}.send(fn)]}]]}]
  end

  private

  def data
    @_data ||= @data.map{|d| OpenStruct.new(d)}
  end

end
