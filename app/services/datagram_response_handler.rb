class DatagramResponseHandler

  def initialize(params)
    @params = params
    Rails.logger.info "#DataGramResponsehandler processing #{params[:datagram_id]}"
  end

  def handle!
    wrs = params["responses"].map do |watch|
      WatchResponseHandler.new(watch).handle!
    end
    datagram.update(last_update_timestamp: params[:timestamp])
    {token: params["datagram_id"], responses: wrs, modified: wrs.map{|w| w[:modified]}.any?}
  end

  private


  def datagram
    return @datagram if @datagram
    c1 = Datagram.where(:id => params[:datagram_id])
    @datagram = (c1.where(:last_update_timestamp.lt => params[:timestamp]) | c1.where(:last_update_timestamp => nil)).first
  end

  def params
    @params.with_indifferent_access
  end






end
