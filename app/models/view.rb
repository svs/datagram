class View < OpenStruct
  def layout_file
    render == "html" ? transform : render
  end

  def template_file
    render == "html" ? transform : render
  end


end
