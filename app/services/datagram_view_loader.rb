class DatagramViewLoader

  def initialize(datagram, view)
    @datagram = datagram
    @view = view
  end

  def load
    datagram_view_of_same_name || read_from_file || view_is_the_view
  end

  private
  attr_reader :datagram, :view
  def datagram_view_of_same_name
    v = datagram.views[view]
    (v["template"] =~ URI::regexp || v.blank? || v["template"].blank?) ? nil : v
  end

  def view_is_the_view
    view
  end

  def read_from_file
    begin
      (datagram.views[view] || {}).tap {|v|
        if v["template"] =~ URI::regexp
          file_name = v["template"].gsub("file://","").gsub(/^A\./,Rails.root.to_s)
        else
          file_name = File.join(Rails.root, "templates", datagram.id, "-", view)
        end
        v["template"] = open(file_name).read
        v["type"] ||= view.split(".")[1]
      }
    rescue Exception => e
      ap e.message
      nil
    end
  end

end
