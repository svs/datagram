class DatagramResponseHandler

  def initialize(params)
    @params = params
  end

  def handle!
    wrs = @params["responses"].map do |watch|
      WatchResponseHandler.new(watch).handle!
    end
    {token: params["datagram_id"], responses: wrs, modified: wrs.map{|w| w[:modified]}.any?}
  end

  private

  attr_reader :params





end
