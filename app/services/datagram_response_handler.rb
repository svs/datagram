class DatagramResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!
    binding.pry
    wrs = @params["responses"].map do |watch|
      WatchResponseHandler.new(watch).handle!
    end
    {token: params["datagram_id"], responses: wrs}
  end

  private

  attr_reader :params





end
