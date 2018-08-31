class DatagramCloner

  def initialize(datagram)
    @original = datagram
  end

  def clone!
    @cloned = Datagram.new(attributes)
    @cloned.save ? @cloned : @cloned.errors
  end

  private

  def attributes
    attributes = @original.attributes.except("id","token","slug").tap{|a|
      a["name"] = a["name"] + " (cloned)"
    }
  end
end
