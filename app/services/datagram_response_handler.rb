class DatagramResponseHandler

  def initialize(params)
    @params = params
    Rails.logger.info "#DataGramResponsehandler processing #{params[:datagram_id]}"
  end

  def handle!
    wrs = params["responses"].map do |watch|
      WatchResponseHandler.new(watch).handle!
    end
    datagram.update(last_update_timestamp: params[:timestamp]) if datagram
    {token: params["datagram_id"], responses: wrs, modified: wrs.map{|w| w[:modified]}.any?}
  end

  private


  def datagram
    return @datagram if @datagram
    @datagram = Datagram.where('token = ? AND (last_update_timestamp < ? OR last_update_timestamp is null)', params[:datagram_id], params[:timestamp]).last
  end

  def params
    @params.with_indifferent_access
  end






end
