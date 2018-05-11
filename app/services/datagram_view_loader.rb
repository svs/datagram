class DatagramViewLoader

  def initialize(datagram, view)
    @datagram = datagram
    @view = view
  end

  def load
    View.new(datagram_view_of_same_name)
  end

  private
  attr_reader :datagram, :view
  def datagram_view_of_same_name
    v = datagram.views.find{|v| v["name"] == view} rescue nil
  end
end
