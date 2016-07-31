class DatagramViewLoader

  def initialize(datagram, view)
    @datagram = datagram
    @view = view
  end

  def load
    binding.pry
    datagram_view_of_same_name || read_from_file || view_is_the_view
  end

  private
  attr_reader :datagram, :view
  def datagram_view_of_same_name
    v = datagram.views[view] rescue nil
  end

  def view_is_the_view
    view
  end

  def read_from_file
    begin
      v = ((datagram.views[view] || {}) rescue {})
      if v["template"] =~ URI::regexp
        file_name = v["template"].gsub("file://","").gsub(/^A\./,Rails.root.to_s)
      else
        file_name = File.join(Rails.root, "templates", "#{datagram.id.to_s}-#{view}")
      end
      v["template"] = open(file_name).read
      v["type"] ||= view.split(".")[1]
      return v
    rescue Exception => e
    end
  end

end
